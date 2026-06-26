package http

import (
	"strings"
	"time"

	"github.com/indalyadav56/logify/apps/backend/internal/search/domain"
)

type SearchRequest struct {
	ProjectID string    `json:"project_id" binding:"required"`
	Query     string    `json:"query,omitempty"`
	TimeRange TimeRange `json:"time_range"`
	Limit     int       `json:"limit,omitempty"`
	Cursor    string    `json:"cursor,omitempty"`
	Sort      Sort      `json:"sort"`
}

func (r SearchRequest) ToQuery() domain.Query {
	return domain.Query{
		ProjectID:    r.ProjectID,
		BodyContains: r.Query,
		From:         r.TimeRange.From,
		To:           r.TimeRange.To,
		Limit:        r.Limit,
		Cursor:       r.Cursor,
		SortDesc:     !strings.EqualFold(r.Sort.Order, "asc"),
	}
}

type TimeRange struct {
	From time.Time `json:"from"`
	To   time.Time `json:"to"`
}

type Sort struct {
	Field string `json:"field,omitempty"`
	Order string `json:"order,omitempty"` // "asc" or "desc"
}

type SearchResponse struct {
	Logs       []LogResponse `json:"logs"`
	Total      uint64        `json:"total"`
	NextCursor string        `json:"next_cursor,omitempty"`
	TookMs     int64         `json:"took_ms"`
}

type LogResponse struct {
	LogID         string            `json:"log_id"`
	TenantID      string            `json:"tenant_id"`
	ProjectID     string            `json:"project_id"`
	Timestamp     time.Time         `json:"timestamp"`
	Severity      string            `json:"severity"`
	Service       string            `json:"service"`
	Namespace     string            `json:"namespace,omitempty"`
	Environment   string            `json:"environment,omitempty"`
	Host          string            `json:"host,omitempty"`
	Source        string            `json:"source,omitempty"`
	TraceID       string            `json:"trace_id,omitempty"`
	SpanID        string            `json:"span_id,omitempty"`
	RequestID     string            `json:"request_id,omitempty"`
	UserID        string            `json:"user_id,omitempty"`
	Body          string            `json:"body"`
	Tags          map[string]string `json:"tags,omitempty"`
	Attributes    map[string]string `json:"attributes,omitempty"`
	IngestionTime time.Time         `json:"ingestion_time"`
}

type AggregateRequest struct {
	TenantID string    `json:"tenant_id,omitempty"`
	GroupBy  string    `json:"group_by,omitempty"`
	Interval string    `json:"interval,omitempty"` // "1m", "5m", "1h", "1d"
	From     time.Time `json:"from" binding:"required"`
	To       time.Time `json:"to"   binding:"required"`
}

type AggregateResponse struct {
	Buckets []AggBucketResponse `json:"buckets"`
}

type AggBucketResponse struct {
	Timestamp *time.Time `json:"timestamp,omitempty"`
	Key       string     `json:"key,omitempty"`
	Count     uint64     `json:"count"`
}

type ExportRequest struct {
	TenantID     string            `json:"tenant_id,omitempty"`
	Services     []string          `json:"services,omitempty"`
	Severities   []string          `json:"severities,omitempty"`
	BodyContains string            `json:"body_contains,omitempty"`
	Attributes   map[string]string `json:"attributes,omitempty"`
	From         time.Time         `json:"from" binding:"required"`
	To           time.Time         `json:"to"   binding:"required"`
	Format       string            `json:"format,omitempty"` // "json" | "csv" | "ndjson"
}

type ExportResponse struct {
	ExportID  string    `json:"export_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type ExportStatusResponse struct {
	ExportID    string    `json:"export_id"`
	Status      string    `json:"status"`
	DownloadURL string    `json:"download_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

func toSearchResponse(r *domain.SearchResult) SearchResponse {
	logs := make([]LogResponse, len(r.Logs))
	for i, l := range r.Logs {
		logs[i] = toLogResponse(l)
	}
	return SearchResponse{
		Logs:       logs,
		Total:      r.Total,
		NextCursor: r.NextCursor,
		TookMs:     r.TookMs,
	}
}

func toLogResponse(e domain.LogEntry) LogResponse {
	return LogResponse{
		LogID:         e.LogID,
		TenantID:      e.TenantID,
		ProjectID:     e.ProjectID,
		Timestamp:     e.Timestamp,
		Severity:      e.Severity,
		Service:       e.Service,
		Namespace:     e.Namespace,
		Environment:   e.Environment,
		Host:          e.Host,
		Source:        e.Source,
		TraceID:       e.TraceID,
		SpanID:        e.SpanID,
		RequestID:     e.RequestID,
		UserID:        e.UserID,
		Body:          e.Body,
		Tags:          e.Tags,
		Attributes:    e.Attributes,
		IngestionTime: e.IngestionTime,
	}
}

func toAggregateResponse(r *domain.AggregationResult) AggregateResponse {
	buckets := make([]AggBucketResponse, len(r.Buckets))
	for i, b := range r.Buckets {
		buckets[i] = AggBucketResponse{
			Timestamp: b.Timestamp,
			Key:       b.Key,
			Count:     b.Count,
		}
	}
	return AggregateResponse{Buckets: buckets}
}
