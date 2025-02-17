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
	logV1.Use(middlewares.ClientAuthMiddleware(logger, clientJwt))
	{
		logV1.POST("", h.PublishLog)
		logV1.POST("/search", h.LogSearch)
		logV1.GET("/services", h.GetAllServices)
		logV1.GET("/export", h.GetAllServices)

		// bookmarks
		// logV1.GET("/bookmarks", h.GetBookmarks)
		// logV1.POST("/bookmarks", h.CreateBookmark)
		// logV1.DELETE("/bookmarks/:bookmarkID", h.DeleteBookmark)
	}
}
