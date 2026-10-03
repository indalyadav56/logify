package application

import (
	"context"
	"github.com/google/uuid"
	"github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
)

// Access is checked against persisted membership on every request. JWT claims
// never grant a project role, so removal and demotion take effect immediately.
func RequireAccess(ctx context.Context, repo domain.AccessRepository, id uuid.UUID, roles ...domain.Role) (*domain.Project, error) {
	user, ok := middleware.UserUUIDFromContext(ctx)
	if !ok {
		return nil, domain.ErrProjectNotFound
	}
	project, err := repo.GetForUser(ctx, id, user)
	if err != nil {
		return nil, err
	}
	if len(roles) == 0 {
		return project, nil
	}
	for _, role := range roles {
		if project.Role == role {
			return project, nil
		}
	}
	return nil, domain.ErrForbidden
}
