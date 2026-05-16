package domain

import "errors"

// Domain errors. Service / transport layers compare against these with
// errors.Is to map them onto HTTP status codes.
var (
	ErrWorkspaceNotFound      = errors.New("workspace not found")
	ErrWorkspaceAlreadyExists = errors.New("workspace with this name already exists in tenant")
)
