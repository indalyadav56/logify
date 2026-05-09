package application

import (
	"context"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/outbox/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/messaging"
)

// RelayConfig holds settings for the outbox relay worker.
type RelayConfig struct {
	PollInterval   time.Duration // How often to poll for pending events.
	BatchSize      int           // Max events to fetch per poll cycle.
	RetentionHours int           // How long completed events are kept before cleanup.
	CleanupEvery   time.Duration // How often the cleanup job runs.
}

// DefaultRelayConfig returns production-sensible relay defaults.
func DefaultRelayConfig() RelayConfig {
	return RelayConfig{
		PollInterval:   2 * time.Second,
		BatchSize:      50,
		RetentionHours: 72,
		CleanupEvery:   1 * time.Hour,
	}
}

// OutboxRelay is the background worker that polls the outbox table and
// publishes pending events to Kafka.
type OutboxRelay struct {
	repo     domain.OutboxRepository
	producer *messaging.Producer
	config   RelayConfig
	logger   *zap.Logger
	cancel   context.CancelFunc
	wg       sync.WaitGroup
}

// NewOutboxRelay creates a new relay worker.
func NewOutboxRelay(
	repo domain.OutboxRepository,
	producer *messaging.Producer,
	config RelayConfig,
	logger *zap.Logger,
) *OutboxRelay {
	return &OutboxRelay{
		repo:     repo,
		producer: producer,
		config:   config,
		logger:   logger.Named("outbox_relay"),
	}
}

// Start begins the relay and cleanup loops in background goroutines.
func (r *OutboxRelay) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	r.cancel = cancel

	r.wg.Add(2)
	go r.pollLoop(ctx)
	go r.cleanupLoop(ctx)

	r.logger.Info("outbox relay started",
		zap.Duration("poll_interval", r.config.PollInterval),
		zap.Int("batch_size", r.config.BatchSize),
	)
}

// Stop gracefully shuts down the relay and waits for in-flight work to finish.
func (r *OutboxRelay) Stop() {
	if r.cancel != nil {
		r.cancel()
	}
	r.wg.Wait()
	r.logger.Info("outbox relay stopped")
}

// pollLoop continuously polls for pending outbox events and relays them.
func (r *OutboxRelay) pollLoop(ctx context.Context) {
	defer r.wg.Done()

	ticker := time.NewTicker(r.config.PollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			r.processBatch(ctx)
		}
	}
}

// processBatch fetches a batch of pending events and publishes them to Kafka.
func (r *OutboxRelay) processBatch(ctx context.Context) {
	events, err := r.repo.FetchPending(ctx, r.config.BatchSize)
	if err != nil {
		r.logger.Error("failed to fetch pending outbox events", zap.Error(err))
		return
	}

	if len(events) == 0 {
		return
	}

	r.logger.Debug("processing outbox batch", zap.Int("count", len(events)))

	for _, event := range events {
		if err := r.publishEvent(ctx, event); err != nil {
			r.logger.Error("failed to publish outbox event",
				zap.String("event_id", event.ID.String()),
				zap.String("topic", event.Topic),
				zap.Error(err),
			)
			if markErr := r.repo.MarkFailed(ctx, event, err.Error()); markErr != nil {
				r.logger.Error("failed to mark outbox event as failed",
					zap.String("event_id", event.ID.String()),
					zap.Error(markErr),
				)
			}
			continue
		}

		if err := r.repo.MarkCompleted(ctx, event); err != nil {
			r.logger.Error("failed to mark outbox event as completed",
				zap.String("event_id", event.ID.String()),
				zap.Error(err),
			)
		}
	}
}

// publishEvent sends a single outbox event to its designated Kafka topic.
func (r *OutboxRelay) publishEvent(ctx context.Context, event *domain.OutboxEvent) error {
	key := []byte(event.AggregateType + ":" + event.AggregateID)
	return r.producer.Publish(ctx, key, event.Payload)
}

// cleanupLoop periodically removes old completed events from the outbox table.
func (r *OutboxRelay) cleanupLoop(ctx context.Context) {
	defer r.wg.Done()

	ticker := time.NewTicker(r.config.CleanupEvery)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			deleted, err := r.repo.DeleteCompleted(ctx, r.config.RetentionHours)
			if err != nil {
				r.logger.Error("outbox cleanup failed", zap.Error(err))
			} else if deleted > 0 {
				r.logger.Info("outbox cleanup completed", zap.Int64("deleted", deleted))
			}
		}
	}
}
