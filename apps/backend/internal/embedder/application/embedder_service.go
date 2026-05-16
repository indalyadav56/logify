package application

import (
	"context"
	"encoding/json"
	"strings"

	ingestDomain "github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/embedder/domain"
	"github.com/pgvector/pgvector-go"
	"go.uber.org/zap"
)

// LogConsumer consumes raw Kafka payloads.
type LogConsumer interface {
	Consume(ctx context.Context, handler func(ctx context.Context, msg []byte) error) error
}

// Embedder calls an embedding model and persists vectors.
type Embedder interface {
	Embed(ctx context.Context, text string) ([]float32, error)
}

// EmbedderService consumes logs, embeds them via Ollama, and stores rows in Postgres.
type EmbedderService struct {
	consumer LogConsumer
	embedder Embedder
	repo     domain.LogRepository
	logger   *zap.Logger
}

func NewEmbedderService(
	consumer LogConsumer,
	embedder Embedder,
	repo domain.LogRepository,
	logger *zap.Logger,
) *EmbedderService {
	return &EmbedderService{
		consumer: consumer,
		embedder: embedder,
		repo:     repo,
		logger:   logger.Named("embedder_service"),
	}
}

func (s *EmbedderService) Start(ctx context.Context) error {
	s.logger.Info("starting embedding worker")
	return s.consumer.Consume(ctx, s.handleMessage)
}

func (s *EmbedderService) handleMessage(ctx context.Context, msg []byte) error {
	var log ingestDomain.Log
	if err := json.Unmarshal(msg, &log); err != nil {
		s.logger.Error("unmarshal log message", zap.Error(err))
		return nil
	}

	text := embeddingText(log)
	vec, err := s.embedder.Embed(ctx, text)
	if err != nil {
		s.logger.Error("ollama embed failed",
			zap.Error(err),
			zap.String("project_id", log.ProjectID),
		)
		return err
	}

	if len(vec) != domain.EmbeddingDimensions {
		s.logger.Warn("unexpected embedding dimensions",
			zap.Int("expected", domain.EmbeddingDimensions),
			zap.Int("got", len(vec)),
		)
	}

	metadata, err := json.Marshal(log)
	if err != nil {
		s.logger.Error("marshal metadata", zap.Error(err))
		return err
	}

	entry := &domain.LogEntry{
		Metadata:  metadata,
		Embedding: pgvector.NewVector(vec),
	}

	if err := s.repo.Insert(ctx, entry); err != nil {
		s.logger.Error("insert embedded log", zap.Error(err))
		return err
	}

	s.logger.Info("stored log embedding",
		zap.String("log_id", entry.ID.String()),
		zap.String("project_id", log.ProjectID),
		zap.Int("dimensions", len(vec)),
	)
	return nil
}

func embeddingText(log ingestDomain.Log) string {
	if s := strings.TrimSpace(log.Message); s != "" {
		return s
	}
	b, err := json.Marshal(log)
	if err != nil {
		return ""
	}
	return string(b)
}
