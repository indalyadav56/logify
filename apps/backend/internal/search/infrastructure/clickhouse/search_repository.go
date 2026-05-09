package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/search/domain"
)

const logsTable = "logify.logs"

// logRow mirrors the logify.logs table for ScanStruct.
type logRow struct {
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

func fromRow(r logRow) domain.LogEntry {
	return domain.LogEntry{
		LogID:         r.ID.String(),
		TenantID:      r.TenantID,
		ProjectID:     r.ProjectID,
		Timestamp:     r.Timestamp,
		Severity:      r.Level,
		Service:       r.Service,
		Namespace:     r.Namespace,
		Environment:   r.Environment,
		Host:          r.Host,
		Source:        r.Source,
		TraceID:       r.TraceID,
		SpanID:        r.SpanID,
		RequestID:     r.RequestID,
		UserID:        r.UserID,
		Body:          r.Message,
		Tags:          r.Tags,
		Attributes:    r.Attributes,
		IngestionTime: r.IngestionTime,
	}
}

// SearchRepository implements domain.Repository against ClickHouse.
type SearchRepository struct {
	conn ch.Conn
	log  *zap.Logger
}

func NewSearchRepository(conn ch.Conn, log *zap.Logger) *SearchRepository {
	return &SearchRepository{conn: conn, log: log}
}

const selectCols = `id, tenant_id, project_id, timestamp, level, service, namespace,
	environment, host, source, trace_id, span_id, request_id, user_id,
	message, tags, attributes, ingestion_time`

func (r *SearchRepository) Search(ctx context.Context, q domain.Query) (*domain.SearchResult, error) {
	where, args := buildSearchWhere(q)

	limit := q.Limit
	if limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000
	}

	order := "DESC"
	if !q.SortDesc {
		order = "ASC"
	}

	query := fmt.Sprintf(
		"SELECT %s FROM %s %s ORDER BY timestamp %s LIMIT %d",
		selectCols, logsTable, where, order, limit,
	)

	start := time.Now()
	rows, err := r.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("clickhouse search: %w", err)
	}
	defer rows.Close()

	logs := make([]domain.LogEntry, 0, limit)
	for rows.Next() {
		var row logRow
		if err := rows.ScanStruct(&row); err != nil {
			return nil, fmt.Errorf("clickhouse scan: %w", err)
		}
		logs = append(logs, fromRow(row))
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("clickhouse rows: %w", err)
	}

	return &domain.SearchResult{
		Logs:   logs,
		Total:  uint64(len(logs)),
		TookMs: time.Since(start).Milliseconds(),
	}, nil
}

func (r *SearchRepository) GetByID(ctx context.Context, tenantID, logID string) (*domain.LogEntry, error) {
	query := fmt.Sprintf(
		"SELECT %s FROM %s WHERE tenant_id = ? AND id = ? LIMIT 1",
		selectCols, logsTable,
	)

	rows, err := r.conn.Query(ctx, query, tenantID, logID)
	if err != nil {
		return nil, fmt.Errorf("clickhouse get by id: %w", err)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, domain.ErrLogNotFound
	}

	var row logRow
	if err := rows.ScanStruct(&row); err != nil {
		return nil, fmt.Errorf("clickhouse scan: %w", err)
	}

	entry := fromRow(row)
	return &entry, nil
}

func (r *SearchRepository) Aggregate(ctx context.Context, req domain.AggregationRequest) (*domain.AggregationResult, error) {
	where, args := buildSearchWhere(req.Query)

	var query string
	if req.Interval != "" {
		fn := timeIntervalFn(req.Interval)
		query = fmt.Sprintf(
			"SELECT %s AS bucket, count() AS cnt FROM %s %s GROUP BY bucket ORDER BY bucket ASC",
			fn, logsTable, where,
		)
	} else {
		col := sanitizeGroupBy(req.GroupBy)
		query = fmt.Sprintf(
			"SELECT %s AS key, count() AS cnt FROM %s %s GROUP BY key ORDER BY cnt DESC",
			col, logsTable, where,
		)
	}

	rows, err := r.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("clickhouse aggregate: %w", err)
	}
	defer rows.Close()

	var buckets []domain.AggBucket
	for rows.Next() {
		var b domain.AggBucket
		if req.Interval != "" {
			var t time.Time
			var cnt uint64
			if err := rows.Scan(&t, &cnt); err != nil {
				return nil, fmt.Errorf("clickhouse scan histogram: %w", err)
			}
			b.Timestamp = &t
			b.Key = t.Format(time.RFC3339)
			b.Count = cnt
		} else {
			var key string
			var cnt uint64
			if err := rows.Scan(&key, &cnt); err != nil {
				return nil, fmt.Errorf("clickhouse scan group: %w", err)
			}
			b.Key = key
			b.Count = cnt
		}
		buckets = append(buckets, b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("clickhouse aggregate rows: %w", err)
	}

	return &domain.AggregationResult{Buckets: buckets}, nil
}

// buildSearchWhere constructs a parameterised WHERE clause from a domain Query.
func buildSearchWhere(q domain.Query) (string, []any) {
	var conds []string
	var args []any

	if q.TenantID != "" {
		conds = append(conds, "tenant_id = ?")
		args = append(args, q.TenantID)
	}
	if !q.From.IsZero() {
		conds = append(conds, "timestamp >= ?")
		args = append(args, q.From.UTC())
	}
	if !q.To.IsZero() {
		conds = append(conds, "timestamp <= ?")
		args = append(args, q.To.UTC())
	}
	if len(q.Services) > 0 {
		conds = append(conds, "service IN (?)")
		args = append(args, q.Services)
	}
	if len(q.Severities) > 0 {
		conds = append(conds, "level IN (?)")
		args = append(args, q.Severities)
	}
	if len(q.Hosts) > 0 {
		conds = append(conds, "host IN (?)")
		args = append(args, q.Hosts)
	}
	if q.TraceID != "" {
		conds = append(conds, "trace_id = ?")
		args = append(args, q.TraceID)
	}
	if q.RequestID != "" {
		conds = append(conds, "request_id = ?")
		args = append(args, q.RequestID)
	}
	if q.BodyContains != "" {
		conds = append(conds, "positionCaseInsensitive(message, ?) > 0")
		args = append(args, q.BodyContains)
	}
	for key, val := range q.Attributes {
		conds = append(conds, "attributes[?] = ?")
		args = append(args, key, val)
	}

	if len(conds) == 0 {
		return "", args
	}
	return "WHERE " + strings.Join(conds, " AND "), args
}

func timeIntervalFn(interval string) string {
	switch interval {
	case "1m":
		return "toStartOfMinute(timestamp)"
	case "5m":
		return "toStartOfFiveMinutes(timestamp)"
	case "1h":
		return "toStartOfHour(timestamp)"
	case "1d":
		return "toStartOfDay(timestamp)"
	default:
		return "toStartOfHour(timestamp)"
	}
}

// sanitizeGroupBy maps a user-supplied group-by name to a safe ClickHouse column name.
func sanitizeGroupBy(field string) string {
	allowed := map[string]string{
		"level":       "level",
		"service":     "service",
		"environment": "environment",
		"host":        "host",
		"source":      "source",
		"namespace":   "namespace",
	}
	if col, ok := allowed[field]; ok {
		return col
	}
	return "level"
}
