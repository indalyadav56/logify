package domain

import (
	"time"

	"github.com/google/uuid"
)

// Log represents a single log entry stored in ClickHouse.
// Fields mirror the logify.logs table schema exactly.
type Log struct {
	ID            uuid.UUID         `ch:"id"`
	TenantID      string            `ch:"tenant_id"`
	ProjectID     string            `ch:"project_id"`
	Timestamp     time.Time         `ch:"timestamp"`
	Level         string            `ch:"level"`
	Service       string            `ch:"service"`
	Namespace     string            `ch:"namespace"`
	Environment   string            `ch:"environment"`
	Host          string            `ch:"host"`
	Source        string            `ch:"source"`
	TraceID       string            `ch:"trace_id"`
	SpanID        string            `ch:"span_id"`
	RequestID     string            `ch:"request_id"`
	UserID        string            `ch:"user_id"`
	Message       string            `ch:"message"`
	Tags          map[string]string `ch:"tags"`
	Attributes    map[string]string `ch:"attributes"`
	IngestionTime time.Time         `ch:"ingestion_time"`
}

// LogFilter holds optional query filters for fetching logs.
type LogFilter struct {
	TenantID    string
	ProjectID   string
	Service     string
	Level       string
	Environment string
	From        *time.Time
	To          *time.Time
	Limit       int
	Offset      int
}
