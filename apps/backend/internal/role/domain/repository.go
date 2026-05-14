package domain

import (
	"context"

	"github.com/google/uuid"
)

// ListFilter holds the filtering / pagination options for role listing.
type ListFilter struct {
	// TenantID, when non-nil, restricts results to roles owned by that tenant.
	// When nil, includes all roles (use IncludeGlobal to control system roles).
	TenantID *uuid.UUID

	// IncludeGlobal returns global / system roles (tenant_id IS NULL) in
	// addition to any tenant-scoped results.
	IncludeGlobal bool

	// Search is a case-insensitive substring filter on the role name.
	Search string

	// IsSystem, when non-nil, filters by system flag.
	IsSystem *bool

	Page    int
	PerPage int
	SortBy  string // created_at | updated_at | name
	SortDir string // asc | desc
}

// DefaultListFilter returns a ListFilter with sensible defaults.
func DefaultListFilter() ListFilter {
	return ListFilter{
		Page:    1,
		PerPage: 20,
		SortBy:  "created_at",
		SortDir: "desc",
	}
}

// RoleRepository defines the persistence contract for roles and their
// permissions. Implementations MUST be safe for concurrent use.
type RoleRepository interface {
	// Create persists a new role together with its initial permissions in a
	// single transaction.
	Create(ctx context.Context, role *Role) error

	// GetByID returns a role by ID with its permissions populated.
	GetByID(ctx context.Context, id uuid.UUID) (*Role, error)

	// Update modifies mutable role fields (name, description). It does NOT
	// touch the permission set; use ReplacePermissions / AddPermission /
	// RemovePermission for that.
	Update(ctx context.Context, role *Role) error

	// Delete removes a role and (via FK cascade) its permissions.
	Delete(ctx context.Context, id uuid.UUID) error

	// List returns a paginated, filtered slice of roles plus the total count
	// matching the filter (ignoring pagination).
	List(ctx context.Context, f ListFilter) ([]*Role, int64, error)

	// ListPermissions returns the permissions currently granted to a role.
	ListPermissions(ctx context.Context, roleID uuid.UUID) ([]Permission, error)

	// AddPermission grants a single permission to a role. Idempotent: adding
	// an existing (role_id, resource, action) is a no-op.
	AddPermission(ctx context.Context, roleID uuid.UUID, perm Permission) error

	// RemovePermission revokes a permission from a role. Returns
	// ErrPermissionNotFound if the row doesn't exist.
	RemovePermission(ctx context.Context, roleID uuid.UUID, perm Permission) error

	// ReplacePermissions atomically replaces the entire permission set for a
	// role. Useful for "PUT /roles/:id/permissions" style endpoints.
	ReplacePermissions(ctx context.Context, roleID uuid.UUID, perms []Permission) error
}
