package http

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes mounts the project routes on the given router group. The group
// is expected to be already authenticated (see di.RegisterAllRoutes).
func RegisterRoutes(router *gin.RouterGroup, handler *ProjectHandler) {
	g := router.Group("/v1/projects")
	{
		g.GET("", handler.ListProjects)
		g.POST("", handler.CreateProject)
		g.GET("/:id", handler.GetProject)
		g.PUT("/:id", handler.UpdateProject)
		g.DELETE("/:id", handler.DeleteProject)
	}
}
