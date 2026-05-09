package domain

import "time"

// Query represents a log search query in domain terms.
// Independent of HTTP DTOs and storage backend.
type Query struct {
	TenantID     string
	Services     []string // filter by service names (OR)
	Severities   []string // filter by severity (OR)
	Hosts        []string
	TraceID      string            // exact trace_id match
	RequestID    string            // exact request_id match
	BodyContains string            // free-text search in message body
	Attributes   map[string]string // attribute filters (AND): map[key]value
	From         time.Time
	To           time.Time
	Limit        int    // page size, default 100, max 1000
	Cursor       string // for cursor-based pagination
	SortDesc     bool   // true = newest first
}

// Validate ensures the query is well-formed.
func (q Query) Validate() error {
	if q.TenantID == "" {
		return ErrTenantIDRequired
	}
	if q.From.IsZero() || q.To.IsZero() {
		return ErrTimeRangeRequired
	}
	if q.From.After(q.To) {
		return ErrInvalidTimeRange
	}
	if q.Limit <= 0 {
		q.Limit = 100
	}
	if q.Limit > 1000 {
		return ErrLimitTooLarge
	}
	return nil
}
