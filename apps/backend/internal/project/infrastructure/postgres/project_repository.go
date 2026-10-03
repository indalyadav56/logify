package postgres

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	pg "github.com/indalyadav56/logify/apps/backend/pkg/postgres"

	"github.com/indalyadav56/logify/apps/backend/internal/project/domain"
)

const pgUniqueViolation = "23505"

type projectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) domain.ProjectRepository {
	return &projectRepository{db: db}
}

func (r *projectRepository) Create(ctx context.Context, project *domain.Project) error {
	const query = `
		INSERT INTO projects (tenant_id, name, description, created_by)
		VALUES ($1, $2, $3, $4)
		RETURNING id, COALESCE(description, ''), created_at, updated_at
	`
	err := pg.ExecutorFromContext(ctx, r.db).QueryRow(ctx, query,
		project.TenantID,
		project.Name,
		nullableText(project.Description),
		project.CreatedBy,
	).Scan(
		&project.ID,
		&project.Description,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if err != nil {
		return mapUniqueViolation(err)
	}
	return nil
}

func (r *projectRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Project, error) {
	const query = `
		SELECT id, tenant_id, name, COALESCE(description, ''), created_at, updated_at
		FROM projects
		WHERE id = $1
	`
	var ws domain.Project
	err := pg.ExecutorFromContext(ctx, r.db).QueryRow(ctx, query, id).Scan(
		&ws.ID,
		&ws.TenantID,
		&ws.Name,
		&ws.Description,
		&ws.CreatedAt,
		&ws.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrProjectNotFound
		}
		return nil, err
	}
	return &ws, nil
}

func (r *projectRepository) List(ctx context.Context, tenantID *uuid.UUID) ([]*domain.Project, error) {
	const baseQuery = `
		SELECT id, tenant_id, name, COALESCE(description, ''), created_at, updated_at
		FROM projects
	`
	query := baseQuery + " ORDER BY created_at DESC"
	args := []any{}
	if tenantID != nil {
		query = baseQuery + " WHERE tenant_id = $1 ORDER BY created_at DESC"
		args = append(args, *tenantID)
	}

	rows, err := pg.ExecutorFromContext(ctx, r.db).Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*domain.Project, 0)
	for rows.Next() {
		var ws domain.Project
		if err := rows.Scan(
			&ws.ID,
			&ws.TenantID,
			&ws.Name,
			&ws.Description,
			&ws.CreatedAt,
			&ws.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, &ws)
	}
	return out, rows.Err()
}

func (r *projectRepository) Update(ctx context.Context, ws *domain.Project) error {
	const query = `
		UPDATE projects
		SET name = $2,
		    description = $3,
		    updated_at = (now() AT TIME ZONE 'utc')
		WHERE id = $1
	`
	tag, err := pg.ExecutorFromContext(ctx, r.db).Exec(ctx, query, ws.ID, ws.Name, nullableText(ws.Description))
	if err != nil {
		return mapUniqueViolation(err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrProjectNotFound
	}
	return nil
}

func (r *projectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	const query = `DELETE FROM projects WHERE id = $1`
	tag, err := pg.ExecutorFromContext(ctx, r.db).Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrProjectNotFound
	}
	return nil
}

// nullableText returns nil for an empty/whitespace string so the column
// receives SQL NULL instead of an empty string.
func nullableText(s string) any {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}

// mapUniqueViolation translates a PostgreSQL unique-constraint violation into
// the corresponding domain error.
func mapUniqueViolation(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == pgUniqueViolation {
		return domain.ErrProjectAlreadyExists
	}
	return err
}

const accessibleProjects = `
 SELECT p.id, p.tenant_id, p.name, COALESCE(p.description, ''), p.created_by, p.created_at, p.updated_at,
 CASE WHEN p.created_by = $1 THEN 'owner' ELSE m.role END
 FROM projects p
 JOIN auth.users actor ON actor.id = $1 AND actor.is_active AND actor.deleted_at IS NULL
 JOIN auth.users owner ON owner.id = p.created_by AND owner.is_active AND owner.deleted_at IS NULL
 LEFT JOIN project_team_members m ON m.project_id = p.id AND m.user_id = $1
 WHERE p.status = 'active' AND p.deleted_at IS NULL AND (p.created_by = $1 OR m.user_id IS NOT NULL)`

func (r *projectRepository) GetForUser(ctx context.Context, id, userID uuid.UUID) (*domain.Project, error) {
	var p domain.Project
	err := pg.ExecutorFromContext(ctx, r.db).QueryRow(ctx, accessibleProjects+" AND p.id = $2", userID, id).
		Scan(&p.ID, &p.TenantID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt, &p.UpdatedAt, &p.Role)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrProjectNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *projectRepository) ListForUser(ctx context.Context, userID uuid.UUID) ([]*domain.Project, error) {
	rows, err := pg.ExecutorFromContext(ctx, r.db).Query(ctx, accessibleProjects+" ORDER BY p.created_at DESC, p.id DESC", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]*domain.Project, 0)
	for rows.Next() {
		var p domain.Project
		if err := rows.Scan(&p.ID, &p.TenantID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt, &p.UpdatedAt, &p.Role); err != nil {
			return nil, err
		}
		result = append(result, &p)
	}
	return result, rows.Err()
}
