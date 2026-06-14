package repository

import (
	"context"

	"github.com/indalyadav56/logify/services/project-service/internal/domain/entity"
)

type ProjectRepository interface {
	Insert(ctx context.Context, entity *entity.Project) error
	FindByID(ctx context.Context, id string) (*entity.Project, error)
	FindByUserID(ctx context.Context, userID string) ([]entity.Project, error)
	Update(ctx context.Context, entity *entity.Project) error
	Delete(ctx context.Context, id string) error
}

type ApiKeyRepository interface {
	Insert(ctx context.Context, entity *entity.ApiKey) (*entity.ApiKey, error)
	ListByProjectID(ctx context.Context, projectID string) ([]entity.ApiKey, error)
	GetById(ctx context.Context, apiKeyId string) (*entity.ApiKey, error)
}
