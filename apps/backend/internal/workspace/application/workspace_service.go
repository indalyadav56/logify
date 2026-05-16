package application

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/workspace/domain"
)

// WorkspaceService is the application-facing entry point for the workspace
// bounded context.
type WorkspaceService interface {
	CreateWorkspace(ctx context.Context, input CreateWorkspaceInput) (*WorkspaceOutput, error)
	GetWorkspace(ctx context.Context, id uuid.UUID) (*WorkspaceOutput, error)
	ListWorkspaces(ctx context.Context, tenantID *uuid.UUID) ([]*WorkspaceOutput, error)
	UpdateWorkspace(ctx context.Context, id uuid.UUID, input UpdateWorkspaceInput) (*WorkspaceOutput, error)
	DeleteWorkspace(ctx context.Context, id uuid.UUID) error
}

type workspaceService struct {
	repo   domain.WorkspaceRepository
	logger *zap.Logger
}

// NewWorkspaceService returns a WorkspaceService backed by the given repository.
func NewWorkspaceService(repo domain.WorkspaceRepository, logger *zap.Logger) WorkspaceService {
	return &workspaceService{
		repo:   repo,
		logger: logger.Named("workspace_service"),
	}
}

func (s *workspaceService) CreateWorkspace(ctx context.Context, input CreateWorkspaceInput) (*WorkspaceOutput, error) {
	ws := domain.NewWorkspace(input.TenantID, input.Name, input.Description)

	if err := s.repo.Create(ctx, ws); err != nil {
		if errors.Is(err, domain.ErrWorkspaceAlreadyExists) {
			return nil, err
		}
		s.logger.Error("failed to create workspace", zap.Error(err))
		return nil, err
	}

	s.logger.Info("workspace created",
		zap.String("workspace_id", ws.ID.String()),
		zap.String("tenant_id", ws.TenantID.String()),
		zap.String("name", ws.Name),
	)
	return toWorkspaceOutput(ws), nil
}

func (s *workspaceService) GetWorkspace(ctx context.Context, id uuid.UUID) (*WorkspaceOutput, error) {
	ws, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toWorkspaceOutput(ws), nil
}

func (s *workspaceService) ListWorkspaces(ctx context.Context, tenantID *uuid.UUID) ([]*WorkspaceOutput, error) {
	items, err := s.repo.List(ctx, tenantID)
	if err != nil {
		s.logger.Error("failed to list workspaces", zap.Error(err))
		return nil, err
	}
	out := make([]*WorkspaceOutput, len(items))
	for i, w := range items {
		out[i] = toWorkspaceOutput(w)
	}
	return out, nil
}

func (s *workspaceService) UpdateWorkspace(ctx context.Context, id uuid.UUID, input UpdateWorkspaceInput) (*WorkspaceOutput, error) {
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
		s.logger.Error("failed to update workspace",
			zap.Error(err),
			zap.String("workspace_id", id.String()),
		)
		return nil, err
	}
	return toWorkspaceOutput(ws), nil
}

func (s *workspaceService) DeleteWorkspace(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		if !errors.Is(err, domain.ErrWorkspaceNotFound) {
			s.logger.Error("failed to delete workspace",
				zap.Error(err),
				zap.String("workspace_id", id.String()),
			)
		}
		return err
	}
	s.logger.Info("workspace deleted", zap.String("workspace_id", id.String()))
	return nil
}

func toWorkspaceOutput(w *domain.Workspace) *WorkspaceOutput {
	return &WorkspaceOutput{
		ID:          w.ID,
		TenantID:    w.TenantID,
		Name:        w.Name,
		Description: w.Description,
		CreatedAt:   w.CreatedAt,
		UpdatedAt:   w.UpdatedAt,
	}
}
