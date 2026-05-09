package domain

import "encoding/json"

type Log struct {
	TenantID    string                 `json:"tenant_id"`
	ProjectID   string                 `json:"project_id"`
	Level       string                 `json:"level"     binding:"required"`
	Timestamp   int64                  `json:"timestamp"`
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

func (l *Log) ToJSON() ([]byte, error) {
	return json.Marshal(l)
}
