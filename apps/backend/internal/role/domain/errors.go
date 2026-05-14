package domain

import "errors"

// Domain errors. Service / transport layers compare against these with
// errors.Is to map to HTTP status codes.
var (
	ErrRoleNotFound       = errors.New("role not found")
	ErrRoleAlreadyExists  = errors.New("role with this name already exists in tenant")
	ErrSystemRoleReadOnly = errors.New("system roles cannot be modified or deleted")
	ErrInvalidPermission  = errors.New("permission must include both resource and action")
	ErrPermissionNotFound = errors.New("permission not found on role")
)
