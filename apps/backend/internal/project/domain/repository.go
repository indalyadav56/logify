package domain

import (
	"context"

	"github.com/google/uuid"
)

// ProjectRepository is the persistence contract for the project bounded
// context. All IDs are uuid.UUID — string IDs at the edges (HTTP, etc.) are
// parsed in transport.
type ProjectRepository interface {
	Create(ctx context.Context, project *Project) error
	GetByID(ctx context.Context, id uuid.UUID) (*Project, error)
	// List returns projects, optionally filtered to a single tenant when
	// tenantID is non-nil. Results are ordered by created_at DESC.
	List(ctx context.Context, tenantID *uuid.UUID) ([]*Project, error)
	Update(ctx context.Context, project *Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}
