package postgres

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/indalyadav56/logify/apps/backend/internal/workspace/domain"
)

// pgUniqueViolation is the SQLSTATE for a UNIQUE constraint violation.
// See: https://www.postgresql.org/docs/current/errcodes-appendix.html
const pgUniqueViolation = "23505"

type workspaceRepository struct {
	db *pgxpool.Pool
}

// NewWorkspaceRepository constructs a PostgreSQL-backed workspace repository.
func NewWorkspaceRepository(db *pgxpool.Pool) domain.WorkspaceRepository {
	return &workspaceRepository{db: db}
}

func (r *workspaceRepository) Create(ctx context.Context, ws *domain.Workspace) error {
	const query = `
		INSERT INTO workspaces (id, tenant_id, name, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(ctx, query,
		ws.ID,
		ws.TenantID,
		ws.Name,
		nullableText(ws.Description),
		ws.CreatedAt,
		ws.UpdatedAt,
	)
	if err != nil {
		return mapUniqueViolation(err)
	}
	return nil
}

func (r *workspaceRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Workspace, error) {
	const query = `
		SELECT id, tenant_id, name, COALESCE(description, ''), created_at, updated_at
		FROM workspaces
		WHERE id = $1
	`
	var ws domain.Workspace
	err := r.db.QueryRow(ctx, query, id).Scan(
		&ws.ID,
		&ws.TenantID,
		&ws.Name,
		&ws.Description,
		&ws.CreatedAt,
		&ws.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrWorkspaceNotFound
		}
		return nil, err
	}
	return &ws, nil
}

func (r *workspaceRepository) List(ctx context.Context, tenantID *uuid.UUID) ([]*domain.Workspace, error) {
	const baseQuery = `
		SELECT id, tenant_id, name, COALESCE(description, ''), created_at, updated_at
		FROM workspaces
	`
	query := baseQuery + " ORDER BY created_at DESC"
	args := []any{}
	if tenantID != nil {
		query = baseQuery + " WHERE tenant_id = $1 ORDER BY created_at DESC"
		args = append(args, *tenantID)
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*domain.Workspace, 0)
	for rows.Next() {
		var ws domain.Workspace
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

func (r *workspaceRepository) Update(ctx context.Context, ws *domain.Workspace) error {
	const query = `
		UPDATE workspaces
		SET name = $2,
		    description = $3,
		    updated_at = (now() AT TIME ZONE 'utc')
		WHERE id = $1
	`
	tag, err := r.db.Exec(ctx, query, ws.ID, ws.Name, nullableText(ws.Description))
	if err != nil {
		return mapUniqueViolation(err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrWorkspaceNotFound
	}
	return nil
}

func (r *workspaceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	const query = `DELETE FROM workspaces WHERE id = $1`
	tag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrWorkspaceNotFound
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
		return domain.ErrWorkspaceAlreadyExists
	}
	return err
}
