package http

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.RouterGroup, handler RoleHandler, jwtSecret string) {
	// auth := middleware.AuthMiddleware(jwtSecret)

	roles := router.Group("/roles")
	// roles.Use(auth)
	{
		roles.GET("", handler.ListRoles)
		roles.POST("", handler.CreateRole)
		roles.GET("/:id", handler.GetRole)
		roles.PUT("/:id", handler.UpdateRole)
		roles.DELETE("/:id", handler.DeleteRole)

		perms := roles.Group("/:id/permissions")
		{
			perms.GET("", handler.ListPermissions)
			perms.POST("", handler.AddPermission)
			perms.PUT("", handler.ReplacePermissions)
			perms.DELETE("/:resource/:action", handler.RemovePermission)
		}
	}
}
