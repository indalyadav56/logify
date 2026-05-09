package domain

import "errors"

// Common tenant errors
var (
	ErrTenantNotFound = errors.New("tenant not found")
	ErrInvalidAPIKey  = errors.New("invalid api key")
	ErrQuotaExceeded  = errors.New("quota exceeded")
)
