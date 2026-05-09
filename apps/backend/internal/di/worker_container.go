// internal/di/worker_container.go
package di

import (
	"context"
	"errors"
	"fmt"
	"net"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/indalyadav56/logify/apps/backend/internal/config"
	migration "github.com/indalyadav56/logify/apps/backend/internal/db"
	processorApp "github.com/indalyadav56/logify/apps/backend/internal/processor/application"
	processorDomain "github.com/indalyadav56/logify/apps/backend/internal/processor/domain"
	processorCH "github.com/indalyadav56/logify/apps/backend/internal/processor/infrastructure/clickhouse"
	processorKafka "github.com/indalyadav56/logify/apps/backend/internal/processor/infrastructure/kafka"
	pkgClickhouse "github.com/indalyadav56/logify/apps/backend/pkg/clickhouse"
	kafka "github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type WorkerContainer struct {
	*Shared

	KafkaReader      *kafka.Reader
	ClickHouseDB     ch.Conn
	ProcessorService *processorApp.ProcessorService
	LogRepository    processorDomain.LogRepository
}

// ensureKafkaTopics creates the given topics if they don't already exist.
// Must be called before creating any readers so the consumer subscribes to
// a topic that is guaranteed to exist.
func ensureKafkaTopics(ctx context.Context, brokers []string, topics ...string) error {
	if len(brokers) == 0 {
		return fmt.Errorf("no kafka brokers configured")
	}

	conn, err := kafka.DialContext(ctx, "tcp", brokers[0])
	if err != nil {
		return fmt.Errorf("kafka dial: %w", err)
	}
	defer conn.Close()

	controller, err := conn.Controller()
	if err != nil {
		return fmt.Errorf("kafka controller: %w", err)
	}

	ctrlConn, err := kafka.DialContext(ctx, "tcp", net.JoinHostPort(controller.Host, fmt.Sprintf("%d", controller.Port)))
	if err != nil {
		return fmt.Errorf("kafka dial controller: %w", err)
	}
	defer ctrlConn.Close()

	specs := make([]kafka.TopicConfig, len(topics))
	for i, t := range topics {
		specs[i] = kafka.TopicConfig{
			Topic:             t,
			NumPartitions:     1,
			ReplicationFactor: 1,
		}
	}

	if err := ctrlConn.CreateTopics(specs...); err != nil {
		return fmt.Errorf("kafka create topics: %w", err)
	}
	return nil
}

func NewWorkerContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*WorkerContainer, error) {
	shared, err := NewShared(ctx, cfg, log)
	if err != nil {
		return nil, err
	}

	c := &WorkerContainer{Shared: shared}

	if err := ensureKafkaTopics(ctx, c.Config.Kafka.Brokers, "logs"); err != nil {
		log.Warn("failed to pre-create kafka topics (may already exist)", zap.Error(err))
	}

	c.KafkaReader = kafka.NewReader(kafka.ReaderConfig{
		Brokers: c.Config.Kafka.Brokers,
		Topic:   "logs",
		GroupID: "log-processor-group",
	})

	c.ClickHouseDB, err = pkgClickhouse.NewClickHouseDB(c.Config.ClickHouseDSN)
	if err != nil {
		return nil, err
	}

	chOpts, err := ch.ParseDSN(c.Config.ClickHouseDSN)
	if err != nil {
		return nil, fmt.Errorf("clickhouse parse dsn: %w", err)
	}
	sqlDB := ch.OpenDB(chOpts)

	if err := migration.ApplyMigrations(ctx, "clickhouse", "./migrations/clickhouse", sqlDB); err != nil {
		sqlDB.Close()
		return nil, fmt.Errorf("clickhouse migrate: %w", err)
	}

	c.initProcessor()

	return c, nil
}

func (c *WorkerContainer) Close() error {
	var errs []error
	if c.KafkaReader != nil {
		if err := c.KafkaReader.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if err := c.Shared.Close(); err != nil {
		errs = append(errs, err)
	}

	if err := c.ClickHouseDB.Close(); err != nil {
		errs = append(errs, err)
	}

	return errors.Join(errs...)
}

func (c *WorkerContainer) initProcessor() {
	consumer := processorKafka.NewLogConsumer(c.KafkaReader, c.Shared.Logger)
	c.LogRepository = processorCH.NewLogRepository(c.ClickHouseDB)
	c.ProcessorService = processorApp.NewProcessorService(consumer, c.LogRepository, c.Shared.Logger)
}
