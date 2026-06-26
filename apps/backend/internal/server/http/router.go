package server

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"github.com/indalyadav56/logify/apps/backend/pkg/logger"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "github.com/indalyadav56/logify/apps/backend/docs/swagger"
)

type Router struct {
	container *di.ServerContainer
}

func NewRouter(container *di.ServerContainer) *Router {
	return &Router{container: container}
}

func (r *Router) Setup(engine *gin.Engine) error {
	engine.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"},
		ExposeHeaders:   []string{"Content-Length", "X-Request-ID"},
		MaxAge:          12 * time.Hour,
	}))
	engine.Use(requestid.New())
	engine.Use(logger.LoggerMiddleware(r.container.Logger))

	// Health checks
	engine.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	engine.GET("/readyz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ready"})
	})

	// Swagger
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// routes
	r.container.RegisterAllRoutes(engine)

	return nil
}
