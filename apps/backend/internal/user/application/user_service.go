package application

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/indalyadav56/logify/apps/backend/internal/user/domain"
)

// CreateUserInput holds the data required to create a new user.
type CreateUserInput struct {
	Email    string `json:"email" validate:"required,email"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Password string `json:"password" validate:"required,min=8,max=72"`
	Role     string `json:"role" validate:"omitempty,oneof=admin member viewer"`
}

// UpdateUserInput holds the data for updating an existing user.
type UpdateUserInput struct {
	FullName *string `json:"full_name,omitempty" validate:"omitempty,min=2,max=100"`
	Role     *string `json:"role,omitempty" validate:"omitempty,oneof=admin member viewer"`
	IsActive *bool   `json:"is_active,omitempty"`
}

// UserOutput is the response DTO for a user.
type UserOutput struct {
	ID       uuid.UUID   `json:"id"`
	Email    string      `json:"email"`
	FullName string      `json:"full_name"`
	Role     domain.Role `json:"role"`
	IsActive bool        `json:"is_active"`
}

// UserService defines the application-level user operations.
type UserService interface {
	CreateUser(ctx context.Context, input CreateUserInput) (*UserOutput, error)
	GetUser(ctx context.Context, id uuid.UUID) (*UserOutput, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	UpdateUser(ctx context.Context, id uuid.UUID, input UpdateUserInput) (*UserOutput, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	ListUsers(ctx context.Context, params domain.ListParams) ([]*UserOutput, int64, error)
}

type userService struct {
	repo   domain.UserRepository
	logger *zap.Logger
}

// NewUserService creates a new UserService.
func NewUserService(repo domain.UserRepository, logger *zap.Logger) UserService {
	return &userService{
		repo:   repo,
		logger: logger.Named("user_service"),
	}
}

func (s *userService) CreateUser(ctx context.Context, input CreateUserInput) (*UserOutput, error) {
	// Check if user already exists.
	existing, err := s.repo.GetByEmail(ctx, input.Email)
	if err != nil && !errors.Is(err, domain.ErrUserNotFound) {
		s.logger.Error("failed to check existing user", zap.Error(err))
		return nil, err
	}
	if existing != nil {
		return nil, domain.ErrUserAlreadyExists
	}

	// Hash the password.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		s.logger.Error("failed to hash password", zap.Error(err))
		return nil, err
	}

	user := domain.NewUser(input.Email, input.FullName, string(hashedPassword))

	if input.Role != "" {
		user.Role = domain.Role(input.Role)
	}

	if err := s.repo.Create(ctx, user); err != nil {
		s.logger.Error("failed to create user", zap.Error(err))
		return nil, err
	}

	s.logger.Info("user created", zap.String("user_id", user.ID.String()))

	return toUserOutput(user), nil
}

func (s *userService) GetUser(ctx context.Context, id uuid.UUID) (*UserOutput, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toUserOutput(user), nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return s.repo.GetByEmail(ctx, email)
}

func (s *userService) UpdateUser(ctx context.Context, id uuid.UUID, input UpdateUserInput) (*UserOutput, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.FullName != nil {
		user.FullName = *input.FullName
	}
	if input.Role != nil {
		user.Role = domain.Role(*input.Role)
	}
	if input.IsActive != nil {
		user.IsActive = *input.IsActive
	}

	if err := s.repo.Update(ctx, user); err != nil {
		s.logger.Error("failed to update user", zap.Error(err), zap.String("user_id", id.String()))
		return nil, err
	}

	s.logger.Info("user updated", zap.String("user_id", id.String()))

	return toUserOutput(user), nil
}

func (s *userService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		s.logger.Error("failed to delete user", zap.Error(err), zap.String("user_id", id.String()))
		return err
	}

	s.logger.Info("user deleted", zap.String("user_id", id.String()))
	return nil
}

func (s *userService) ListUsers(ctx context.Context, params domain.ListParams) ([]*UserOutput, int64, error) {
	users, total, err := s.repo.List(ctx, params)
	if err != nil {
		s.logger.Error("failed to list users", zap.Error(err))
		return nil, 0, err
	}

	outputs := make([]*UserOutput, len(users))
	for i, u := range users {
		outputs[i] = toUserOutput(u)
	}

	return outputs, total, nil
}

// toUserOutput converts a domain User to the output DTO.
func toUserOutput(user *domain.User) *UserOutput {
	return &UserOutput{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     user.Role,
		IsActive: user.IsActive,
	}
}
