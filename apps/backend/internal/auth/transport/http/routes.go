package http

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the auth-related routes on the given router group.
func RegisterRoutes(router *gin.RouterGroup, handler *AuthHandler) {
	auth := router.Group("/v1/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.POST("/refresh-token", handler.RefreshToken)
		auth.POST("/logout", handler.Logout)
	}
}
