package routes

import (
	"logify/internal/auth/handlers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine, h handlers.AuthHandler) {
	authV1 := router.Group("/v1/auth")
	{
		authV1.POST("/register", h.Register)
		authV1.POST("/login", h.Login)
		authV1.POST("/refresh", h.RefreshToken)
		authV1.POST("/logout", h.Logout)
		authV1.POST("/reset-password", h.ResetPassword)
	}
}
