package domain

import (
	"context"
)

// OutboxRepository defines the contract for outbox event persistence.
type OutboxRepository interface {
	// Create persists a new outbox event (typically within an existing transaction).
	Create(ctx context.Context, event *OutboxEvent) error

	// CreateTx persists a new outbox event using the provided GORM transaction.
	// This is the primary method — callers wrap domain writes and outbox writes
	// in the same database transaction.
	CreateTx(ctx context.Context, tx interface{}, event *OutboxEvent) error

	// FetchPending retrieves up to `limit` pending events, ordered by creation time.
	// It atomically marks them as "processing" to prevent concurrent relay workers
	// from picking up the same events (SELECT ... FOR UPDATE SKIP LOCKED).
	FetchPending(ctx context.Context, limit int) ([]*OutboxEvent, error)

	// MarkCompleted sets the event status to completed.
	MarkCompleted(ctx context.Context, event *OutboxEvent) error

	// MarkFailed records a failure and adjusts retry state.
	MarkFailed(ctx context.Context, event *OutboxEvent, errMsg string) error

	// DeleteCompleted removes completed events older than the given retention
	// period (in hours) to keep the outbox table lean.
	DeleteCompleted(ctx context.Context, retentionHours int) (int64, error)
}
