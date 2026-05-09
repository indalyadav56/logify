package domain

import "context"

// LogRepository defines the persistence contract for logs.
type LogRepository interface {
	// InsertBatch persists a batch of log entries.
	InsertBatch(ctx context.Context, logs []*Log) error

	// Query returns logs matching the given filter.
	Query(ctx context.Context, filter LogFilter) ([]*Log, error)

	// Count returns the total number of logs matching the given filter.
	Count(ctx context.Context, filter LogFilter) (uint64, error)
}
