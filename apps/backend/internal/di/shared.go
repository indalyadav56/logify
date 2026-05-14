package di

import (
	"context"
	"errors"
	"fmt"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/indalyadav56/logify/apps/backend/pkg/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type Shared struct {
	Config *config.Config
	Logger *zap.Logger

	postgresDB *pgxpool.Pool
	Redis      *redis.Client
}

func NewShared(ctx context.Context, cfg *config.Config, log *zap.Logger) (*Shared, error) {
	s := &Shared{Config: cfg, Logger: log}

	pgCfg, err := cfg.PostgresPoolConfig(config.DefaultPostgresConn)
	if err != nil {
		return nil, fmt.Errorf("postgres config: %w", err)
	}

	pool, err := postgres.New(ctx, pgCfg)
	if err != nil {
		return nil, fmt.Errorf("postgres: %w", err)
	}
	s.postgresDB = pool

	// rdb, err := rdkpkg.New(ctx, cfg.Redis)
	// if err != nil {
	// 	s.DB.Close()
	// 	return nil, fmt.Errorf("redis: %w", err)
	// }
	// s.Redis = rdb

	return s, nil
}

// PostgresDB returns the primary OLTP pool, or nil if not initialized.
func (s *Shared) PostgresDB() *pgxpool.Pool {
	return s.postgresDB
}

func (s *Shared) Close() error {
	var errs []error
	if s.Redis != nil {
		if err := s.Redis.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if s.postgresDB != nil {
		s.postgresDB.Close()
	}
	return errors.Join(errs...)
}
