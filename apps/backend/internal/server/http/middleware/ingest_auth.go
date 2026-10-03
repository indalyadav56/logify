package middleware

import (
	"context"
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/internal/apikey/domain"
	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

type APIKeyResolver interface {
	Resolve(context.Context, string) (*domain.Identity, error)
}

const stdCtxKeyAPIKeyProject stdCtxKey = "auth.api_key_project"

// IngestAuthMiddleware accepts a project key only on the log-ingest route.
// JWTs remain supported for existing clients; management routes use JWT auth.
func IngestAuthMiddleware(j *jwtpkg.JWT, keys APIKeyResolver) gin.HandlerFunc {
	jwtAuth := AuthMiddleware(j)
	return func(c *gin.Context) {
		keyHeaders := c.Request.Header.Values("X-API-Key")
		secret := strings.TrimSpace(c.GetHeader("X-API-Key"))
		if len(keyHeaders) > 0 {
			if len(keyHeaders) != 1 || c.GetHeader("Authorization") != "" {
				response.BadRequest(c, "Provide either X-API-Key or Authorization, not both")
				return
			}
		} else {
			parts := strings.Fields(c.GetHeader("Authorization"))
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") && strings.HasPrefix(parts[1], domain.Prefix) {
				secret = parts[1]
			} else {
				jwtAuth(c)
				return
			}
		}
		identity, err := keys.Resolve(c.Request.Context(), secret)
		if errors.Is(err, domain.ErrInvalidKey) {
			response.Unauthorized(c, "Invalid or revoked API key")
			return
		}
		if err != nil || identity == nil || identity.UserID == uuid.Nil || identity.TenantID == uuid.Nil || identity.ProjectID == uuid.Nil {
			response.InternalServerError(c, "Failed to authenticate API key")
			return
		}
		setClaims(c, &Claims{UserID: identity.UserID.String(), TenantID: identity.TenantID.String()})
		ctx := context.WithValue(c.Request.Context(), stdCtxKeyAPIKeyProject, identity.ProjectID)
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

func APIKeyProjectIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	id, ok := ctx.Value(stdCtxKeyAPIKeyProject).(uuid.UUID)
	return id, ok && id != uuid.Nil
}
