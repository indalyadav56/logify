package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/metrics/handlers"
)

func MetricsRoutes(app *gin.Engine, h handlers.MetricsHandler) {
	metricsV1 := app.Group("/v1/metricss")
	{

		metricsV1.GET("", h.Get)
		metricsV1.POST("", h.Create)
		metricsV1.PATCH("", h.Update)
		metricsV1.DELETE("", h.Delete)
	}
}
