package application

import (
	"context"
	"fmt"

	"github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
)

type IngestService interface {
	Ingest(ctx context.Context, log domain.Log) error
}

type ingestService struct {
	logProducer domain.LogProducer
}

func NewIngestService(logProducer domain.LogProducer) *ingestService {
	return &ingestService{
		logProducer: logProducer,
	}
}

func (i *ingestService) Ingest(ctx context.Context, log domain.Log) error {
	if err := i.logProducer.Produce(ctx, log); err != nil {
		return fmt.Errorf("produce log: %w", err)
	}
	return nil
}
