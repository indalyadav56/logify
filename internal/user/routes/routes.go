package routes

import (
	"common/middlewares"
	"common/pkg/jwt"
	"common/pkg/logger"
	"logify/internal/user/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(app *gin.Engine, h handlers.UserHandler, logger logger.Logger, jwt jwt.JWT) {
	userV1 := app.Group("/v1/users")
	userV1.Use(middlewares.AuthMiddleware(logger, jwt))
	{

		userV1.GET("/me", h.GetCurrentUser)

		userV1.GET("", h.Get)
		userV1.POST("", h.Create)
		userV1.PATCH("", h.Update)
		userV1.DELETE("", h.Delete)
	}
}
