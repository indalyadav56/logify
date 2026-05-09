package di

import (
	"context"
	"database/sql"
	"errors"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type Shared struct {
	Config *config.Config
	Logger *zap.Logger

	DB    *sql.DB
	Redis *redis.Client
}

func NewShared(ctx context.Context, cfg *config.Config, log *zap.Logger) (*Shared, error) {
	s := &Shared{Config: cfg, Logger: log}

	// db, err := pgkpkg.New(ctx, cfg.Postgres)
	// if err != nil {
	// 	return nil, fmt.Errorf("postgres: %w", err)
	// }
	// s.DB = db

	// rdb, err := rdkpkg.New(ctx, cfg.Redis)
	// if err != nil {
	// 	s.DB.Close()
	// 	return nil, fmt.Errorf("redis: %w", err)
	// }
	// s.Redis = rdb

	return s, nil
}

func (s *Shared) Close() error {
	var errs []error
	if s.Redis != nil {
		if err := s.Redis.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if s.DB != nil {
		if err := s.DB.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	return errors.Join(errs...)
}
