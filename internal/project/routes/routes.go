package routes

import (
	commonMiddlewares "common/middlewares"
	"common/pkg/jwt"
	"common/pkg/logger"
	"logify/internal/project/handlers"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(app *gin.Engine, h handlers.ProjectHandler, logger logger.Logger, jwt jwt.JWT) {
	projectV1 := app.Group("/v1/projects")
	projectV1.Use(commonMiddlewares.AuthMiddleware(logger, jwt))
	{
		projectV1.GET("", h.Get)
		projectV1.GET("/:projectID", h.GetOneProject)
		projectV1.POST("", h.Create)
		projectV1.PATCH("", h.Update)
		projectV1.DELETE("", h.Delete)

		projectV1.POST("/:projectID/keys", h.CreateAPIKey)
		projectV1.DELETE("/:projectID/keys", h.DeleteAPIKey)
	}
}
