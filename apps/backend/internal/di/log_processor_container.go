package di

import (
	"context"
	"errors"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	processorApp "github.com/indalyadav56/logify/apps/backend/internal/processor/application"
	processorDomain "github.com/indalyadav56/logify/apps/backend/internal/processor/domain"
	processorCH "github.com/indalyadav56/logify/apps/backend/internal/processor/infrastructure/clickhouse"
	processorKafka "github.com/indalyadav56/logify/apps/backend/internal/processor/infrastructure/kafka"
	pkgClickhouse "github.com/indalyadav56/logify/apps/backend/pkg/clickhouse"
)

type LogProcessorContainer struct {
	Config *config.Config
	Logger *zap.Logger

	KafkaReader      *kafka.Reader
	ClickHouseDB     ch.Conn
	ProcessorService *processorApp.ProcessorService
	LogRepository    processorDomain.LogRepository
}

func NewLogProcessorContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*LogProcessorContainer, error) {
	c := &LogProcessorContainer{Config: cfg, Logger: log}

	topic := "logs"
	if topic == "" {
		topic = "logs"
	}
	groupID := "log-embedder-group"
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

	var err error
	c.ClickHouseDB, err = pkgClickhouse.NewClickHouseDB(c.Config.ClickHouse.DSN())
	if err != nil {
		return nil, err
	}

	c.initLogProcessor()
	return c, nil
}

func (c *LogProcessorContainer) Close() error {
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

func (c *LogProcessorContainer) initLogProcessor() {
	consumer := processorKafka.NewLogConsumer(c.KafkaReader, c.Logger)
	c.LogRepository = processorCH.NewLogRepository(c.ClickHouseDB)
	c.ProcessorService = processorApp.NewProcessorService(consumer, c.LogRepository, c.Logger)
}
