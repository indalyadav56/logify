package application

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/project/domain"
)

type ProjectService interface {
	CreateProject(ctx context.Context, input CreateProjectInput) (*ProjectOutput, error)
	GetProject(ctx context.Context, id uuid.UUID) (*ProjectOutput, error)
	ListProjects(ctx context.Context, tenantID *uuid.UUID) ([]*ProjectOutput, error)
	UpdateProject(ctx context.Context, id uuid.UUID, input UpdateProjectInput) (*ProjectOutput, error)
	DeleteProject(ctx context.Context, id uuid.UUID) error
}

type projectService struct {
	repo   domain.ProjectRepository
	logger *zap.Logger
}

func NewProjectService(repo domain.ProjectRepository, logger *zap.Logger) ProjectService {
	return &projectService{
		repo:   repo,
		logger: logger.Named("project_service"),
	}
}

func (s *projectService) CreateProject(ctx context.Context, input CreateProjectInput) (*ProjectOutput, error) {
	ws := domain.NewProject(input.TenantID, input.Name, input.Description)

	if err := s.repo.Create(ctx, ws); err != nil {
		if errors.Is(err, domain.ErrProjectAlreadyExists) {
			return nil, err
		}
		s.logger.Error("failed to create project", zap.Error(err))
		return nil, err
	}

	s.logger.Info("project created",
		zap.String("project_id", ws.ID.String()),
		zap.String("tenant_id", ws.TenantID.String()),
		zap.String("name", ws.Name),
	)
	return toProjectOutput(ws), nil
}

func (s *projectService) GetProject(ctx context.Context, id uuid.UUID) (*ProjectOutput, error) {
	ws, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toProjectOutput(ws), nil
}

func (s *projectService) ListProjects(ctx context.Context, tenantID *uuid.UUID) ([]*ProjectOutput, error) {
	items, err := s.repo.List(ctx, tenantID)
	if err != nil {
		s.logger.Error("failed to list projects", zap.Error(err))
		return nil, err
	}
	out := make([]*ProjectOutput, len(items))
	for i, w := range items {
		out[i] = toProjectOutput(w)
	}
	return out, nil
}

func (s *projectService) UpdateProject(ctx context.Context, id uuid.UUID, input UpdateProjectInput) (*ProjectOutput, error) {
	ws, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		ws.Name = strings.TrimSpace(*input.Name)
	}
	if input.Description != nil {
		ws.Description = strings.TrimSpace(*input.Description)
	}

	if err := s.repo.Update(ctx, ws); err != nil {
		s.logger.Error("failed to update project",
			zap.Error(err),
			zap.String("project_id", id.String()),
		)
		return nil, err
	}
	return toProjectOutput(ws), nil
}

func (s *projectService) DeleteProject(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		if !errors.Is(err, domain.ErrProjectNotFound) {
			s.logger.Error("failed to delete project",
				zap.Error(err),
				zap.String("project_id", id.String()),
			)
		}
		return err
	}
	s.logger.Info("project deleted", zap.String("project_id", id.String()))
	return nil
}

func toProjectOutput(w *domain.Project) *ProjectOutput {
	return &ProjectOutput{
		ID:          w.ID,
		TenantID:    w.TenantID,
		Name:        w.Name,
		Description: w.Description,
		CreatedAt:   w.CreatedAt,
		UpdatedAt:   w.UpdatedAt,
	}
}
