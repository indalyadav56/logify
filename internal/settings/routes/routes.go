package routes

import (
	"github.com/gin-gonic/gin"
	"logify/internal/settings/handlers"
)

func SettingsRoutes(app *gin.Engine, h handlers.SettingsHandler) {
	settingsV1 := app.Group("/v1/settingss")
	{

		settingsV1.GET("", h.Get)
		settingsV1.POST("", h.Create)
		settingsV1.PATCH("", h.Update)
		settingsV1.DELETE("", h.Delete)
	}
}
