package application

import (
	"time"

	"github.com/google/uuid"
)

type CreateProjectInput struct {
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"                  validate:"required,min=2,max=255"`
	Description string    `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type UpdateProjectInput struct {
	Name        *string `json:"name,omitempty"        validate:"omitempty,min=2,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}

type ProjectOutput struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
