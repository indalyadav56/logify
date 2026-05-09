package http

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the ingest-related routes on the given router group.
func RegisterRoutes(router *gin.RouterGroup, handler IngestHandler) {
	logs := router.Group("/logs")
	{
		logs.POST("", handler.CreateLog)
	}
}
