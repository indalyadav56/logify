package domain

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

// Role is the domain entity for an RBAC role.
//
// A role is either:
//   - tenant-scoped (TenantID != nil) — visible only to that tenant, manageable
//     by tenant admins.
//   - global/system (TenantID == nil, IsSystem = true) — seeded by the platform,
//     immutable and not deletable.
type Role struct {
	ID          uuid.UUID    `json:"id"`
	TenantID    *uuid.UUID   `json:"tenant_id,omitempty"`
	Name        string       `json:"name"`
	Description string       `json:"description,omitempty"`
	IsSystem    bool         `json:"is_system"`
	Permissions []Permission `json:"permissions,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// NewRole constructs a new (non-system) role with a generated ID.
func NewRole(tenantID *uuid.UUID, name, description string) *Role {
	now := time.Now().UTC()
	return &Role{
		ID:          uuid.New(),
		TenantID:    tenantID,
		Name:        NormalizeName(name),
		Description: strings.TrimSpace(description),
		IsSystem:    false,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// NormalizeName trims whitespace and lower-cases role names for storage.
// Role names are treated case-insensitively for uniqueness purposes.
func NormalizeName(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}
