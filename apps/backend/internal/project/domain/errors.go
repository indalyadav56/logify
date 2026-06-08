package domain

import "errors"

// Domain errors. Service / transport layers compare against these with
// errors.Is to map them onto HTTP status codes.
var (
	ErrProjectNotFound      = errors.New("project not found")
	ErrProjectAlreadyExists = errors.New("project with this name already exists in tenant")
)
