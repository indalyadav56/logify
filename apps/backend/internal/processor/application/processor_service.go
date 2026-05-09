package application

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	ingestDomain "github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/processor/domain"
	"go.uber.org/zap"
)

type LogConsumer interface {
	Consume(ctx context.Context, handler func(ctx context.Context, msg []byte) error) error
}

type ProcessorService struct {
	consumer      LogConsumer
	logRepository domain.LogRepository
	logger        *zap.Logger
}

func NewProcessorService(consumer LogConsumer, logRepository domain.LogRepository, logger *zap.Logger) *ProcessorService {
	return &ProcessorService{
		consumer:      consumer,
		logRepository: logRepository,
		logger:        logger.Named("processor_service"),
	}
}

func (s *ProcessorService) Start(ctx context.Context) error {
	s.logger.Info("starting processor service")
	return s.consumer.Consume(ctx, s.handleMessage)
}

func (s *ProcessorService) handleMessage(ctx context.Context, msg []byte) error {
	var ingestLog ingestDomain.Log
	if err := json.Unmarshal(msg, &ingestLog); err != nil {
		s.logger.Error("failed to unmarshal log message", zap.Error(err))
		return nil
	}

	log := &domain.Log{
		ID:          uuid.New(),
		TenantID:    ingestLog.TenantID,
		ProjectID:   ingestLog.ProjectID,
		Level:       ingestLog.Level,
		Message:     ingestLog.Message,
		Timestamp:   time.Unix(ingestLog.Timestamp, 0).UTC(),
		Service:     ingestLog.Service,
		Namespace:   ingestLog.Namespace,
		Host:        ingestLog.Hostname,
		Environment: ingestLog.Environment,
		TraceID:     ingestLog.TraceID,
		SpanID:      ingestLog.SpanID,
		RequestID:   ingestLog.RequestID,
		UserID:      ingestLog.UserID,
		Source:      ingestLog.Source,
		Tags:        ingestLog.Tags,
	}

	if err := s.logRepository.InsertBatch(ctx, []*domain.Log{log}); err != nil {
		s.logger.Error("failed to insert log", zap.Error(err))
		return err
	}

	s.logger.Info("processed log",
		zap.String("project_id", log.ProjectID),
		zap.String("level", log.Level),
		zap.String("message", log.Message),
	)
	return nil
}
