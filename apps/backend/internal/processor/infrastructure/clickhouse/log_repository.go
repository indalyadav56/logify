package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/indalyadav56/logify/apps/backend/internal/processor/domain"
)

const (
	table = "logify.logs"
)

type LogRepository struct {
	conn clickhouse.Conn
}

func NewLogRepository(conn clickhouse.Conn) *LogRepository {
	return &LogRepository{conn: conn}
}

func (r *LogRepository) InsertBatch(ctx context.Context, logs []*domain.Log) error {
	if len(logs) == 0 {
		return nil
	}

	batch, err := r.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", table))
	if err != nil {
		return fmt.Errorf("clickhouse: prepare batch: %w", err)
	}

	for _, l := range logs {
		if err := batch.AppendStruct(l); err != nil {
			return fmt.Errorf("clickhouse: append struct: %w", err)
		}
	}

	if err := batch.Send(); err != nil {
		return fmt.Errorf("clickhouse: send batch: %w", err)
	}

	return nil
}

// Query returns logs matching the given filter, ordered by timestamp descending.
func (r *LogRepository) Query(ctx context.Context, filter domain.LogFilter) ([]*domain.Log, error) {
	where, args := buildWhere(filter)

	limit := filter.Limit
	if limit <= 0 {
		limit = 100
	}
	offset := filter.Offset
	if offset < 0 {
		offset = 0
	}

	query := fmt.Sprintf(
		"SELECT id, tenant_id, project_id, timestamp, level, service, namespace, environment, host, source, trace_id, span_id, request_id, user_id, message, tags, attributes, ingestion_time FROM %s %s ORDER BY timestamp DESC LIMIT %d OFFSET %d",
		table, where, limit, offset,
	)

	rows, err := r.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("clickhouse: query logs: %w", err)
	}
	defer rows.Close()

	var result []*domain.Log
	for rows.Next() {
		var l domain.Log
		if err := rows.ScanStruct(&l); err != nil {
			return nil, fmt.Errorf("clickhouse: scan log row: %w", err)
		}
		result = append(result, &l)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("clickhouse: rows error: %w", err)
	}

	return result, nil
}

// Count returns the total number of logs matching the given filter.
func (r *LogRepository) Count(ctx context.Context, filter domain.LogFilter) (uint64, error) {
	where, args := buildWhere(filter)

	query := fmt.Sprintf("SELECT count() FROM %s %s", table, where)

	var count uint64
	if err := r.conn.QueryRow(ctx, query, args...).Scan(&count); err != nil {
		return 0, fmt.Errorf("clickhouse: count logs: %w", err)
	}

	return count, nil
}

// buildWhere constructs a parameterised WHERE clause from a LogFilter.
// It returns the clause string (including the leading "WHERE" keyword when
// there is at least one condition) and the corresponding argument slice.
func buildWhere(f domain.LogFilter) (string, []any) {
	var (
		conditions []string
		args       []any
	)

	if f.TenantID != "" {
		conditions = append(conditions, "tenant_id = ?")
		args = append(args, f.TenantID)
	}
	if f.ProjectID != "" {
		conditions = append(conditions, "project_id = ?")
		args = append(args, f.ProjectID)
	}
	if f.Service != "" {
		conditions = append(conditions, "service = ?")
		args = append(args, f.Service)
	}
	if f.Level != "" {
		conditions = append(conditions, "level = ?")
		args = append(args, f.Level)
	}
	if f.Environment != "" {
		conditions = append(conditions, "environment = ?")
		args = append(args, f.Environment)
	}
	if f.From != nil {
		conditions = append(conditions, "timestamp >= ?")
		args = append(args, f.From.UTC().Truncate(time.Millisecond))
	}
	if f.To != nil {
		conditions = append(conditions, "timestamp <= ?")
		args = append(args, f.To.UTC().Truncate(time.Millisecond))
	}

	if len(conditions) == 0 {
		return "", args
	}

	return "WHERE " + strings.Join(conditions, " AND "), args
}
