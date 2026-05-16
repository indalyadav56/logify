package domain

import "context"

// LogRepository persists embedded log entries.
type LogRepository interface {
	Insert(ctx context.Context, entry *LogEntry) error
}
