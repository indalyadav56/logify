package http

import (
	"github.com/gin-gonic/gin"

	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

func RegisterRoutes(router *gin.RouterGroup, handler *ProjectHandler, jwt *jwtpkg.JWT) {
	g := router.Group("/v1/projects")
	g.Use(middleware.AuthMiddleware(jwt))
	{
		g.GET("", handler.ListProjects)
		g.POST("", handler.CreateProject)
		g.GET("/:id", handler.GetProject)
		g.PUT("/:id", handler.UpdateProject)
		g.DELETE("/:id", handler.DeleteProject)
	}
}
