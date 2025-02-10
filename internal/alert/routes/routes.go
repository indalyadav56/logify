package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/alert/handlers"
)

func AlertRoutes(app *gin.Engine, h handlers.AlertHandler) {
	alertV1 := app.Group("/v1/alerts")
	{

		alertV1.GET("", h.Get)
		alertV1.POST("", h.Create)
		alertV1.PATCH("", h.Update)
		alertV1.DELETE("", h.Delete)
	}
}
