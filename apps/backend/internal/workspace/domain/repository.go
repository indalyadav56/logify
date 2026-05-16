package domain

import (
	"context"

	"github.com/google/uuid"
)

// WorkspaceRepository is the persistence contract for the workspace bounded
// context. All IDs are uuid.UUID — string IDs at the edges (HTTP, etc.) are
// parsed in transport.
type WorkspaceRepository interface {
	Create(ctx context.Context, workspace *Workspace) error
	GetByID(ctx context.Context, id uuid.UUID) (*Workspace, error)
	// List returns workspaces, optionally filtered to a single tenant when
	// tenantID is non-nil. Results are ordered by created_at DESC.
	List(ctx context.Context, tenantID *uuid.UUID) ([]*Workspace, error)
	Update(ctx context.Context, workspace *Workspace) error
	Delete(ctx context.Context, id uuid.UUID) error
}
