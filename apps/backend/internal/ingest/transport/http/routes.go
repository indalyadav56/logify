package http

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.RouterGroup, handler IngestHandler) {
	logs := router.Group("/v1/logs")
	{
		logs.POST("", handler.CreateLog)
	}
}
