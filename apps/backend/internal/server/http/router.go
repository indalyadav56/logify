package server

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	// your handlers
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
	engine.Use(gin.Recovery())
	// engine.Use(middleware.CORS())
	// engine.Use(middleware.RequestID())
	// engine.Use(middleware.Logging())

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
