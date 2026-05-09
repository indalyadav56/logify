package di

import (
	"context"
	"errors"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/indalyadav56/logify/apps/backend/internal/config"
	processorApp "github.com/indalyadav56/logify/apps/backend/internal/processor/application"
	searchApp "github.com/indalyadav56/logify/apps/backend/internal/search/application"
	searchCH "github.com/indalyadav56/logify/apps/backend/internal/search/infrastructure/clickhouse"
	searchHTTP "github.com/indalyadav56/logify/apps/backend/internal/search/transport/http"
	pkgClickhouse "github.com/indalyadav56/logify/apps/backend/pkg/clickhouse"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	// Ingest bounded context
	ingestApp "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
	ingestKafka "github.com/indalyadav56/logify/apps/backend/internal/ingest/infrastructure/kafka"
	ingestHTTP "github.com/indalyadav56/logify/apps/backend/internal/ingest/transport/http"

	// Auth bounded context
	authHTTP "github.com/indalyadav56/logify/apps/backend/internal/auth/transport/http"

	// User bounded context
	userHTTP "github.com/indalyadav56/logify/apps/backend/internal/user/transport/http"

	// Notification bounded context
	notificationHTTP "github.com/indalyadav56/logify/apps/backend/internal/notification/transport/http"
)

type ServerContainer struct {
	*Shared

	KafkaWriter  *kafka.Writer
	ClickHouseDB ch.Conn

	// Ingest bounded context
	IngestService ingestApp.IngestService
	IngestHandler ingestHTTP.IngestHandler

	// Search bounded context
	SearchService *searchApp.SearchService
	SearchHandler *searchHTTP.Handler

	// Processor bounded context (read-only reference, not started here)
	ProcessorService *processorApp.ProcessorService

	// Auth bounded context
	AccountHandler authHTTP.AccountHandler

	// User bounded context
	UserManagementHandler userHTTP.UserManagementHandler

	// Notification bounded context
	NotificationDashboardHandler notificationHTTP.NotificationDashboardHandler
}

func NewServerContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*ServerContainer, error) {
	shared, err := NewShared(ctx, cfg, log)
	if err != nil {
		return nil, err
	}

	c := &ServerContainer{Shared: shared}

	c.KafkaWriter = &kafka.Writer{
		Addr:     kafka.TCP(c.Config.Kafka.Brokers...),
		Topic:    "logs",
		Balancer: &kafka.LeastBytes{},
	}

	c.ClickHouseDB, err = pkgClickhouse.NewClickHouseDB(c.Config.ClickHouseDSN)
	if err != nil {
		return nil, err
	}

	c.initIngest()
	c.initSearch()
	c.initAuth()
	c.initUser()
	c.initNotification()

	return c, nil
}

func (c *ServerContainer) Close() error {
	var errs []error
	if c.KafkaWriter != nil {
		if err := c.KafkaWriter.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if c.ClickHouseDB != nil {
		if err := c.ClickHouseDB.Close(); err != nil {
			errs = append(errs, err)
		}
	}
	if err := c.Shared.Close(); err != nil {
		errs = append(errs, err)
	}
	return errors.Join(errs...)
}

func (c *ServerContainer) initIngest() {
	producer := ingestKafka.NewLogProducer(c.KafkaWriter, c.Shared.Logger)
	c.IngestService = ingestApp.NewIngestService(producer)
	c.IngestHandler = ingestHTTP.NewIngestHandler(c.IngestService)
}

func (c *ServerContainer) initSearch() {
	repo := searchCH.NewSearchRepository(c.ClickHouseDB, c.Shared.Logger)
	c.SearchService = searchApp.NewSearchService(repo, c.Shared.Logger)
	c.SearchHandler = searchHTTP.NewHandler(c.SearchService, c.Shared.Logger)
}

func (c *ServerContainer) initAuth() {
	c.AccountHandler = authHTTP.NewAccountHandler()
}

func (c *ServerContainer) initUser() {
	c.UserManagementHandler = userHTTP.NewUserManagementHandler()
}

func (c *ServerContainer) initNotification() {
	c.NotificationDashboardHandler = notificationHTTP.NewNotificationDashboardHandler()
}
