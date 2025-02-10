package routes

import (
	"logify/internal/analytics/handlers"

	"github.com/gin-gonic/gin"
)

func AnalyticsRoutes(app *gin.Engine, h handlers.AnalyticsHandler) {
	analyticsV1 := app.Group("/v1/analyticss")
	{

		analyticsV1.GET("", h.Get)
		analyticsV1.POST("", h.Create)
		analyticsV1.PATCH("", h.Update)
		analyticsV1.DELETE("", h.Delete)
	}
}
