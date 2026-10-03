package domain

import "errors"

var (
	ErrUnauthorized     = errors.New("authentication required")
	ErrInvalidProject   = errors.New("a valid project_id is required when using an access token")
	ErrProjectForbidden = errors.New("API key can only send logs to its own project")
)
