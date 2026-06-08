package middleware

import (
	"context"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// Claims is the typed view of the auth-related fields the API cares about.
// It is populated from the JWT MapClaims returned by pkg/jwt.GetClaims.
type Claims struct {
	UserID   string
	Role     string
	TenantID string
}

// Gin context keys. Exported so handlers may read with c.GetString(...) etc.
const (
	CtxKeyClaims   = "auth.claims"
	CtxKeyUserID   = "auth.user_id"
	CtxKeyEmail    = "auth.email"
	CtxKeyRole     = "auth.role"
	CtxKeyTenantID = "auth.tenant_id"
)

// stdCtxKey is a private type for request-context keys, avoiding collisions
// with other packages' values stored in the same context.Context.
type stdCtxKey string

const (
	stdCtxKeyClaims   stdCtxKey = "auth.claims"
	stdCtxKeyUserID   stdCtxKey = "auth.user_id"
	stdCtxKeyTenantID stdCtxKey = "auth.tenant_id"
)

func AuthMiddleware(j *jwtpkg.JWT) gin.HandlerFunc {
	if j == nil {
		// Fail loudly at boot rather than silently accepting any token later.
		panic("auth middleware: jwt helper is required")
	}

	return func(c *gin.Context) {
		raw, ok := bearerToken(c)
		if !ok {
			return
		}

		token, err := j.ValidateToken(raw)
		if err != nil || token == nil || !token.Valid {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		mapClaims, err := j.GetClaims(token)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		// User id is carried in the standard "sub" claim; fall back to the
		// legacy "user_id" claim for tokens issued before that switch.
		userID := stringClaim(mapClaims, "sub")
		if userID == "" {
			userID = stringClaim(mapClaims, "user_id")
		}

		claims := &Claims{
			UserID:   userID,
			Role:     stringClaim(mapClaims, "role"),
			TenantID: stringClaim(mapClaims, "tenant_id"),
		}

		// Mirror data onto Gin's context for handlers that use c.Get(...).
		c.Set(CtxKeyClaims, claims)
		c.Set(CtxKeyUserID, claims.UserID)
		c.Set(CtxKeyRole, claims.Role)
		c.Set(CtxKeyTenantID, claims.TenantID)

		// Also propagate onto request.Context() so service/repo layers
		// (which only see context.Context) can pick the same values up.
		ctx := c.Request.Context()
		ctx = context.WithValue(ctx, stdCtxKeyClaims, claims)
		ctx = context.WithValue(ctx, stdCtxKeyUserID, claims.UserID)
		ctx = context.WithValue(ctx, stdCtxKeyTenantID, claims.TenantID)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

// bearerToken extracts and returns the token from a "Bearer <token>"
// Authorization header. On a malformed/missing header it writes the proper
// 401 response and returns ok=false.
func bearerToken(c *gin.Context) (string, bool) {
	header := c.GetHeader("Authorization")
	if header == "" {
		response.Unauthorized(c, "Authorization header is required")
		return "", false
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") || strings.TrimSpace(parts[1]) == "" {
		response.Unauthorized(c, "Authorization header must be in the format: Bearer <token>")
		return "", false
	}
	return parts[1], true
}

// stringClaim safely extracts a string-valued claim from a MapClaims-style map,
// returning "" when the key is missing or holds a non-string value.
func stringClaim(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

// --- Accessors -------------------------------------------------------------
//
// All accessors work against either *gin.Context or a plain context.Context,
// so callers in handlers and in deeper service layers share one API.

// ClaimsFromContext returns the parsed Claims, if any.
func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	v, ok := ctx.Value(stdCtxKeyClaims).(*Claims)
	return v, ok && v != nil
}

// UserIDFromContext returns the authenticated user's ID as a string.
func UserIDFromContext(ctx context.Context) (string, bool) {
	v, ok := ctx.Value(stdCtxKeyUserID).(string)
	return v, ok && v != ""
}

// UserUUIDFromContext is a typed convenience that parses the user id as a UUID.
func UserUUIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	s, ok := UserIDFromContext(ctx)
	if !ok {
		return uuid.Nil, false
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, false
	}
	return id, true
}

// TenantIDFromContext returns the tenant id (string) the caller belongs to.
func TenantIDFromContext(ctx context.Context) (string, bool) {
	v, ok := ctx.Value(stdCtxKeyTenantID).(string)
	return v, ok && v != ""
}

// TenantUUIDFromContext is a typed convenience that parses the tenant id as a UUID.
func GetTenantUUIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	s, ok := TenantIDFromContext(ctx)
	if !ok {
		return uuid.Nil, false
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, false
	}
	return id, true
}
