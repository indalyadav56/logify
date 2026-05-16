package application

import (
	"github.com/google/uuid"
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
