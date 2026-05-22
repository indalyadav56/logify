package domain

import (
	"context"

	"github.com/google/uuid"
)

// WorkspaceRepository is the persistence contract for the workspace bounded
// context. All IDs are uuid.UUID — string IDs at the edges (HTTP, etc.) are
// parsed in transport.
type ProjectRepository interface {
	Create(ctx context.Context, workspace *Project) error
	GetByID(ctx context.Context, id uuid.UUID) (*Project, error)
	// List returns workspaces, optionally filtered to a single tenant when
	// tenantID is non-nil. Results are ordered by created_at DESC.
	List(ctx context.Context, tenantID *uuid.UUID) ([]*Project, error)
	Update(ctx context.Context, workspace *Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}
