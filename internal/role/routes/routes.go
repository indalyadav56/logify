package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/role/handlers"
)

func RoleRoutes(app *gin.Engine, h handlers.RoleHandler) {
	roleV1 := app.Group("/v1/roles")
	{

		roleV1.GET("", h.Get)
		roleV1.POST("", h.Create)
		roleV1.PATCH("", h.Update)
		roleV1.DELETE("", h.Delete)
	}
}
