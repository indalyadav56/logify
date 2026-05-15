package domain

import (
	"context"
)

// UserRepository defines the contract for user data persistence.
type UserRepository interface {
	// Create persists a new user.
	Create(ctx context.Context, user *User) error

	// GetByEmail retrieves a user by their email address.
	// Returns ErrUserNotFound if no user matches.
	GetByEmail(ctx context.Context, email string) (*User, error)

	// // GetByID retrieves a user by their unique identifier.
	// GetByID(ctx context.Context, id uuid.UUID) (*User, error)

	// // Update modifies an existing user's data.
	// Update(ctx context.Context, user *User) error

	// // Delete removes a user by their unique identifier.
	// Delete(ctx context.Context, id uuid.UUID) error

	// // List retrieves a paginated list of users with optional filters.
	// List(ctx context.Context, params ListParams) ([]*User, int64, error)
}

// ListParams holds pagination and filtering options.
type ListParams struct {
	Page     int
	PerPage  int
	Search   string // search by email or name
	Role     string
	IsActive *bool
	SortBy   string // field to sort by
	SortDir  string // "asc" or "desc"
}

// DefaultListParams returns list parameters with sensible defaults.
func DefaultListParams() ListParams {
	return ListParams{
		Page:    1,
		PerPage: 20,
		SortBy:  "created_at",
		SortDir: "desc",
	}
}
