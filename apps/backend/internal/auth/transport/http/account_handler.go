package http

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// AccountHandler handles JWT-protected account management endpoints.
type AccountHandler interface {
	GetMe(c *gin.Context)
	ChangePassword(c *gin.Context)
	EnableMFA(c *gin.Context)
	VerifyMFA(c *gin.Context)
	DisableMFA(c *gin.Context)
	ListSessions(c *gin.Context)
	RevokeSession(c *gin.Context)
}

type accountHandler struct{}

func NewAccountHandler() AccountHandler {
	return &accountHandler{}
}

// GetMe handles GET /v1/auth/me
func (h *accountHandler) GetMe(c *gin.Context) {
	response.OK(c, "User profile retrieved", gin.H{
		"id":          "usr_01jv4kqz8p3e5f7g9m2n",
		"email":       "alice@example.com",
		"full_name":   "Alice Smith",
		"role":        "admin",
		"mfa_enabled": false,
		"is_active":   true,
		"created_at":  "2025-01-15T10:00:00Z",
		"updated_at":  "2026-04-20T08:30:00Z",
	})
}

// ChangePassword handles POST /v1/auth/change-password
func (h *accountHandler) ChangePassword(c *gin.Context) {
	response.OK(c, "Password changed successfully", nil)
}

// EnableMFA handles POST /v1/auth/mfa/enable
func (h *accountHandler) EnableMFA(c *gin.Context) {
	response.OK(c, "MFA enrollment initiated", gin.H{
		"totp_uri": "otpauth://totp/Logify:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Logify",
		"secret":   "JBSWY3DPEHPK3PXP",
	})
}

// VerifyMFA handles POST /v1/auth/mfa/verify
func (h *accountHandler) VerifyMFA(c *gin.Context) {
	response.OK(c, "MFA enabled successfully", gin.H{
		"mfa_enabled": true,
		"backup_codes": []string{
			"ABCD-1234", "EFGH-5678", "IJKL-9012",
			"MNOP-3456", "QRST-7890",
		},
	})
}

// DisableMFA handles POST /v1/auth/mfa/disable
func (h *accountHandler) DisableMFA(c *gin.Context) {
	response.OK(c, "MFA disabled successfully", nil)
}

// ListSessions handles GET /v1/auth/sessions
func (h *accountHandler) ListSessions(c *gin.Context) {
	response.OK(c, "Sessions retrieved", []gin.H{
		{
			"id":             "sess_01jv4abc",
			"user_agent":     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
			"ip_address":     "192.168.1.1",
			"location":       "New York, US",
			"created_at":     "2026-05-01T10:00:00Z",
			"last_active_at": "2026-05-07T09:15:00Z",
			"current":        true,
		},
		{
			"id":             "sess_01jv4def",
			"user_agent":     "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
			"ip_address":     "10.0.0.45",
			"location":       "San Francisco, US",
			"created_at":     "2026-05-03T14:20:00Z",
			"last_active_at": "2026-05-06T18:45:00Z",
			"current":        false,
		},
	})
}

// RevokeSession handles DELETE /v1/auth/sessions/:id
func (h *accountHandler) RevokeSession(c *gin.Context) {
	response.OK(c, "Session revoked successfully", nil)
}
