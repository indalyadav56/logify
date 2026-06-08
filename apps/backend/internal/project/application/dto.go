package application

import (
	"time"

	"github.com/google/uuid"
)

// CreateProjectInput is the payload accepted by CreateProject.
//
// Note: once tenant resolution from JWT claims is in place, TenantID should
// be removed from the wire payload and injected from request context instead.
type CreateProjectInput struct {
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"                  validate:"required,min=2,max=255"`
	Description string    `json:"description,omitempty" validate:"omitempty,max=1000"`
}

// UpdateProjectInput is the payload accepted by UpdateProject. Nil fields
// are preserved (partial update).
type UpdateProjectInput struct {
	Name        *string `json:"name,omitempty"        validate:"omitempty,min=2,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}

// ProjectOutput is the response DTO returned by the service.
type ProjectOutput struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
