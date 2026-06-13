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
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
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

	JWT *jwtpkg.JWT

	// Auth
	AuthRepo    *authRepo.RefreshTokenRepository
	SessionRepo *authRepo.SessionRepository
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

	// Project bounded context
	ProjectService projectApp.ProjectService
	ProjectHandler *projectHTTP.ProjectHandler
}

func NewServerContainer(ctx context.Context, cfg *config.Config, log *zap.Logger) (*ServerContainer, error) {
	c := &ServerContainer{Config: cfg, Logger: log}

	pool, err := postgres.New(ctx, postgres.Config{
		Host:         c.Config.Postgres.Host,
		Port:         c.Config.Postgres.Port,
		User:         c.Config.Postgres.User,
		Password:     c.Config.Postgres.Password,
		Database:     c.Config.Postgres.Database,
		SSLMode:      c.Config.Postgres.SSLMode,
		MaxOpenConns: int32(c.Config.Postgres.MaxOpenConns),
		MaxIdleConns: int32(c.Config.Postgres.MaxIdleConns),
		MaxLifetime:  c.Config.Postgres.ConnMaxLifetime,
		MaxIdleTime:  c.Config.Postgres.ConnMaxIdleTime,
	})
	if err != nil {
		return nil, fmt.Errorf("postgres: %w", err)
	}
	c.postgresDB = pool

	c.KafkaWriter = &kafka.Writer{
		Addr:     kafka.TCP(c.Config.Kafka.Brokers...),
		Topic:    "logs",
		Balancer: &kafka.LeastBytes{},
	}

	c.ClickHouseDB, err = pkgClickhouse.NewClickHouseDB(c.Config.ClickHouse.DSN())
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
	c.initProject()

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
	if c.Config.JWT.Secret == "" {
		return errors.New("auth: jwt secret is required (set auth.jwt.secret)")
	}

	c.JWT = jwtpkg.New(jwtpkg.JWTConfig{
		SecretKey:        []byte(c.Config.JWT.Secret),
		SigningAlgorithm: gojwt.SigningMethodHS256,
		TokenDuration:    c.Config.JWT.AccessTokenTTL,
		Issuer:           c.Config.JWT.Issuer,
	})

	c.SessionRepo = authRepo.NewSessionRepository(c.postgresDB)
	c.AuthRepo = authRepo.NewRefreshTokenRepository(c.postgresDB)

	c.AuthService = authService.NewAuthService(c.Logger, c.JWT, c.AuthRepo, c.SessionRepo, c.UserService)
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

func (c *ServerContainer) initProject() {
	repo := projectPG.NewProjectRepository(c.postgresDB)
	c.ProjectService = projectApp.NewProjectService(repo, c.Logger)
	c.ProjectHandler = projectHTTP.NewProjectHandler(c.ProjectService)
}

func (c *ServerContainer) RegisterAllRoutes(e *gin.Engine) {
	root := &e.RouterGroup

	// Public routes — reachable without a token.
	authHTTP.RegisterRoutes(root, c.AuthHandler)

	// Protected routes — authentication is applied once here, so every context
	// mounted on `secured` is authenticated by default. New contexts added here
	// inherit auth automatically; do not re-add AuthMiddleware inside them.
	secured := root.Group("", middleware.AuthMiddleware(c.JWT))
	ingestHTTP.RegisterRoutes(secured, c.IngestHandler)
	searchHTTP.RegisterRoutes(secured, c.SearchHandler)
	projectHTTP.RegisterRoutes(secured, c.ProjectHandler)
}
