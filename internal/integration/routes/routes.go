package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/integration/handlers"
)

func IntegrationRoutes(app *gin.Engine, h handlers.IntegrationHandler) {
	integrationV1 := app.Group("/v1/integrations")
	{

		integrationV1.GET("", h.Get)
		integrationV1.POST("", h.Create)
		integrationV1.PATCH("", h.Update)
		integrationV1.DELETE("", h.Delete)
	}
}
