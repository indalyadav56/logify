package domain

import "strings"

// Permission is a single (resource, action) capability granted to a role.
//
// Resource and Action are intentionally free-form strings so the catalog can
// grow without schema changes. Callers SHOULD prefer the well-known constants
// below to keep authorization checks consistent across the codebase.
type Permission struct {
	Resource string `json:"resource"`
	Action   string `json:"action"`
}

// Well-known resources. Extend cautiously; once a resource string is in use it
// becomes part of the public RBAC vocabulary.
const (
	ResourceLog          = "log"
	ResourceProject      = "project"
	ResourceAlert        = "alert"
	ResourceNotification = "notification"
	ResourceUser         = "user"
	ResourceRole         = "role"
	ResourceTenant       = "tenant"
	ResourceBilling      = "billing"
)

// Well-known actions.
const (
	ActionRead   = "read"
	ActionWrite  = "write"
	ActionDelete = "delete"
	ActionManage = "manage" // superset of read/write/delete on the resource
)

// NormalizeResource canonicalizes resource strings for storage / comparison.
func NormalizeResource(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

// NormalizeAction canonicalizes action strings for storage / comparison.
func NormalizeAction(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

// Normalize returns a copy of the permission with normalized fields.
func (p Permission) Normalize() Permission {
	return Permission{
		Resource: NormalizeResource(p.Resource),
		Action:   NormalizeAction(p.Action),
	}
}

// IsValid reports whether the permission has non-empty resource and action.
func (p Permission) IsValid() bool {
	n := p.Normalize()
	return n.Resource != "" && n.Action != ""
}
