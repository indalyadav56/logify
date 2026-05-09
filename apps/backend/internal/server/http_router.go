// internal/server/router.go
package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"

	authHTTP "github.com/indalyadav56/logify/apps/backend/internal/auth/transport/http"
	ingestHTTP "github.com/indalyadav56/logify/apps/backend/internal/ingest/transport/http"
	notificationHTTP "github.com/indalyadav56/logify/apps/backend/internal/notification/transport/http"
	searchHTTP "github.com/indalyadav56/logify/apps/backend/internal/search/transport/http"
	userHTTP "github.com/indalyadav56/logify/apps/backend/internal/user/transport/http"
)

const jwtSecret = "secret"

// NewRouter builds the full HTTP handler tree from the container.
func NewRouter(c *di.ServerContainer, log *zap.Logger) http.Handler {
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(middleware.CORSMiddleware())

	// Operational endpoints — no auth, no version
	engine.GET("/healthz", livenessHandler)
	engine.GET("/readyz", readinessHandler(c))

	// v1 API
	v1 := engine.Group("/v1")
	{
		ingestHTTP.RegisterRoutes(v1, c.IngestHandler)
		searchHTTP.RegisterRoutes(v1, c.SearchHandler)

		// Auth: JWT-protected account endpoints (me, change-password, mfa, sessions)
		authHTTP.RegisterAccountRoutes(v1, c.AccountHandler, jwtSecret)

		// Users: invite, role management, accept invite
		userHTTP.RegisterManagementRoutes(v1, c.UserManagementHandler, jwtSecret)

		// Notifications: channels, alert rules, notifications
		notificationHTTP.RegisterRoutes(v1, c.NotificationDashboardHandler, jwtSecret)
	}

	return engine
}

func livenessHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "alive"})
}

func readinessHandler(container *di.ServerContainer) gin.HandlerFunc {
	return func(c *gin.Context) {
		if container.DB != nil {
			if err := container.DB.PingContext(c.Request.Context()); err != nil {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"status": "not_ready",
					"error":  "database unreachable",
				})
				return
			}
		}
		c.JSON(http.StatusOK, gin.H{"status": "ready"})
	}
}
