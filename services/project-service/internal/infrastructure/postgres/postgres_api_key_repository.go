package postgres

import (
	"context"
	"database/sql"
	"errors"

	"github.com/indalyadav56/logify/services/project-service/internal/domain/entity"
)

type postgresApiKeyRepository struct {
	db *sql.DB
}

func NewPostgresApiKeyRepository(db *sql.DB) *postgresApiKeyRepository {
	return &postgresApiKeyRepository{db: db}
}

func (r *postgresApiKeyRepository) Insert(ctx context.Context, entity *entity.ApiKey) (*entity.ApiKey, error) {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO project_api_keys (project_id, api_key, name, description)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`,
		entity.ProjectID, entity.ApiKey, entity.Name, entity.Description,
	).Scan(&entity.ID, &entity.CreatedAt, &entity.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return entity, nil
}

func (r *postgresApiKeyRepository) ListByProjectID(ctx context.Context, projectID string) ([]entity.ApiKey, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, project_id, api_key, name, description, created_at, updated_at
		FROM project_api_keys where project_id = $1`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apiKeys []entity.ApiKey

	for rows.Next() {
		var apiKey entity.ApiKey

		err := rows.Scan(&apiKey.ID, &apiKey.ProjectID, &apiKey.ApiKey, &apiKey.Name, &apiKey.Description, &apiKey.CreatedAt, &apiKey.UpdatedAt)
		if err != nil {
			return nil, err
		}

		apiKeys = append(apiKeys, apiKey)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return apiKeys, nil
}

func (r *postgresApiKeyRepository) GetById(ctx context.Context, apiKeyId string) (*entity.ApiKey, error) {
	var apiKey entity.ApiKey

	err := r.db.QueryRowContext(ctx, `
		SELECT pak.id, pak.project_id, p.user_id, p.tenant_id
		FROM project_api_keys pak
		JOIN projects p ON pak.project_id = p.id
		WHERE pak.api_key = $1`, apiKeyId).Scan(
		&apiKey.ID,
		&apiKey.ProjectID,
		&apiKey.UserID,
		&apiKey.TenantID,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("not found")
		}
		return nil, err
	}

	return &apiKey, nil
}
