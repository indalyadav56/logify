package di

import (
	"context"
	"errors"
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	gojwt "github.com/golang-jwt/jwt/v5"
	"github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	"github.com/indalyadav56/logify/apps/backend/internal/config"
	processorApp "github.com/indalyadav56/logify/apps/backend/internal/processor/application"
	searchApp "github.com/indalyadav56/logify/apps/backend/internal/search/application"
	searchCH "github.com/indalyadav56/logify/apps/backend/internal/search/infrastructure/clickhouse"
	searchHTTP "github.com/indalyadav56/logify/apps/backend/internal/search/transport/http"
	pkgClickhouse "github.com/indalyadav56/logify/apps/backend/pkg/clickhouse"
	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
	"github.com/indalyadav56/logify/apps/backend/pkg/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	// Ingest
	ingestApp "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
	ingestKafka "github.com/indalyadav56/logify/apps/backend/internal/ingest/infrastructure/kafka"
	ingestHTTP "github.com/indalyadav56/logify/apps/backend/internal/ingest/transport/http"

	// Auth
	authService "github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	authRepo "github.com/indalyadav56/logify/apps/backend/internal/auth/infrastructure/postgres"
	authHTTP "github.com/indalyadav56/logify/apps/backend/internal/auth/transport/http"

	// User
	userApplication "github.com/indalyadav56/logify/apps/backend/internal/user/application"
	userDomain "github.com/indalyadav56/logify/apps/backend/internal/user/domain"
	userPG "github.com/indalyadav56/logify/apps/backend/internal/user/infrastructure/postgres"
	userHTTP "github.com/indalyadav56/logify/apps/backend/internal/user/transport/http"

	// Role
	roleApp "github.com/indalyadav56/logify/apps/backend/internal/role/application"
	rolePG "github.com/indalyadav56/logify/apps/backend/internal/role/infrastructure/postgres"
	roleHTTP "github.com/indalyadav56/logify/apps/backend/internal/role/transport/http"

	// Notification
	notificationHTTP "github.com/indalyadav56/logify/apps/backend/internal/notification/transport/http"

	// project
	projectApp "github.com/indalyadav56/logify/apps/backend/internal/project/application"
	projectPG "github.com/indalyadav56/logify/apps/backend/internal/project/infrastructure/postgres"
	projectHTTP "github.com/indalyadav56/logify/apps/backend/internal/project/transport/http"
)

type ServerContainer struct {
	Config     *config.Config
	Logger     *zap.Logger
	postgresDB *pgxpool.Pool

	KafkaWriter  *kafka.Writer
	ClickHouseDB ch.Conn

	// JWT helper, shared by token issuance and HTTP auth middleware.
	JWT *jwtpkg.JWT

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

	// User
	UserService           userApplication.UserService
	UserRepo              userDomain.UserRepository
	UserManagementHandler userHTTP.UserManagementHandler

	// Role (RBAC) bounded context
	RoleService roleApp.RoleService
	RoleHandler roleHTTP.RoleHandler

	// Notification bounded context
	NotificationDashboardHandler notificationHTTP.NotificationDashboardHandler

	// Workspace bounded context
	WorkspaceService projectApp.ProjectService
	WorkspaceHandler *projectHTTP.ProjectHandler
}

func NewServerContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*ServerContainer, error) {
	c := &ServerContainer{Config: cfg, Logger: log}

	pgCfg, err := cfg.PostgresPoolConfig(config.DefaultPostgresConn)
	if err != nil {
		return nil, fmt.Errorf("postgres config: %w", err)
	}
	pool, err := postgres.New(ctx, pgCfg)
	if err != nil {
		return nil, fmt.Errorf("postgres: %w", err)
	}
	c.postgresDB = pool

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
	c.initWorkspace()

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
	if c.postgresDB != nil {
		c.postgresDB.Close()
	}
	return errors.Join(errs...)
}

func (c *ServerContainer) initIngest() {
	producer := ingestKafka.NewLogProducer(c.KafkaWriter, c.Logger)
	c.IngestService = ingestApp.NewIngestService(producer)
	c.IngestHandler = ingestHTTP.NewIngestHandler(c.IngestService)
}

func (c *ServerContainer) initSearch() {
	repo := searchCH.NewSearchRepository(c.ClickHouseDB, c.Logger)
	c.SearchService = searchApp.NewSearchService(repo, c.Logger)
	c.SearchHandler = searchHTTP.NewHandler(c.SearchService, c.Logger)
}

func (c *ServerContainer) initAuth() error {
	if c.Config.Auth.JWT.Secret == "" {
		return errors.New("auth: jwt secret is required (set auth.jwt.secret)")
	}

	c.JWT = jwtpkg.New(jwtpkg.JWTConfig{
		SecretKey:        []byte(c.Config.Auth.JWT.Secret),
		SigningAlgorithm: gojwt.SigningMethodHS256,
		TokenDuration:    c.Config.Auth.JWT.AccessTokenTTL,
	})

	c.AuthRepo = authRepo.NewRefreshTokenRepository(c.postgresDB)

	issuer, err := authService.NewTokenIssuer(authService.TokenIssuerConfig{
		JWT:             c.JWT,
		Issuer:          c.Config.Auth.JWT.Issuer,
		AccessTokenTTL:  c.Config.Auth.JWT.AccessTokenTTL,
		RefreshTokenTTL: c.Config.Auth.JWT.RefreshTokenTTL,
	})
	if err != nil {
		return err
	}

	c.AuthService = authService.NewAuthService(c.Logger, issuer, c.AuthRepo, c.UserService)
	c.AuthHandler = authHTTP.NewAuthHandler(c.AuthService)
	return nil
}

func (c *ServerContainer) initUser() {
	c.UserRepo = userPG.NewUserRepository(c.postgresDB)
	c.UserService = userApplication.NewUserService(c.UserRepo, c.Logger)
	c.UserManagementHandler = userHTTP.NewUserManagementHandler()
}

func (c *ServerContainer) initRole() {
	repo := rolePG.NewRoleRepository(c.postgresDB)
	c.RoleService = roleApp.NewRoleService(repo, c.Logger)
	c.RoleHandler = roleHTTP.NewRoleHandler(c.RoleService)
}

func (c *ServerContainer) initNotification() {
	c.NotificationDashboardHandler = notificationHTTP.NewNotificationDashboardHandler()
}

func (c *ServerContainer) initWorkspace() {
	repo := projectPG.NewProjectRepository(c.postgresDB)
	c.WorkspaceService = projectApp.NewProjectService(repo, c.Logger)
	c.WorkspaceHandler = projectHTTP.NewProjectHandler(c.WorkspaceService)
}

func (c *ServerContainer) RegisterAllRoutes(e *gin.Engine) {
	authHTTP.RegisterRoutes(&e.RouterGroup, c.AuthHandler)
	ingestHTTP.RegisterRoutes(&e.RouterGroup, c.IngestHandler)
	searchHTTP.RegisterRoutes(&e.RouterGroup, c.SearchHandler)
	projectHTTP.RegisterRoutes(&e.RouterGroup, c.WorkspaceHandler, c.JWT)
}
