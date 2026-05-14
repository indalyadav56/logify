package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/indalyadav56/logify/apps/backend/internal/role/domain"
)

// pgUniqueViolation is the SQLSTATE for a UNIQUE constraint violation.
// See: https://www.postgresql.org/docs/current/errcodes-appendix.html
const pgUniqueViolation = "23505"

// roleRepository is a PostgreSQL-backed implementation of domain.RoleRepository.
type roleRepository struct {
	db *pgxpool.Pool
}

// NewRoleRepository constructs a roleRepository backed by the given pool.
func NewRoleRepository(db *pgxpool.Pool) domain.RoleRepository {
	return &roleRepository{db: db}
}

// allowedRoleSort whitelists sort columns to prevent SQL injection via
// user-supplied query parameters.
var allowedRoleSort = map[string]string{
	"created_at": "created_at",
	"updated_at": "updated_at",
	"name":       "name",
}

func normalizeListFilter(f domain.ListFilter) (page, perPage int, sortCol, sortDir string) {
	page = f.Page
	if page < 1 {
		page = 1
	}
	perPage = f.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}
	sortCol = allowedRoleSort[strings.ToLower(strings.TrimSpace(f.SortBy))]
	if sortCol == "" {
		sortCol = "created_at"
	}
	sortDir = strings.ToLower(strings.TrimSpace(f.SortDir))
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "desc"
	}
	return
}

func (r *roleRepository) Create(ctx context.Context, role *domain.Role) error {
	return withTx(ctx, r.db, func(tx pgx.Tx) error {
		const insertRole = `
			INSERT INTO roles (id, tenant_id, name, description, is_system, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`
		_, err := tx.Exec(ctx, insertRole,
			role.ID,
			role.TenantID,
			role.Name,
			nullableText(role.Description),
			role.IsSystem,
			role.CreatedAt,
			role.UpdatedAt,
		)
		if err != nil {
			return mapUniqueViolation(err)
		}

		if len(role.Permissions) == 0 {
			return nil
		}
		return bulkInsertPermissions(ctx, tx, role.ID, role.Permissions)
	})
}

func (r *roleRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Role, error) {
	const q = `
		SELECT id, tenant_id, name, COALESCE(description, ''), is_system, created_at, updated_at
		FROM roles
		WHERE id = $1
	`
	row := r.db.QueryRow(ctx, q, id)

	var role domain.Role
	if err := row.Scan(
		&role.ID, &role.TenantID, &role.Name, &role.Description, &role.IsSystem,
		&role.CreatedAt, &role.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrRoleNotFound
		}
		return nil, err
	}

	perms, err := r.ListPermissions(ctx, role.ID)
	if err != nil {
		return nil, err
	}
	role.Permissions = perms
	return &role, nil
}

func (r *roleRepository) Update(ctx context.Context, role *domain.Role) error {
	const q = `
		UPDATE roles
		SET name = $2,
		    description = $3,
		    updated_at = (now() AT TIME ZONE 'utc')
		WHERE id = $1
	`
	tag, err := r.db.Exec(ctx, q, role.ID, role.Name, nullableText(role.Description))
	if err != nil {
		return mapUniqueViolation(err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoleNotFound
	}
	return nil
}

func (r *roleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	const q = `DELETE FROM roles WHERE id = $1`
	tag, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoleNotFound
	}
	return nil
}

func (r *roleRepository) List(ctx context.Context, f domain.ListFilter) ([]*domain.Role, int64, error) {
	page, perPage, sortCol, sortDir := normalizeListFilter(f)
	offset := (page - 1) * perPage

	var (
		conds []string
		args  []any
	)
	add := func(cond string, val any) {
		args = append(args, val)
		conds = append(conds, fmt.Sprintf(cond, len(args)))
	}

	switch {
	case f.TenantID != nil && f.IncludeGlobal:
		add("(tenant_id = $%d OR tenant_id IS NULL)", *f.TenantID)
	case f.TenantID != nil:
		add("tenant_id = $%d", *f.TenantID)
	case !f.IncludeGlobal:
		// Restrict to tenant-scoped (non-global) roles when caller does not
		// opt in. By default we surface everything; flip this if you want
		// stricter isolation.
	}

	if s := strings.TrimSpace(f.Search); s != "" {
		add("LOWER(name) LIKE '%%' || LOWER($%d) || '%%'", s)
	}
	if f.IsSystem != nil {
		add("is_system = $%d", *f.IsSystem)
	}

	where := ""
	if len(conds) > 0 {
		where = "WHERE " + strings.Join(conds, " AND ")
	}

	var total int64
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM roles %s`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	if total == 0 {
		return []*domain.Role{}, 0, nil
	}

	args = append(args, perPage, offset)
	listQuery := fmt.Sprintf(`
		SELECT id, tenant_id, name, COALESCE(description, ''), is_system, created_at, updated_at
		FROM roles
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, where, sortCol, sortDir, len(args)-1, len(args))

	rows, err := r.db.Query(ctx, listQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	roles := make([]*domain.Role, 0)
	ids := make([]uuid.UUID, 0)
	for rows.Next() {
		var role domain.Role
		if err := rows.Scan(
			&role.ID, &role.TenantID, &role.Name, &role.Description,
			&role.IsSystem, &role.CreatedAt, &role.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		roles = append(roles, &role)
		ids = append(ids, role.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	// Bulk-load permissions for all returned roles to avoid N+1.
	if len(ids) > 0 {
		permsByRole, err := r.permissionsForRoles(ctx, ids)
		if err != nil {
			return nil, 0, err
		}
		for _, role := range roles {
			role.Permissions = permsByRole[role.ID]
		}
	}

	return roles, total, nil
}

func (r *roleRepository) ListPermissions(ctx context.Context, roleID uuid.UUID) ([]domain.Permission, error) {
	const q = `
		SELECT resource, action
		FROM role_permissions
		WHERE role_id = $1
		ORDER BY resource ASC, action ASC
	`
	rows, err := r.db.Query(ctx, q, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	perms := make([]domain.Permission, 0)
	for rows.Next() {
		var p domain.Permission
		if err := rows.Scan(&p.Resource, &p.Action); err != nil {
			return nil, err
		}
		perms = append(perms, p)
	}
	return perms, rows.Err()
}

func (r *roleRepository) AddPermission(ctx context.Context, roleID uuid.UUID, perm domain.Permission) error {
	const q = `
		INSERT INTO role_permissions (role_id, resource, action)
		VALUES ($1, $2, $3)
		ON CONFLICT (role_id, resource, action) DO NOTHING
	`
	if _, err := r.db.Exec(ctx, q, roleID, perm.Resource, perm.Action); err != nil {
		if isForeignKeyViolation(err) {
			return domain.ErrRoleNotFound
		}
		return err
	}
	return nil
}

func (r *roleRepository) RemovePermission(ctx context.Context, roleID uuid.UUID, perm domain.Permission) error {
	const q = `
		DELETE FROM role_permissions
		WHERE role_id = $1 AND resource = $2 AND action = $3
	`
	tag, err := r.db.Exec(ctx, q, roleID, perm.Resource, perm.Action)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrPermissionNotFound
	}
	return nil
}

func (r *roleRepository) ReplacePermissions(ctx context.Context, roleID uuid.UUID, perms []domain.Permission) error {
	return withTx(ctx, r.db, func(tx pgx.Tx) error {
		var exists bool
		if err := tx.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM roles WHERE id = $1)`, roleID).Scan(&exists); err != nil {
			return err
		}
		if !exists {
			return domain.ErrRoleNotFound
		}

		if _, err := tx.Exec(ctx, `DELETE FROM role_permissions WHERE role_id = $1`, roleID); err != nil {
			return err
		}
		if len(perms) == 0 {
			return nil
		}
		return bulkInsertPermissions(ctx, tx, roleID, perms)
	})
}

// --- helpers ---

// permissionsForRoles bulk-loads permissions for the provided role IDs and
// returns them grouped by role_id.
func (r *roleRepository) permissionsForRoles(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID][]domain.Permission, error) {
	const q = `
		SELECT role_id, resource, action
		FROM role_permissions
		WHERE role_id = ANY($1)
		ORDER BY role_id, resource, action
	`
	rows, err := r.db.Query(ctx, q, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make(map[uuid.UUID][]domain.Permission, len(ids))
	for rows.Next() {
		var (
			id uuid.UUID
			p  domain.Permission
		)
		if err := rows.Scan(&id, &p.Resource, &p.Action); err != nil {
			return nil, err
		}
		out[id] = append(out[id], p)
	}
	return out, rows.Err()
}

// bulkInsertPermissions inserts a set of permissions for a role using a single
// multi-row INSERT. Conflicts on the composite PK are silently ignored so
// callers may pass duplicates safely.
func bulkInsertPermissions(ctx context.Context, tx pgx.Tx, roleID uuid.UUID, perms []domain.Permission) error {
	if len(perms) == 0 {
		return nil
	}
	var (
		placeholders = make([]string, 0, len(perms))
		args         = make([]any, 0, len(perms)*3)
	)
	for i, p := range perms {
		base := i * 3
		placeholders = append(placeholders, fmt.Sprintf("($%d, $%d, $%d)", base+1, base+2, base+3))
		args = append(args, roleID, p.Resource, p.Action)
	}
	query := fmt.Sprintf(
		`INSERT INTO role_permissions (role_id, resource, action) VALUES %s
		 ON CONFLICT (role_id, resource, action) DO NOTHING`,
		strings.Join(placeholders, ", "),
	)
	_, err := tx.Exec(ctx, query, args...)
	return err
}

// withTx runs fn inside a serializable transaction, committing on success
// and rolling back on error or panic.
func withTx(ctx context.Context, db *pgxpool.Pool, fn func(pgx.Tx) error) (err error) {
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback(ctx)
			panic(p)
		}
		if err != nil {
			_ = tx.Rollback(ctx)
			return
		}
		err = tx.Commit(ctx)
	}()
	return fn(tx)
}

// nullableText returns nil for an empty string so the column receives SQL NULL
// instead of an empty string.
func nullableText(s string) any {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}

// mapUniqueViolation converts a PostgreSQL unique-violation into a domain error.
func mapUniqueViolation(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == pgUniqueViolation {
		return domain.ErrRoleAlreadyExists
	}
	return err
}

// isForeignKeyViolation reports whether err is a PG FK violation (SQLSTATE 23503).
func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23503" {
		return true
	}
	return false
}
