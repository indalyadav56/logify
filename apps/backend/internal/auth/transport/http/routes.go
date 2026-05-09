package http

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

// RegisterRoutes sets up the auth-related routes on the given router group.
func RegisterRoutes(router *gin.RouterGroup, handler AuthHandler) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", handler.Login)
		auth.POST("/register", handler.Register)
		auth.POST("/refresh", handler.RefreshToken)
		auth.POST("/logout", handler.Logout)
		auth.POST("/forgot-password", handler.ForgotPassword)
		auth.POST("/reset-password", handler.ResetPassword)
		auth.POST("/verify-email", handler.VerifyEmail)
		auth.POST("/resend-verification", handler.ResendVerification)
	}
}

// RegisterAccountRoutes sets up JWT-protected account management routes.
func RegisterAccountRoutes(router *gin.RouterGroup, handler AccountHandler, jwtSecret string) {
	auth := router.Group("/auth")
	auth.Use(middleware.AuthMiddleware(jwtSecret))
	{
		auth.GET("/me", handler.GetMe)
		auth.POST("/change-password", handler.ChangePassword)

		mfa := auth.Group("/mfa")
		{
			mfa.POST("/enable", handler.EnableMFA)
			mfa.POST("/verify", handler.VerifyMFA)
			mfa.POST("/disable", handler.DisableMFA)
		}

		sessions := auth.Group("/sessions")
		{
			sessions.GET("", handler.ListSessions)
			sessions.DELETE("/:id", handler.RevokeSession)
		}
	}
}
