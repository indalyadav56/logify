package di

import (
	"context"
	"errors"
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	migration "github.com/indalyadav56/logify/apps/backend/internal/db"
	processorApp "github.com/indalyadav56/logify/apps/backend/internal/processor/application"
	processorDomain "github.com/indalyadav56/logify/apps/backend/internal/processor/domain"
	processorCH "github.com/indalyadav56/logify/apps/backend/internal/processor/infrastructure/clickhouse"
	processorKafka "github.com/indalyadav56/logify/apps/backend/internal/processor/infrastructure/kafka"
	pkgClickhouse "github.com/indalyadav56/logify/apps/backend/pkg/clickhouse"
)

// ClickHouseWorkerContainer wires the Kafka → ClickHouse log ingestion worker.
type ClickHouseWorkerContainer struct {
	Config *config.Config
	Logger *zap.Logger

	KafkaReader      *kafka.Reader
	ClickHouseDB     ch.Conn
	ProcessorService *processorApp.ProcessorService
	LogRepository    processorDomain.LogRepository
}

func NewClickHouseWorkerContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*ClickHouseWorkerContainer, error) {
	c := &ClickHouseWorkerContainer{Config: cfg, Logger: log}

	topic := cfg.ClickHouseWorker.KafkaTopic
	if topic == "" {
		topic = "logs"
	}
	groupID := cfg.ClickHouseWorker.KafkaGroupID
	if groupID == "" {
		groupID = "log-clickhouse-group"
	}

	if err := ensureKafkaTopics(ctx, c.Config.Kafka.Brokers, topic); err != nil {
		log.Warn("failed to pre-create kafka topics (may already exist)", zap.Error(err))
	}

	c.KafkaReader = kafka.NewReader(kafka.ReaderConfig{
		Brokers: c.Config.Kafka.Brokers,
		Topic:   topic,
		GroupID: groupID,
	})

	chDSN, err := c.Config.ClickHouseNativeDSN(config.DefaultClickHouseConn)
	if err != nil {
		return nil, err
	}

	c.ClickHouseDB, err = pkgClickhouse.NewClickHouseDB(chDSN)
	if err != nil {
		return nil, err
	}

	chOpts, err := ch.ParseDSN(chDSN)
	if err != nil {
		return nil, fmt.Errorf("clickhouse parse dsn: %w", err)
	}
	sqlDB := ch.OpenDB(chOpts)

	if err := migration.ApplyMigrations(ctx, "clickhouse", "./migrations/clickhouse", sqlDB); err != nil {
		sqlDB.Close()
		return nil, fmt.Errorf("clickhouse migrate: %w", err)
	}

	c.initLogProcessor()
	return c, nil
}

func (c *ClickHouseWorkerContainer) Close() error {
	var errs []error
	if c.KafkaReader != nil {
		if err := c.KafkaReader.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if c.ClickHouseDB != nil {
		if err := c.ClickHouseDB.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	return errors.Join(errs...)
}

func (c *ClickHouseWorkerContainer) initLogProcessor() {
	consumer := processorKafka.NewLogConsumer(c.KafkaReader, c.Logger)
	c.LogRepository = processorCH.NewLogRepository(c.ClickHouseDB)
	c.ProcessorService = processorApp.NewProcessorService(consumer, c.LogRepository, c.Logger)
}
