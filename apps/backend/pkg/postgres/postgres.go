package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	// ConnString, if set, is passed to pgx verbatim (libpq URL or keyword/value DSN).
	ConnString   string
	Host         string
	Port         int
	User         string
	Password     string
	Database     string
	SSLMode      string
	MaxOpenConns int32
	MaxIdleConns int32         // maps to MinConns in pgx
	MaxLifetime  time.Duration // e.g. 5 * time.Minute
	MaxIdleTime  time.Duration // e.g. 1 * time.Minute (no equivalent in database/sql)
}

func (c Config) DSN() string {
	if c.ConnString != "" {
		return c.ConnString
	}
	var parts []string
	if c.Host != "" {
		parts = append(parts, fmt.Sprintf("host=%s", c.Host))
	}
	if c.Port > 0 {
		parts = append(parts, fmt.Sprintf("port=%d", c.Port))
	}
	if c.User != "" {
		parts = append(parts, fmt.Sprintf("user=%s", c.User))
	}
	if c.Password != "" {
		parts = append(parts, fmt.Sprintf("password=%s", c.Password))
	}
	if c.Database != "" {
		parts = append(parts, fmt.Sprintf("dbname=%s", c.Database))
	}
	if c.SSLMode != "" {
		parts = append(parts, fmt.Sprintf("sslmode=%s", c.SSLMode))
	}
	return strings.Join(parts, " ")
}

func New(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("postgres: parse config: %w", err)
	}

	if cfg.MaxOpenConns > 0 {
		poolCfg.MaxConns = cfg.MaxOpenConns
	}
	if cfg.MaxIdleConns > 0 {
		poolCfg.MinConns = cfg.MaxIdleConns
	}
	if cfg.MaxLifetime > 0 {
		poolCfg.MaxConnLifetime = cfg.MaxLifetime
	}
	if cfg.MaxIdleTime > 0 {
		poolCfg.MaxConnIdleTime = cfg.MaxIdleTime
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("postgres: create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("postgres: ping: %w", err)
	}

	return pool, nil
}
