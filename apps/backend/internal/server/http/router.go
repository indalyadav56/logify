package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

func NewHTTPRouter(c *di.ServerContainer, log *zap.Logger) http.Handler {
	engine := gin.New()

	engine.Use(gin.Recovery())
	engine.Use(middleware.CORSMiddleware())

	// engine.GET("/health", func(ctx *gin.Context) {})
	// engine.GET("/readyz", func(ctx *gin.Context) {})

	c.RegisterAllRoutes(engine)

	return engine
}
