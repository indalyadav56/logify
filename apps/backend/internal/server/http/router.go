package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"github.com/indalyadav56/logify/apps/backend/pkg/logger"
)

// Router is responsible for setting up all routes
type Router struct {
	container *di.ServerContainer
}

func NewRouter(container *di.ServerContainer) *Router {
	return &Router{container: container}
}

// Setup configures all routes and middlewares on the Gin engine
func (r *Router) Setup(engine *gin.Engine) error {
	// Global middlewares
	engine.Use(cors.Default())
	engine.Use(requestid.New())
	engine.Use(logger.LoggerMiddleware(r.container.Logger))

	// Health checks
	engine.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	engine.GET("/readyz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ready"})
	})

	// routes
	r.container.RegisterAllRoutes(engine)

	return nil
}
