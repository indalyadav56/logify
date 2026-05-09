package domain

import (
	"time"

	"github.com/google/uuid"
)

// OutboxStatus represents the processing state of an outbox event.
type OutboxStatus string

const (
	OutboxStatusPending    OutboxStatus = "pending"
	OutboxStatusProcessing OutboxStatus = "processing"
	OutboxStatusCompleted  OutboxStatus = "completed"
	OutboxStatusFailed     OutboxStatus = "failed"
)

// OutboxEvent is the domain entity for the transactional outbox pattern.
// Events are written to the outbox table in the same DB transaction as the
// domain operation, then asynchronously relayed to the message broker.
type OutboxEvent struct {
	ID            uuid.UUID    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	AggregateType string       `json:"aggregate_type" gorm:"not null;size:100;index"`
	AggregateID   string       `json:"aggregate_id" gorm:"not null;size:100;index"`
	EventType     string       `json:"event_type" gorm:"not null;size:100;index"`
	Topic         string       `json:"topic" gorm:"not null;size:255"`
	Payload       []byte       `json:"payload" gorm:"type:jsonb;not null"`
	Status        OutboxStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending';index"`
	RetryCount    int          `json:"retry_count" gorm:"not null;default:0"`
	MaxRetries    int          `json:"max_retries" gorm:"not null;default:5"`
	LastError     string       `json:"last_error,omitempty" gorm:"type:text"`
	ProcessedAt   *time.Time   `json:"processed_at,omitempty"`
	CreatedAt     time.Time    `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time    `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName overrides the default GORM table name.
func (OutboxEvent) TableName() string {
	return "outbox_events"
}

// NewOutboxEvent creates a new pending outbox event.
func NewOutboxEvent(aggregateType, aggregateID, eventType, topic string, payload []byte) *OutboxEvent {
	return &OutboxEvent{
		ID:            uuid.New(),
		AggregateType: aggregateType,
		AggregateID:   aggregateID,
		EventType:     eventType,
		Topic:         topic,
		Payload:       payload,
		Status:        OutboxStatusPending,
		MaxRetries:    5,
	}
}

// CanRetry returns true if the event has not exhausted its retry budget.
func (e *OutboxEvent) CanRetry() bool {
	return e.RetryCount < e.MaxRetries
}

// MarkProcessing transitions the event to the processing state.
func (e *OutboxEvent) MarkProcessing() {
	e.Status = OutboxStatusProcessing
}

// MarkCompleted transitions the event to the completed state.
func (e *OutboxEvent) MarkCompleted() {
	now := time.Now()
	e.Status = OutboxStatusCompleted
	e.ProcessedAt = &now
	e.LastError = ""
}

// MarkFailed increments the retry counter and records the error.
// If retries are exhausted, the status stays as failed; otherwise it resets to pending.
func (e *OutboxEvent) MarkFailed(err string) {
	e.RetryCount++
	e.LastError = err

	if e.CanRetry() {
		e.Status = OutboxStatusPending
	} else {
		e.Status = OutboxStatusFailed
	}
}
