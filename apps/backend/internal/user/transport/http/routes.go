package http

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

func RegisterRoutes(router *gin.RouterGroup, handler *UserHandler, jwt *jwt.JWT) {
	auth := middleware.AuthMiddleware(jwt)

	users := router.Group("/users")
	users.Use(auth)
	{
		users.GET("/me", handler.GetCurrentUser)
		// users.GET("", handler.ListUsers)
		// users.GET("/:id", handler.GetUser)
		// users.POST("", handler.CreateUser)
		// users.PUT("/:id", handler.UpdateUser)
		// users.DELETE("/:id", handler.DeleteUser)
	}
}

// // RegisterManagementRoutes sets up user invite and role management routes.
// func RegisterManagementRoutes(router *gin.RouterGroup, handler UserManagementHandler, jwtSecret string) {
// 	auth := middleware.AuthMiddleware(jwtSecret)

// 	users := router.Group("/users")
// 	users.Use(auth)
// 	{
// 		users.POST("/invite", handler.InviteUser)
// 		users.POST("/:id/role", handler.ChangeRole)
// 	}

// 	// No auth required for invite acceptance
// 	router.POST("/invites/accept", handler.AcceptInvite)
// }
