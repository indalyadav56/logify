package application

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/role/domain"
)

// PermissionInput is the wire representation of a single permission.
type PermissionInput struct {
	Resource string `json:"resource" validate:"required,min=1,max=100"`
	Action   string `json:"action"   validate:"required,min=1,max=50"`
}

// CreateRoleInput is the payload accepted by CreateRole.
type CreateRoleInput struct {
	TenantID    *uuid.UUID        `json:"tenant_id,omitempty"     validate:"omitempty"`
	Name        string            `json:"name"                    validate:"required,min=2,max=100"`
	Description string            `json:"description,omitempty"   validate:"omitempty,max=500"`
	Permissions []PermissionInput `json:"permissions,omitempty"   validate:"omitempty,dive"`
}

// UpdateRoleInput is the payload accepted by UpdateRole. Nil fields are
// preserved (partial update).
type UpdateRoleInput struct {
	Name        *string `json:"name,omitempty"        validate:"omitempty,min=2,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
}

// RoleOutput is the response DTO returned to API clients.
type RoleOutput struct {
	ID          uuid.UUID         `json:"id"`
	TenantID    *uuid.UUID        `json:"tenant_id,omitempty"`
	Name        string            `json:"name"`
	Description string            `json:"description,omitempty"`
	IsSystem    bool              `json:"is_system"`
	Permissions []PermissionInput `json:"permissions"`
	CreatedAt   string            `json:"created_at"`
	UpdatedAt   string            `json:"updated_at"`
}

// RoleService defines the application-level RBAC operations.
type RoleService interface {
	CreateRole(ctx context.Context, input CreateRoleInput) (*RoleOutput, error)
	GetRole(ctx context.Context, id uuid.UUID) (*RoleOutput, error)
	UpdateRole(ctx context.Context, id uuid.UUID, input UpdateRoleInput) (*RoleOutput, error)
	DeleteRole(ctx context.Context, id uuid.UUID) error
	ListRoles(ctx context.Context, filter domain.ListFilter) ([]*RoleOutput, int64, error)

	ListPermissions(ctx context.Context, roleID uuid.UUID) ([]PermissionInput, error)
	AddPermission(ctx context.Context, roleID uuid.UUID, p PermissionInput) error
	RemovePermission(ctx context.Context, roleID uuid.UUID, p PermissionInput) error
	ReplacePermissions(ctx context.Context, roleID uuid.UUID, perms []PermissionInput) error
}

type roleService struct {
	repo   domain.RoleRepository
	logger *zap.Logger
}

// NewRoleService returns a RoleService backed by the given repository.
func NewRoleService(repo domain.RoleRepository, logger *zap.Logger) RoleService {
	return &roleService{
		repo:   repo,
		logger: logger.Named("role_service"),
	}
}

func (s *roleService) CreateRole(ctx context.Context, input CreateRoleInput) (*RoleOutput, error) {
	role := domain.NewRole(input.TenantID, input.Name, input.Description)

	perms, err := toDomainPermissions(input.Permissions)
	if err != nil {
		return nil, err
	}
	role.Permissions = perms

	if err := s.repo.Create(ctx, role); err != nil {
		if errors.Is(err, domain.ErrRoleAlreadyExists) {
			return nil, err
		}
		s.logger.Error("failed to create role", zap.Error(err))
		return nil, err
	}

	s.logger.Info("role created",
		zap.String("role_id", role.ID.String()),
		zap.String("name", role.Name),
	)
	return toRoleOutput(role), nil
}

func (s *roleService) GetRole(ctx context.Context, id uuid.UUID) (*RoleOutput, error) {
	role, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toRoleOutput(role), nil
}

func (s *roleService) UpdateRole(ctx context.Context, id uuid.UUID, input UpdateRoleInput) (*RoleOutput, error) {
	role, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if role.IsSystem {
		return nil, domain.ErrSystemRoleReadOnly
	}

	if input.Name != nil {
		role.Name = domain.NormalizeName(*input.Name)
	}
	if input.Description != nil {
		role.Description = *input.Description
	}

	if err := s.repo.Update(ctx, role); err != nil {
		s.logger.Error("failed to update role", zap.Error(err), zap.String("role_id", id.String()))
		return nil, err
	}
	return toRoleOutput(role), nil
}

func (s *roleService) DeleteRole(ctx context.Context, id uuid.UUID) error {
	role, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if role.IsSystem {
		return domain.ErrSystemRoleReadOnly
	}
	if err := s.repo.Delete(ctx, id); err != nil {
		s.logger.Error("failed to delete role", zap.Error(err), zap.String("role_id", id.String()))
		return err
	}
	s.logger.Info("role deleted", zap.String("role_id", id.String()))
	return nil
}

func (s *roleService) ListRoles(ctx context.Context, filter domain.ListFilter) ([]*RoleOutput, int64, error) {
	roles, total, err := s.repo.List(ctx, filter)
	if err != nil {
		s.logger.Error("failed to list roles", zap.Error(err))
		return nil, 0, err
	}
	out := make([]*RoleOutput, len(roles))
	for i, r := range roles {
		out[i] = toRoleOutput(r)
	}
	return out, total, nil
}

func (s *roleService) ListPermissions(ctx context.Context, roleID uuid.UUID) ([]PermissionInput, error) {
	perms, err := s.repo.ListPermissions(ctx, roleID)
	if err != nil {
		return nil, err
	}
	return fromDomainPermissions(perms), nil
}

func (s *roleService) AddPermission(ctx context.Context, roleID uuid.UUID, p PermissionInput) error {
	role, err := s.repo.GetByID(ctx, roleID)
	if err != nil {
		return err
	}
	if role.IsSystem {
		return domain.ErrSystemRoleReadOnly
	}
	perm := domain.Permission{Resource: p.Resource, Action: p.Action}.Normalize()
	if !perm.IsValid() {
		return domain.ErrInvalidPermission
	}
	return s.repo.AddPermission(ctx, roleID, perm)
}

func (s *roleService) RemovePermission(ctx context.Context, roleID uuid.UUID, p PermissionInput) error {
	role, err := s.repo.GetByID(ctx, roleID)
	if err != nil {
		return err
	}
	if role.IsSystem {
		return domain.ErrSystemRoleReadOnly
	}
	perm := domain.Permission{Resource: p.Resource, Action: p.Action}.Normalize()
	if !perm.IsValid() {
		return domain.ErrInvalidPermission
	}
	return s.repo.RemovePermission(ctx, roleID, perm)
}

func (s *roleService) ReplacePermissions(ctx context.Context, roleID uuid.UUID, perms []PermissionInput) error {
	role, err := s.repo.GetByID(ctx, roleID)
	if err != nil {
		return err
	}
	if role.IsSystem {
		return domain.ErrSystemRoleReadOnly
	}
	d, err := toDomainPermissions(perms)
	if err != nil {
		return err
	}
	return s.repo.ReplacePermissions(ctx, roleID, d)
}

// --- mapping helpers ---

func toDomainPermissions(in []PermissionInput) ([]domain.Permission, error) {
	if len(in) == 0 {
		return nil, nil
	}
	seen := make(map[domain.Permission]struct{}, len(in))
	out := make([]domain.Permission, 0, len(in))
	for _, p := range in {
		perm := domain.Permission{Resource: p.Resource, Action: p.Action}.Normalize()
		if !perm.IsValid() {
			return nil, domain.ErrInvalidPermission
		}
		if _, dup := seen[perm]; dup {
			continue
		}
		seen[perm] = struct{}{}
		out = append(out, perm)
	}
	return out, nil
}

func fromDomainPermissions(perms []domain.Permission) []PermissionInput {
	out := make([]PermissionInput, len(perms))
	for i, p := range perms {
		out[i] = PermissionInput{Resource: p.Resource, Action: p.Action}
	}
	return out
}

func toRoleOutput(r *domain.Role) *RoleOutput {
	return &RoleOutput{
		ID:          r.ID,
		TenantID:    r.TenantID,
		Name:        r.Name,
		Description: r.Description,
		IsSystem:    r.IsSystem,
		Permissions: fromDomainPermissions(r.Permissions),
		CreatedAt:   r.CreatedAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   r.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
	}
}
