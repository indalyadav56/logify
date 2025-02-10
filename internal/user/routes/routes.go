package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/user/handlers"
)

func UserRoutes(app *gin.Engine, h handlers.UserHandler) {
	userV1 := app.Group("/v1/users")
	{

		userV1.GET("/me", h.GetCurrentUser)

		userV1.GET("", h.Get)
		userV1.POST("", h.Create)
		userV1.PATCH("", h.Update)
		userV1.DELETE("", h.Delete)
	}
}
