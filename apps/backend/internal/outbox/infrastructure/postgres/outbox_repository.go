package postgres

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/indalyadav56/logify/apps/backend/internal/outbox/domain"
)

// outboxRepository is the PostgreSQL implementation of domain.OutboxRepository.
type outboxRepository struct {
	db *gorm.DB
}

// NewOutboxRepository creates a new PostgreSQL-backed outbox repository.
func NewOutboxRepository(db *gorm.DB) domain.OutboxRepository {
	return &outboxRepository{db: db}
}

func (r *outboxRepository) Create(ctx context.Context, event *domain.OutboxEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}

func (r *outboxRepository) CreateTx(ctx context.Context, tx interface{}, event *domain.OutboxEvent) error {
	gormTx, ok := tx.(*gorm.DB)
	if !ok {
		return fmt.Errorf("outbox: expected *gorm.DB transaction, got %T", tx)
	}
	return gormTx.WithContext(ctx).Create(event).Error
}

func (r *outboxRepository) FetchPending(ctx context.Context, limit int) ([]*domain.OutboxEvent, error) {
	var events []*domain.OutboxEvent

	// Use a transaction with row-level locking (FOR UPDATE SKIP LOCKED) so
	// multiple relay workers don't process the same events.
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		result := tx.
			Clauses(clause.Locking{
				Strength: "UPDATE",
				Options:  "SKIP LOCKED",
			}).
			Where("status = ?", domain.OutboxStatusPending).
			Order("created_at ASC").
			Limit(limit).
			Find(&events)

		if result.Error != nil {
			return result.Error
		}

		if len(events) == 0 {
			return nil
		}

		// Mark fetched events as processing.
		ids := make([]interface{}, len(events))
		for i, e := range events {
			ids[i] = e.ID
			e.MarkProcessing()
		}

		return tx.Model(&domain.OutboxEvent{}).
			Where("id IN ?", ids).
			Update("status", domain.OutboxStatusProcessing).
			Error
	})

	if err != nil {
		return nil, fmt.Errorf("outbox: failed to fetch pending events: %w", err)
	}

	return events, nil
}

func (r *outboxRepository) MarkCompleted(ctx context.Context, event *domain.OutboxEvent) error {
	event.MarkCompleted()
	return r.db.WithContext(ctx).
		Model(event).
		Updates(map[string]interface{}{
			"status":       event.Status,
			"processed_at": event.ProcessedAt,
			"last_error":   "",
		}).Error
}

func (r *outboxRepository) MarkFailed(ctx context.Context, event *domain.OutboxEvent, errMsg string) error {
	event.MarkFailed(errMsg)
	return r.db.WithContext(ctx).
		Model(event).
		Updates(map[string]interface{}{
			"status":      event.Status,
			"retry_count": event.RetryCount,
			"last_error":  event.LastError,
		}).Error
}

func (r *outboxRepository) DeleteCompleted(ctx context.Context, retentionHours int) (int64, error) {
	cutoff := time.Now().Add(-time.Duration(retentionHours) * time.Hour)
	result := r.db.WithContext(ctx).
		Where("status = ? AND processed_at < ?", domain.OutboxStatusCompleted, cutoff).
		Delete(&domain.OutboxEvent{})

	return result.RowsAffected, result.Error
}
