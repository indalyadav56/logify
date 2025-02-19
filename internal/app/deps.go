package app

import (
	database "common/pkg/db"
	"common/pkg/jwt"
	"common/pkg/logger"
	"common/pkg/redis"
	"common/pkg/validator"
	"logify/config"

	"github.com/gin-gonic/gin"
	"github.com/opensearch-project/opensearch-go"
	"github.com/twmb/franz-go/pkg/kadm"
	"github.com/twmb/franz-go/pkg/kgo"

	userHandlers "logify/internal/user/handlers"
	userRepo "logify/internal/user/repository"
	userServices "logify/internal/user/services"

	authHandlers "logify/internal/auth/handlers"
	authServices "logify/internal/auth/services"

	logHandlers "logify/internal/log/handlers"
	logRepos "logify/internal/log/repository"
	logServices "logify/internal/log/services"

	projectHandlers "logify/internal/project/handlers"
	projectRepos "logify/internal/project/repository"
	projectServices "logify/internal/project/services"

	notificationHandlers "logify/internal/notification/handlers"
	notificationRepos "logify/internal/notification/repository"
	notificationServices "logify/internal/notification/services"
)

type Dependencies struct {
	Config      *config.Config
	DB          *database.DB
	Server      *gin.Engine
	Logger      logger.Logger
	JWT         jwt.JWT
	ClientJWT   jwt.JWT
	Validator   validator.Validator
	Redis       redis.Redis
	OpenSearch  *opensearch.Client
	KafkaClient *kgo.Client
	KafkaAdmin  *kadm.Client

	AuthHandler authHandlers.AuthHandler
	AuthService authServices.AuthService

	LogHandler    logHandlers.LogHandler
	LogService    logServices.LogService
	LogRepository logRepos.LogRepository

	UserHandler    userHandlers.UserHandler
	UserService    userServices.UserService
	UserRepository userRepo.UserRepository

	ProjectHandler    projectHandlers.ProjectHandler
	ProjectService    projectServices.ProjectService
	ProjectRepository projectRepos.ProjectRepository

	NotificationHandler    notificationHandlers.NotificationHandler
	NotificationService    notificationServices.NotificationService
	NotificationRepository notificationRepos.NotificationRepository
}
