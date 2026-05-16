package requestctx

import "context"

type contextKey string

const (
	RequestIDKey contextKey = "request_id"
	LoggerKey    contextKey = "logger"
	UserIDKey    contextKey = "user_id"
	TenantIDKey  contextKey = "tenant_id"
)

func SetRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, RequestIDKey, requestID)
}

func GetRequestID(ctx context.Context) string {
	val, ok := ctx.Value(RequestIDKey).(string)
	if !ok {
		return ""
	}

	return val
}
