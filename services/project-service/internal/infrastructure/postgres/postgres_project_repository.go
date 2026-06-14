package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/indalyadav56/logify/services/project-service/internal/domain/entity"
)

type PostgresRepository interface{}

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *postgresRepository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Insert(ctx context.Context, entity *entity.Project) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO projects (title, tenant_id, user_id)
		VALUES ($1, $2, $3) RETURNING id
	`, entity.Title, entity.TenantID, entity.UserID).Scan(&entity.ID)

	if err != nil {
		return fmt.Errorf("failed to insert project: %w", err)
	}

	slog.Info("Project inserted successfully", "projectID", entity.ID)
	return nil
}

func (r *postgresRepository) FindByUserID(ctx context.Context, userID string) ([]entity.Project, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, tenant_id, title, description, environment, created_at, updated_at
		FROM projects 
		WHERE user_id = $1 order by created_at desc;
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []entity.Project

	for rows.Next() {
		var project entity.Project

		err := rows.Scan(&project.ID, &project.UserID, &project.TenantID, &project.Title, &project.Description, &project.Environment, &project.CreatedAt, &project.UpdatedAt)
		if err != nil {
			return nil, err
		}

		projects = append(projects, project)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return projects, nil
}

func (r *postgresRepository) FindByID(ctx context.Context, id string) (*entity.Project, error) {
	var project entity.Project
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, description, created_at, updated_at
		FROM projects
		WHERE id = $1
	`, id).Scan(&project.ID, &project.Title, &project.CreatedAt, &project.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &project, nil
}

func (r *postgresRepository) Update(ctx context.Context, entity *entity.Project) error {
	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, id string) error {
	return nil
}
