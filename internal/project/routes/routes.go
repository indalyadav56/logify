package routes

import (
	"logify/internal/project/handlers"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(app *gin.Engine, h handlers.ProjectHandler) {
	projectV1 := app.Group("/v1/projects")
	{
		projectV1.GET("", h.Get)
		projectV1.POST("", h.Create)
		projectV1.PATCH("", h.Update)
		projectV1.DELETE("", h.Delete)
	}
}
