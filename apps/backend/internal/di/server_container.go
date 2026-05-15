package di

import (
	"context"
	"errors"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	"github.com/indalyadav56/logify/apps/backend/internal/config"
	processorApp "github.com/indalyadav56/logify/apps/backend/internal/processor/application"
	searchApp "github.com/indalyadav56/logify/apps/backend/internal/search/application"
	searchCH "github.com/indalyadav56/logify/apps/backend/internal/search/infrastructure/clickhouse"
	searchHTTP "github.com/indalyadav56/logify/apps/backend/internal/search/transport/http"
	pkgClickhouse "github.com/indalyadav56/logify/apps/backend/pkg/clickhouse"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	// Ingest
	ingestApp "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
	ingestKafka "github.com/indalyadav56/logify/apps/backend/internal/ingest/infrastructure/kafka"
	ingestHTTP "github.com/indalyadav56/logify/apps/backend/internal/ingest/transport/http"

	// Auth
	authService "github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	authRepo "github.com/indalyadav56/logify/apps/backend/internal/auth/infrastructure/postgres"
	authUsers "github.com/indalyadav56/logify/apps/backend/internal/auth/infrastructure/users"
	authHTTP "github.com/indalyadav56/logify/apps/backend/internal/auth/transport/http"

	// User
	userDomain "github.com/indalyadav56/logify/apps/backend/internal/user/domain"
	userPG "github.com/indalyadav56/logify/apps/backend/internal/user/infrastructure/postgres"
	userHTTP "github.com/indalyadav56/logify/apps/backend/internal/user/transport/http"

	// Role
	roleApp "github.com/indalyadav56/logify/apps/backend/internal/role/application"
	rolePG "github.com/indalyadav56/logify/apps/backend/internal/role/infrastructure/postgres"
	roleHTTP "github.com/indalyadav56/logify/apps/backend/internal/role/transport/http"

	// Notification
	notificationHTTP "github.com/indalyadav56/logify/apps/backend/internal/notification/transport/http"
)

type ServerContainer struct {
	*Shared

	KafkaWriter  *kafka.Writer
	ClickHouseDB ch.Conn

	// Auth
	AuthRepo    *authRepo.RefreshTokenRepository
	AuthService application.AuthService
	AuthHandler *authHTTP.AuthHandler

	// Ingest bounded context
	IngestService ingestApp.IngestService
	IngestHandler ingestHTTP.IngestHandler

	// Search bounded context
	SearchService *searchApp.SearchService
	SearchHandler *searchHTTP.Handler

	// Processor bounded context (read-only reference, not started here)
	ProcessorService *processorApp.ProcessorService

	// User bounded context
	UserRepo              userDomain.UserRepository
	UserManagementHandler userHTTP.UserManagementHandler

	// Role (RBAC) bounded context
	RoleService roleApp.RoleService
	RoleHandler roleHTTP.RoleHandler

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

	chDSN, err := c.Config.ClickHouseNativeDSN(config.DefaultClickHouseConn)
	if err != nil {
		return nil, err
	}
	c.ClickHouseDB, err = pkgClickhouse.NewClickHouseDB(chDSN)
	if err != nil {
		return nil, err
	}

	c.initIngest()
	c.initSearch()
	c.initUser()
	if err := c.initAuth(); err != nil {
		return nil, err
	}
	c.initRole()
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

func (c *ServerContainer) initAuth() error {
	c.AuthRepo = authRepo.NewRefreshTokenRepository(c.Shared.PostgresDB())

	issuer, err := authService.NewTokenIssuer(authService.TokenIssuerConfig{
		Secret:          c.Config.Auth.JWT.Secret,
		Issuer:          c.Config.Auth.JWT.Issuer,
		AccessTokenTTL:  c.Config.Auth.JWT.AccessTokenTTL,
		RefreshTokenTTL: c.Config.Auth.JWT.RefreshTokenTTL,
	})
	if err != nil {
		return err
	}

	userPort := authUsers.NewAdapter(c.UserRepo, 0)
	c.AuthService = authService.NewAuthService(c.Shared.Logger, issuer, c.AuthRepo, userPort)
	c.AuthHandler = authHTTP.NewAuthHandler(c.AuthService)
	return nil
}

func (c *ServerContainer) initUser() {
	c.UserRepo = userPG.NewUserRepository(c.Shared.PostgresDB())
	c.UserManagementHandler = userHTTP.NewUserManagementHandler()
}

func (c *ServerContainer) initRole() {
	repo := rolePG.NewRoleRepository(c.Shared.PostgresDB())
	c.RoleService = roleApp.NewRoleService(repo, c.Shared.Logger)
	c.RoleHandler = roleHTTP.NewRoleHandler(c.RoleService)
}

func (c *ServerContainer) initNotification() {
	c.NotificationDashboardHandler = notificationHTTP.NewNotificationDashboardHandler()
}

func (c *ServerContainer) RegisterAllRoutes(e *gin.Engine) {
	authHTTP.RegisterRoutes(&e.RouterGroup, c.AuthHandler)
	ingestHTTP.RegisterRoutes(&e.RouterGroup, c.IngestHandler)
	searchHTTP.RegisterRoutes(&e.RouterGroup, c.SearchHandler)
}
