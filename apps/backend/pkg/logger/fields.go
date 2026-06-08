package logger

import "go.uber.org/zap"

func RequestID(requestID string) zap.Field {
	return zap.String("request_id", requestID)
}

func TraceID(traceID string) zap.Field {
	return zap.String("trace_id", traceID)
}

func UserID(userID string) zap.Field {
	return zap.String("user_id", userID)
}

func TenantID(tenantID string) zap.Field {
	return zap.String("tenant_id", tenantID)
}

func ProjectID(projectID string) zap.Field {
	return zap.String("project_id", projectID)
}

func Error(err error) zap.Field {
	return zap.Error(err)
}
