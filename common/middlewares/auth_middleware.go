package middlewares

import (
	"common/pkg/jwt"
	"common/pkg/logger"
	"common/pkg/response"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const BearerTokenPrefix = "Bearer"

func AuthMiddleware(logger logger.Logger, jwt jwt.JWT) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractBearerToken(c)
		if err != nil {
			logger.Error(fmt.Sprintf("Authorization error: %s | IP: %s", err.Error(), c.ClientIP()))
			response.SendError(c, http.StatusUnauthorized, "Authorization error", err.Error())
			return
		}

		claims, err := jwt.ValidateToken(token)
		if err != nil {
			logger.Error(fmt.Sprintf("Invalid token: %v | IP: %s", err, c.ClientIP()))
			response.SendError(c, http.StatusUnauthorized, "Invalid token", err.Error())
			return
		}

		tokenData, err := jwt.GetClaims(claims)
		if err != nil {
			logger.Error(fmt.Sprintf("Invalid token: %v | IP: %s", err, c.ClientIP()))
			response.SendError(c, http.StatusBadRequest, "Invalid token", err.Error())
			return
		}

		userId, ok := tokenData["user_id"].(string)
		if !ok {
			response.SendError(c, http.StatusBadRequest, "user id does not available in token", nil)
			return
		}

		tenantID, ok := tokenData["tenant_id"].(string)
		if !ok {
			response.SendError(c, http.StatusBadRequest, "tenant id does not available in token", nil)
			return
		}

		// projectID, ok := tokenData["project_id"].(string)
		// if !ok {
		// 	response.SendError(c, http.StatusBadRequest, "project id does not available in token", nil)
		// 	return
		// }

		c.Set("user_id", userId)
		c.Set("tenant_id", tenantID)
		// c.Set("project_id", projectID)

		c.Next()
	}
}

func extractBearerToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("authorization header missing")
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != BearerTokenPrefix {
		return "", fmt.Errorf("invalid authorization format")
	}

	return tokenParts[1], nil
}
