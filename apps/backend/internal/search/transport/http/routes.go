package http

import "github.com/gin-gonic/gin"

func RegisterRoutes(router *gin.RouterGroup, h *Handler) {
	logs := router.Group("/v1/logs")
	{
		logs.POST("/search", h.Search)
		logs.GET("/:id", h.GetByID)
		logs.POST("/aggregate", h.Aggregate)
		logs.POST("/export", h.Export)
	}

	exports := router.Group("/exports")
	{
		exports.GET("/:id", h.ExportStatus)
	}
}
