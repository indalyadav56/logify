package routes

import (
	"logify/internal/team/handlers"

	"github.com/gin-gonic/gin"
)

func TeamRoutes(app *gin.Engine, h handlers.TeamHandler) {
	teamV1 := app.Group("/v1/teams")
	{

		teamV1.GET("", h.Get)
		teamV1.POST("", h.Create)
		teamV1.PATCH("", h.Update)
		teamV1.DELETE("", h.Delete)
	}
}
