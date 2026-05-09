package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/ClickHouse/clickhouse-go/v2"
)

func main() {
	consume()
}

func consume() {
	db, err := NewClickHouseDB(ClickHouseConfig{})
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("DB", db)
}

type ClickHouseConfig struct {
	DSN string
}

// NewClickHouseDB initializes and returns a ClickHouse database connection.
func NewClickHouseDB(cfg ClickHouseConfig) (*sql.DB, error) {
	db, err := sql.Open("clickhouse", "tcp://default:mypassword@localhost:9000/logify")
	if err != nil {
		return nil, fmt.Errorf("failed to open clickhouse connection: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping clickhouse: %w", err)
	}

	return db, nil
}
