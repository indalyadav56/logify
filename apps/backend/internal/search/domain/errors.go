package domain

import "errors"

var (
	ErrTenantIDRequired  = errors.New("tenant_id is required")
	ErrProjectIDRequired = errors.New("project_id is required")
	ErrTimeRangeRequired = errors.New("from and to are required")
	ErrInvalidTimeRange  = errors.New("from must be before to")
	ErrLimitTooLarge     = errors.New("limit must be <= 1000")
	ErrLogNotFound       = errors.New("log not found")
)
