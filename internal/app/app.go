package app

import (
	"bytes"
	database "common/pkg/db"
	"common/pkg/jwt"
	"common/pkg/logger"
	"common/pkg/validator"
	"context"
	"fmt"
	"log"
	"logify/config"
	_ "logify/docs"
	"net/http"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	userHandlers "logify/internal/user/handlers"
	userRepos "logify/internal/user/repository"
	userRoutes "logify/internal/user/routes"
	userServices "logify/internal/user/services"

	authHandlers "logify/internal/auth/handlers"
	authRoutes "logify/internal/auth/routes"
	authServices "logify/internal/auth/services"

	logHandlers "logify/internal/log/handlers"
	logRepos "logify/internal/log/repository"
	logRoutes "logify/internal/log/routes"
	logServices "logify/internal/log/services"

	projectHandlers "logify/internal/project/handlers"
	projectRepos "logify/internal/project/repository"
	projectRoutes "logify/internal/project/routes"
	projectServices "logify/internal/project/services"

	notificationHandlers "logify/internal/notification/handlers"
	notificationRepos "logify/internal/notification/repository"
	notificationRoutes "logify/internal/notification/routes"
	notificationServices "logify/internal/notification/services"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type App struct {
	config *config.Config
	deps   *Dependencies
}

func New() (*App, error) {
	cfg, err := config.New()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	app := &App{
		config: cfg,
		deps: &Dependencies{
			Config: cfg,
		},
	}

	// Initialize all dependencies
	if err := app.initDependencies(); err != nil {
		return nil, err
	}

	return app, nil
}

func (a *App) Run() error {
	return a.deps.Server.Run(":8080")
}

func (a *App) initDependencies() error {
	var err error
	dbCfg := &database.Config{
		Host:     a.config.DBHost,
		Port:     a.config.DBPort,
		User:     a.config.DBUser,
		Password: a.config.DBPassword,
		Name:     a.config.DBName,
		SSLMode:  "disable",
	}

	if a.deps.DB, err = database.New(dbCfg); err != nil {
		log.Fatal(err)
	}

	if err := a.deps.DB.ApplyMigrations(context.Background(), "./migrations"); err != nil {
		return err
	}

	a.deps.Logger = logger.New()
	a.deps.Validator = validator.New()

	jwtConfig := jwt.JWTConfig{
		SecretKey:     []byte(a.deps.Config.JWTSecret),
		TokenDuration: time.Duration(a.deps.Config.JWTExpirationDays) * 24 * time.Hour,
	}
	a.deps.JWT = jwt.New(jwtConfig)

	a.deps.Server = gin.Default()

	// Initialize Elasticsearch client
	cfg := elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"},
	}

	a.deps.EsClient, err = elasticsearch.NewClient(cfg)
	if err != nil {
		log.Fatal(err)
	}

	// testing

	// Insert document
	index := fmt.Sprintf("indal")
	_, err = a.deps.EsClient.Index(index, bytes.NewReader([]byte(`{"service":"user_service","level":"info","message":"User logged in","metadata":{"user_id":"123"},"timestamp":"2025-02-08T11:32:57.869754Z"}`)))
	if err != nil {
		log.Fatalf("Error inserting document: %v", err)
	}

	_, err = a.deps.EsClient.Index(index, bytes.NewReader([]byte(`{"service":"auth_service","level":"info","message":"User logged in","metadata":{"user_id":"123"},"timestamp":"2025-02-08T11:32:57.869754Z"}`)))
	if err != nil {
		log.Fatalf("Error inserting document: %v", err)
	}

	// initialize kafka

	a.initRepositories()

	a.initServices()

	a.initHandlers()

	a.registerRoutes()

	a.InitConsumers()

	return nil
}

func (a *App) InitConsumers() {
	go a.deps.LogService.LogConsumer()
}

func (a *App) initRepositories() {
	a.deps.UserRepository = userRepos.NewUserRepository(a.deps.DB.DB, a.deps.Logger)
	a.deps.LogRepository = logRepos.NewLogRepository(a.deps.DB.DB, a.deps.Logger)
	a.deps.ProjectRepository = projectRepos.NewProjectRepository(a.deps.DB.DB, a.deps.Logger)
	a.deps.NotificationRepository = notificationRepos.NewNotificationRepository(a.deps.DB.DB, a.deps.Logger)
}

func (a *App) initServices() {
	a.deps.UserService = userServices.NewUserService(a.deps.UserRepository, a.deps.Logger)
	a.deps.AuthService = authServices.NewAuthService(a.deps.Logger, a.deps.JWT, a.deps.UserService)
	a.deps.LogService = logServices.NewLogService(a.deps.LogRepository, a.deps.Logger, a.deps.EsClient)
	a.deps.ProjectService = projectServices.NewProjectService(a.deps.ProjectRepository, a.deps.Logger)
	a.deps.NotificationService = notificationServices.NewNotificationService(a.deps.NotificationRepository, a.deps.Logger)
}

func (a *App) initHandlers() {
	a.deps.AuthHandler = authHandlers.NewAuthHandler(a.deps.AuthService, a.deps.Logger, a.deps.Validator)
	a.deps.UserHandler = userHandlers.NewUserHandler(a.deps.UserService, a.deps.Logger, a.deps.Validator)
	a.deps.LogHandler = logHandlers.NewLogHandler(a.deps.LogService, a.deps.Logger, a.deps.Validator)
	a.deps.ProjectHandler = projectHandlers.NewProjectHandler(a.deps.ProjectService, a.deps.Logger, a.deps.Validator)
	a.deps.NotificationHandler = notificationHandlers.NewNotificationHandler(a.deps.NotificationService, a.deps.Logger, a.deps.Validator)
}

func (a *App) registerRoutes() {
	a.deps.Server.Use(cors.Default())

	userRoutes.UserRoutes(a.deps.Server, a.deps.UserHandler)
	authRoutes.AuthRoutes(a.deps.Server, a.deps.AuthHandler)
	logRoutes.LogRoutes(a.deps.Server, a.deps.LogHandler)
	projectRoutes.ProjectRoutes(a.deps.Server, a.deps.ProjectHandler)
	notificationRoutes.NotificationRoutes(a.deps.Server, a.deps.NotificationHandler)

	a.deps.Server.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	a.deps.Server.LoadHTMLGlob("web/templates/*")
	a.deps.Server.Static("/web/static", "./static")

	a.deps.Server.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
}

func (a *App) Shutdown() error {
	if err := a.deps.DB.Close(); err != nil {
		a.deps.Logger.Error("failed to close database connection")
	}
	return nil
}
