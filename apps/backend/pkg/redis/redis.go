package cache

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type Config struct {
	Host     string
	Port     int
	Password string
	DB       int
}

func DefaultConfig() Config {
	return Config{
		Host:     "localhost",
		Port:     6379,
		Password: "",
		DB:       0,
	}
}

func NewRedisClient(cfg ...Config) (*redis.Client, error) {
	if len(cfg) == 0 {
		cfg = []Config{DefaultConfig()}
	}

	client := redis.NewClient(&redis.Options{
		// Addr:     cfg.Addr(),
		// Password: cfg.Password,
		// DB:       cfg.DB,
	})

	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return client, nil
}
