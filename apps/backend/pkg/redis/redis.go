package cache

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"

	"github.com/indalyadav56/logify/apps/backend/pkg/config"
)

// NewRedisClient initializes and returns a Redis client.
func NewRedisClient(cfg config.RedisConfig) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return client, nil
}
