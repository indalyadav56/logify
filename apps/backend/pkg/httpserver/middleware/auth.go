package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// AuthMiddleware returns a Gin middleware that validates JWT tokens.
func AuthMiddleware(jwt *jwtpkg.JWT) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header is required")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			response.Unauthorized(c, "Authorization header must be in the format: Bearer <token>")
			return
		}

		tokenString := parts[1]

		token, err := jwt.ValidateToken(tokenString)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		claims, err := jwt.GetClaims(token)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		userID, ok := claims["user_id"]
		if !ok {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		userRole, ok := claims["role"]
		if !ok {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		// Store user information in the context for downstream handlers.
		c.Set("user_id", userID)
		c.Set("user_role", userRole)

		c.Next()
	}
}

// GetUserIDFromContext extracts the authenticated user's ID from the Gin context.
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	return userID.(string), true
}

// GetUserEmailFromContext extracts the authenticated user's email from the Gin context.
func GetUserEmailFromContext(c *gin.Context) (string, bool) {
	email, exists := c.Get("user_email")
	if !exists {
		return "", false
	}
	return email.(string), true
}
