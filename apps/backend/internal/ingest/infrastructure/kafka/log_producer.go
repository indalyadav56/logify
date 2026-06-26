package kafka

import (
	"context"
	"errors"
	"fmt"

	"github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type logProducer struct {
	writer *kafka.Writer
	logger *zap.Logger
}

func NewLogProducer(writer *kafka.Writer, logger *zap.Logger) *logProducer {
	return &logProducer{
		writer: writer,
		logger: logger,
	}
}

func (lp *logProducer) Produce(ctx context.Context, log domain.Log) error {
	tenantID, ok := middleware.TenantIDFromContext(ctx)
	if !ok {
		return errors.New("tenant id not found")
	}

	log.TenantID = tenantID
	value, err := log.ToJSON()
	if err != nil {
		return fmt.Errorf("failed to serialize log: %w", err)
	}

	msg := kafka.Message{
		Key:   []byte(log.ProjectID),
		Value: value,
	}

	if err := lp.writer.WriteMessages(ctx, msg); err != nil {
		lp.logger.Error("failed to write message to kafka",
			zap.String("project_id", log.ProjectID),
			zap.Error(err),
		)
		return fmt.Errorf("kafka produce: %w", err)
	}

	lp.logger.Debug("message delivered",
		zap.String("topic", lp.writer.Topic),
		zap.String("project_id", log.ProjectID),
	)

	return nil
}

// Close flushes pending messages and shuts down the writer.
func (lp *logProducer) Close() error {
	return lp.writer.Close()
}
