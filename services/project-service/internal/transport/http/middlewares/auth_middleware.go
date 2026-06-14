package middlewares

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/indalyadav56/logify/services/project-service/pkg/jwt"
	"github.com/indalyadav56/logify/services/project-service/pkg/response"
	"github.com/indalyadav56/logify/services/project-service/pkg/utils"
)

func AuthMiddleware(jwt jwt.JWT) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, err := extractBearerToken(r)
			if err != nil {
				http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
				return
			}

			claims, err := jwt.ValidateToken(token)
			if err != nil {
				utils.WriteJSON(w, http.StatusUnauthorized, response.BadRequest("Unauthorized Invalid token"))
				return
			}

			tokenData, err := jwt.GetClaims(claims)
			if err != nil {
				http.Error(w, "Unauthorized: failed to get claims", http.StatusUnauthorized)
				return
			}
			fmt.Println("Token Data:", tokenData)

			userId, ok := tokenData["user_id"].(string)
			if !ok {
				http.Error(w, "Unauthorized: user_id not found", http.StatusUnauthorized)
				return
			}

			tenantId, ok := tokenData["tenant_id"].(string)
			if !ok {
				http.Error(w, "Unauthorized: user_id not found", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), "user_id", userId)
			ctx = context.WithValue(ctx, "tenant_id", tenantId)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func extractBearerToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("authorization header missing")
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return "", fmt.Errorf("invalid authorization format")
	}

	return tokenParts[1], nil
}
