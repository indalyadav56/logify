package http

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the outbox admin routes on the given router group.
func RegisterRoutes(router *gin.RouterGroup, handler OutboxHandler, jwtSecret string) {
	// auth := middleware.AuthMiddleware(jwtSecret)

	outbox := router.Group("/admin/outbox")
	// outbox.Use(auth)
	{
		outbox.GET("", handler.ListEvents)
		outbox.GET("/stats", handler.GetStats)
		outbox.POST("/retry", handler.RetryFailed)
	}
}
