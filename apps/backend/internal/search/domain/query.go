package domain

import "time"

type Query struct {
	TenantID     string
	ProjectID    string
	Services     []string
	Severities   []string
	Hosts        []string
	TraceID      string
	RequestID    string
	BodyContains string
	Attributes   map[string]string
	From         time.Time
	To           time.Time
	Limit        int
	Cursor       string
	SortDesc     bool
}

func (q *Query) ApplyTimeRangeDefaults(window time.Duration) {
	if q.To.IsZero() {
		q.To = time.Now().UTC()
	}
	if q.From.IsZero() {
		q.From = q.To.Add(-window)
	}
}

func (q Query) Validate() error {
	if q.TenantID == "" {
		return ErrTenantIDRequired
	}
	if q.ProjectID == "" {
		return ErrProjectIDRequired
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
