package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
)

var CHDB clickhouse.Conn

type ClickHouseConfig struct {
	DSN string
}

// NewClickHouseDB initializes and returns a native ClickHouse v2 connection.
func NewClickHouseDB(dsn string) (clickhouse.Conn, error) {
	opts, err := clickhouse.ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("clickhouse: parse DSN: %w", err)
	}

	conn, err := clickhouse.Open(opts)
	if err != nil {
		return nil, fmt.Errorf("clickhouse: open connection: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("clickhouse: ping failed: %w", err)
	}

	CHDB = conn

	return conn, nil
}
