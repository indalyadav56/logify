package http

import (
	"github.com/gin-gonic/gin"

	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

func RegisterRoutes(router *gin.RouterGroup, handler *WorkspaceHandler, jwt *jwtpkg.JWT) {
	g := router.Group("/v1/workspaces")
	g.Use(middleware.AuthMiddleware(jwt))
	{
		g.GET("", handler.ListWorkspaces)
		g.POST("", handler.CreateWorkspace)
		g.GET("/:id", handler.GetWorkspace)
		g.PUT("/:id", handler.UpdateWorkspace)
		g.DELETE("/:id", handler.DeleteWorkspace)
	}
}
