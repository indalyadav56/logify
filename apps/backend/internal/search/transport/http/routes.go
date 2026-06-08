package http

import "github.com/gin-gonic/gin"

// RegisterRoutes mounts search-related routes on the given router group. The
// group is expected to be already authenticated (see di.RegisterAllRoutes).
// Note: export-status is registered at /exports/:id (not under /logs) to avoid
// a Gin wildcard conflict with GET /logs/:id.
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
