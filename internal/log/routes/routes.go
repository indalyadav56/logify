package routes

import (
	"logify/internal/log/handlers"

	"github.com/gin-gonic/gin"
)

func LogRoutes(app *gin.Engine, h handlers.LogHandler) {
	logV1 := app.Group("/v1/logs")
	{
		logV1.POST("", h.Create)
		logV1.POST("/search", h.LogSearch)
		logV1.GET("/services", h.GetAllServices)
		logV1.GET("/export", h.GetAllServices)
	}
}
