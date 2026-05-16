package application

import (
	"time"

	"github.com/google/uuid"
)

// CreateWorkspaceInput is the payload accepted by CreateWorkspace.
//
// Note: once tenant resolution from JWT claims is in place, TenantID should
// be removed from the wire payload and injected from request context instead.
type CreateWorkspaceInput struct {
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"                  validate:"required,min=2,max=255"`
	Description string    `json:"description,omitempty" validate:"omitempty,max=1000"`
}

// UpdateWorkspaceInput is the payload accepted by UpdateWorkspace. Nil fields
// are preserved (partial update).
type UpdateWorkspaceInput struct {
	Name        *string `json:"name,omitempty"        validate:"omitempty,min=2,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
}

// WorkspaceOutput is the response DTO returned by the service.
type WorkspaceOutput struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
