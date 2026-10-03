package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/indalyadav56/logify/apps/backend/internal/apikey/domain"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	pg "github.com/indalyadav56/logify/apps/backend/pkg/postgres"
)

type Repository struct{ db *pgxpool.Pool }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

func (r *Repository) Create(ctx context.Context, key *domain.Key) error {
	err := pg.ExecutorFromContext(ctx, r.db).QueryRow(ctx, `
		INSERT INTO project_api_keys (project_id, created_by, name, key_prefix, key_hash)
		VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
		key.ProjectID, key.CreatedBy, key.Name, key.KeyPrefix, key.KeyHash).
		Scan(&key.ID, &key.CreatedAt)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23503" {
		return projectDomain.ErrProjectNotFound
	}
	return err
}

func (r *Repository) List(ctx context.Context, projectID uuid.UUID) ([]*domain.Key, error) {
	rows, err := pg.ExecutorFromContext(ctx, r.db).Query(ctx, `
		SELECT id, project_id, name, key_prefix, created_at, revoked_at
		FROM project_api_keys WHERE project_id = $1 ORDER BY created_at DESC, id DESC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	keys := make([]*domain.Key, 0)
	for rows.Next() {
		var key domain.Key
		if err := rows.Scan(&key.ID, &key.ProjectID, &key.Name, &key.KeyPrefix, &key.CreatedAt, &key.RevokedAt); err != nil {
			return nil, err
		}
		keys = append(keys, &key)
	}
	return keys, rows.Err()
}

func (r *Repository) Revoke(ctx context.Context, projectID, keyID uuid.UUID) error {
	tag, err := pg.ExecutorFromContext(ctx, r.db).Exec(ctx, `
		UPDATE project_api_keys SET revoked_at = COALESCE(revoked_at, now())
		WHERE id = $1 AND project_id = $2`, keyID, projectID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrKeyNotFound
	}
	return nil
}

func (r *Repository) Resolve(ctx context.Context, hash string) (*domain.Identity, error) {
	var identity domain.Identity
	err := pg.ExecutorFromContext(ctx, r.db).QueryRow(ctx, `
		SELECT k.created_by, p.tenant_id, p.id FROM project_api_keys k
		JOIN projects p ON p.id = k.project_id
		JOIN auth.users u ON u.id = k.created_by
 JOIN auth.users owner ON owner.id = p.created_by AND owner.is_active AND owner.deleted_at IS NULL
		WHERE k.key_hash = $1 AND k.revoked_at IS NULL
		AND p.status = 'active' AND p.deleted_at IS NULL
		AND u.is_active AND u.deleted_at IS NULL
 AND (p.created_by = k.created_by OR EXISTS (SELECT 1 FROM project_team_members m
 WHERE m.project_id = p.id AND m.user_id = k.created_by AND m.role = 'admin'))`, hash).
		Scan(&identity.UserID, &identity.TenantID, &identity.ProjectID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrInvalidKey
	}
	if err != nil {
		return nil, err
	}
	return &identity, nil
}
