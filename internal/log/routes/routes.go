package routes

import (
	// commonMiddlewares "common/middlewares"
	"common/pkg/jwt"
	"common/pkg/logger"
	"logify/internal/log/handlers"
	"logify/middlewares"

	"github.com/gin-gonic/gin"
)

func LogRoutes(app *gin.Engine, h handlers.LogHandler, logger logger.Logger, clientJwt jwt.JWT) {
	logV1 := app.Group("/v1/logs")
	bmV2 := app.Group("/v1/bookmarks")

	logV1.Use(middlewares.ClientAuthMiddleware(logger, clientJwt))
	bmV2.Use(middlewares.ClientAuthMiddleware(logger, clientJwt))
	{
		logV1.POST("", h.PublishLog)
		logV1.POST("/search", h.LogSearch)
		logV1.GET("/services", h.GetAllServices)
		logV1.GET("/export", h.GetAllServices)

		// bookmarks
		bmV2.POST("", h.AddBookmark)
	}
}
