package application

import (
	"context"
	"encoding/json"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/indalyadav56/logify/apps/backend/internal/outbox/domain"
)

// OutboxPublisher provides a convenient API for domain services to enqueue
// outbox events within their existing database transactions.
type OutboxPublisher struct {
	repo   domain.OutboxRepository
	logger *zap.Logger
}

// NewOutboxPublisher creates a new OutboxPublisher.
func NewOutboxPublisher(repo domain.OutboxRepository, logger *zap.Logger) *OutboxPublisher {
	return &OutboxPublisher{
		repo:   repo,
		logger: logger.Named("outbox_publisher"),
	}
}

// Publish serialises the payload to JSON and writes an outbox event inside
// the given GORM transaction. This guarantees that the event is persisted
// atomically with the domain operation.
func (p *OutboxPublisher) Publish(
	ctx context.Context,
	tx *gorm.DB,
	aggregateType, aggregateID, eventType, topic string,
	payload interface{},
) error {
	data, err := json.Marshal(payload)
	if err != nil {
		p.logger.Error("failed to marshal outbox payload",
			zap.String("aggregate_type", aggregateType),
			zap.String("event_type", eventType),
			zap.Error(err),
		)
		return err
	}

	event := domain.NewOutboxEvent(aggregateType, aggregateID, eventType, topic, data)

	if err := p.repo.CreateTx(ctx, tx, event); err != nil {
		p.logger.Error("failed to create outbox event",
			zap.String("aggregate_type", aggregateType),
			zap.String("aggregate_id", aggregateID),
			zap.String("event_type", eventType),
			zap.Error(err),
		)
		return err
	}

	p.logger.Debug("outbox event enqueued",
		zap.String("event_id", event.ID.String()),
		zap.String("topic", topic),
		zap.String("event_type", eventType),
	)

	return nil
}

// PublishDirect writes an outbox event outside of a caller-managed transaction.
// Use this only when the caller does not need transactional guarantees with
// another domain write.
func (p *OutboxPublisher) PublishDirect(
	ctx context.Context,
	aggregateType, aggregateID, eventType, topic string,
	payload interface{},
) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	event := domain.NewOutboxEvent(aggregateType, aggregateID, eventType, topic, data)
	return p.repo.Create(ctx, event)
}
