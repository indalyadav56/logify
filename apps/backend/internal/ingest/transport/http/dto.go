package http

import (
	"time"

	"github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
)

type CreateLogRequest struct {
	ProjectID   string                 `json:"project_id"`
	Level       string                 `json:"level"     binding:"required"`
	Timestamp   string                 `json:"timestamp"`
	Service     string                 `json:"service"`
	Namespace   string                 `json:"service_namespace"`
	Hostname    string                 `json:"hostname"`
	Environment string                 `json:"environment"`
	Message     string                 `json:"message"`
	TraceID     string                 `json:"trace_id"`
	SpanID      string                 `json:"span_id"`
	RequestID   string                 `json:"request_id"`
	UserID      string                 `json:"user_id"`
	Source      string                 `json:"source"`
	Tags        map[string]string      `json:"tags"`
	Metadata    map[string]interface{} `json:"metadata"`
}

func (r CreateLogRequest) ToDomain() domain.Log {
	ts := time.Now().Unix()
	if t, err := time.Parse(time.RFC3339, r.Timestamp); err == nil {
		ts = t.Unix()
	}
	return domain.Log{
		ProjectID:   r.ProjectID,
		Level:       r.Level,
		Timestamp:   ts,
		Message:     r.Message,
		Service:     r.Service,
		Namespace:   r.Namespace,
		Hostname:    r.Hostname,
		Environment: r.Environment,
		TraceID:     r.TraceID,
		SpanID:      r.SpanID,
		RequestID:   r.RequestID,
		UserID:      r.UserID,
		Source:      r.Source,
		Tags:        r.Tags,
		Metadata:    r.Metadata,
	}
}
