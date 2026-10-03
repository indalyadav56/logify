package http

import "github.com/gin-gonic/gin"

// Only the JWT-authenticated account routes may manage keys.
func RegisterRoutes(router *gin.RouterGroup, handler *Handler) {
	keys := router.Group("/v1/projects/:id/api-keys")
	keys.GET("", handler.List)
	keys.POST("", handler.Create)
	keys.DELETE("/:keyId", handler.Revoke)
}
