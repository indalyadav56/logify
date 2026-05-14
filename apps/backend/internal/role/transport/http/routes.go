package http

import (
	"github.com/gin-gonic/gin"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

// RegisterRoutes mounts the role-management routes under /roles on the given
// router group. All endpoints require a valid JWT.
//
// Routes:
//
//	GET    /roles                                        list roles (paginated, filterable)
//	POST   /roles                                        create a role
//	GET    /roles/:id                                    get a role with its permissions
//	PUT    /roles/:id                                    update a role (name / description)
//	DELETE /roles/:id                                    delete a role
//	GET    /roles/:id/permissions                        list a role's permissions
//	POST   /roles/:id/permissions                        add a single permission to a role
//	PUT    /roles/:id/permissions                        replace the role's permission set
//	DELETE /roles/:id/permissions/:resource/:action      revoke a single permission
func RegisterRoutes(router *gin.RouterGroup, handler RoleHandler, jwtSecret string) {
	auth := middleware.AuthMiddleware(jwtSecret)

	roles := router.Group("/roles")
	roles.Use(auth)
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
