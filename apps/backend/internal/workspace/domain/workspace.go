package domain

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

// Workspace is the domain entity backing the workspaces table.
//
// A workspace is always tenant-scoped: TenantID is required and the (tenant_id,
// name) pair should be treated as a soft uniqueness key by callers.
type Workspace struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NewWorkspace constructs a workspace with a freshly minted UUID and UTC
// timestamps. Name and description are trimmed.
func NewWorkspace(tenantID uuid.UUID, name, description string) *Workspace {
	now := time.Now().UTC()
	return &Workspace{
		ID:          uuid.New(),
		TenantID:    tenantID,
		Name:        strings.TrimSpace(name),
		Description: strings.TrimSpace(description),
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}
