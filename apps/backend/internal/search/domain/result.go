package domain

import "time"

// LogEntry is a single log row returned from search.
// Field names use domain vocabulary; the repository layer maps them to storage columns.
type LogEntry struct {
	LogID        string
	TenantID     string
	ProjectID    string
	Timestamp    time.Time
	Severity     string // maps to the "level" column in storage
	Service      string
	Namespace    string
	Environment  string
	Host         string
	Source       string
	TraceID      string
	SpanID       string
	RequestID    string
	UserID       string
	Body         string // maps to the "message" column in storage
	Tags         map[string]string
	Attributes   map[string]string
	IngestionTime time.Time
}

// SearchResult is the paginated result of a search query.
type SearchResult struct {
	Logs       []LogEntry
	Total      uint64
	NextCursor string // empty when no more pages
	TookMs     int64
}
