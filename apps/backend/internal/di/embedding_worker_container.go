package di

import (
	"context"
	"errors"
	"fmt"

	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	embedderApp "github.com/indalyadav56/logify/apps/backend/internal/embedder/application"
	embedderDomain "github.com/indalyadav56/logify/apps/backend/internal/embedder/domain"
	embedderKafka "github.com/indalyadav56/logify/apps/backend/internal/embedder/infrastructure/kafka"
	embedderPG "github.com/indalyadav56/logify/apps/backend/internal/embedder/infrastructure/postgres"
	"github.com/indalyadav56/logify/apps/backend/pkg/ollama"
	"github.com/indalyadav56/logify/apps/backend/pkg/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EmbeddingWorkerContainer struct {
	Config     *config.Config
	Logger     *zap.Logger
	postgresDB *pgxpool.Pool

	KafkaReader     *kafka.Reader
	EmbedderService *embedderApp.EmbedderService
	LogRepository   embedderDomain.LogRepository
	OllamaClient    *ollama.Client
}

func NewEmbeddingWorkerContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*EmbeddingWorkerContainer, error) {
	c := &EmbeddingWorkerContainer{Config: cfg, Logger: log}

	pool, err := postgres.New(ctx, postgres.Config{
		Host:         c.Config.Postgres.Host,
		Port:         c.Config.Postgres.Port,
		User:         c.Config.Postgres.User,
		Password:     c.Config.Postgres.Password,
		Database:     c.Config.Postgres.Database,
		SSLMode:      c.Config.Postgres.SSLMode,
		MaxOpenConns: int32(c.Config.Postgres.MaxOpenConns),
		MaxIdleConns: int32(c.Config.Postgres.MaxIdleConns),
		MaxLifetime:  c.Config.Postgres.ConnMaxLifetime,
		MaxIdleTime:  c.Config.Postgres.ConnMaxIdleTime,
	})
	if err != nil {
		return nil, fmt.Errorf("postgres: %w", err)
	}
	c.postgresDB = pool

	topic := "logs"
	groupID := "log-embedder-group"

	if err := ensureKafkaTopics(ctx, c.Config.Kafka.Brokers, topic); err != nil {
		log.Warn("failed to pre-create kafka topics (may already exist)", zap.Error(err))
	}

	c.KafkaReader = kafka.NewReader(kafka.ReaderConfig{
		Brokers: c.Config.Kafka.Brokers,
		Topic:   topic,
		GroupID: groupID,
	})

	c.initEmbedder(log)
	return c, nil
}

func (c *EmbeddingWorkerContainer) Close() error {
	var errs []error
	if c.KafkaReader != nil {
		if err := c.KafkaReader.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if c.postgresDB != nil {
		c.postgresDB.Close()
	}
	return errors.Join(errs...)
}

func (c *EmbeddingWorkerContainer) initEmbedder(log *zap.Logger) {
	c.OllamaClient = ollama.NewClient(ollama.Config{
		BaseURL: c.Config.Ollama.BaseURL,
		Model:   c.Config.Ollama.Model,
		Timeout: c.Config.Ollama.Timeout,
	})

	consumer := embedderKafka.NewLogConsumer(c.KafkaReader, log)
	c.LogRepository = embedderPG.NewLogRepository(c.postgresDB)
	c.EmbedderService = embedderApp.NewEmbedderService(consumer, c.OllamaClient, c.LogRepository, log)
}
