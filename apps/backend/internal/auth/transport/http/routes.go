package http

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the auth-related routes on the given router group.
func RegisterRoutes(router *gin.RouterGroup, handler *AuthHandler) {
	auth := router.Group("/v1/auth")
	{
		auth.POST("/login", handler.Login)
		// auth.POST("/register", handler.Register)
		// auth.POST("/refresh", handler.RefreshToken)
		// auth.POST("/logout", handler.Logout)
		// auth.POST("/forgot-password", handler.ForgotPassword)
		// auth.POST("/reset-password", handler.ResetPassword)
		// auth.POST("/verify-email", handler.VerifyEmail)
		// auth.POST("/resend-verification", handler.ResendVerification)
	}
}
