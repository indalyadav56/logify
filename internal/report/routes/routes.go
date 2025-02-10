package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/report/handlers"
)

func ReportRoutes(app *gin.Engine, h handlers.ReportHandler) {
	reportV1 := app.Group("/v1/reports")
	{

		reportV1.GET("", h.Get)
		reportV1.POST("", h.Create)
		reportV1.PATCH("", h.Update)
		reportV1.DELETE("", h.Delete)
	}
}
