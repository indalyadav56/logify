package http

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

// RegisterRoutes sets up notification channel, alert rule, and notification routes.
func RegisterRoutes(router *gin.RouterGroup, handler NotificationDashboardHandler, jwtSecret string) {
	auth := middleware.AuthMiddleware(jwtSecret)

	// Notification channels
	channels := router.Group("/notification-channels")
	channels.Use(auth)
	{
		channels.GET("", handler.ListChannels)
		channels.POST("", handler.CreateChannel)
		channels.GET("/:id", handler.GetChannel)
		channels.PATCH("/:id", handler.UpdateChannel)
		channels.DELETE("/:id", handler.DeleteChannel)
		channels.POST("/:id/test", handler.TestChannel)
	}

	// Alert rules
	rules := router.Group("/alert-rules")
	rules.Use(auth)
	{
		rules.GET("", handler.ListAlertRules)
		rules.POST("", handler.CreateAlertRule)
		rules.GET("/:id", handler.GetAlertRule)
		rules.PATCH("/:id", handler.UpdateAlertRule)
		rules.DELETE("/:id", handler.DeleteAlertRule)
		rules.POST("/:id/enable", handler.EnableAlertRule)
		rules.POST("/:id/disable", handler.DisableAlertRule)
	}

	// Notifications
	notifications := router.Group("/notifications")
	notifications.Use(auth)
	{
		notifications.GET("", handler.ListNotifications)
		notifications.GET("/:id", handler.GetNotification)
		notifications.POST("/:id/acknowledge", handler.AcknowledgeNotification)
		notifications.POST("/:id/resolve", handler.ResolveNotification)
	}
}
