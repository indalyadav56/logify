package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/notification/handlers"
)

func NotificationRoutes(app *gin.Engine, h handlers.NotificationHandler) {
	notificationV1 := app.Group("/v1/notifications")
	{

		notificationV1.GET("", h.Get)
		notificationV1.POST("", h.Create)
		notificationV1.PATCH("", h.Update)
		notificationV1.DELETE("", h.Delete)
	}
}
