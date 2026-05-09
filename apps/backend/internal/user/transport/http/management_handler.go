package http

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// UserManagementHandler handles invite/role management endpoints.
type UserManagementHandler interface {
	InviteUser(c *gin.Context)
	ChangeRole(c *gin.Context)
	AcceptInvite(c *gin.Context)
}

type userManagementHandler struct{}

func NewUserManagementHandler() UserManagementHandler {
	return &userManagementHandler{}
}

// InviteUser handles POST /v1/users/invite
func (h *userManagementHandler) InviteUser(c *gin.Context) {
	response.Created(c, "Invitation sent successfully", gin.H{
		"id":         "inv_01jv4abc123",
		"email":      "newuser@example.com",
		"role":       "member",
		"invited_by": "usr_01jv4kqz8p3e5f7g9m2n",
		"expires_at": "2026-05-14T10:00:00Z",
		"created_at": "2026-05-07T10:00:00Z",
	})
}

// ChangeRole handles POST /v1/users/:id/role
func (h *userManagementHandler) ChangeRole(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "User role updated successfully", gin.H{
		"id":         id,
		"role":       "member",
		"updated_at": "2026-05-07T10:00:00Z",
	})
}

// AcceptInvite handles POST /v1/invites/accept
func (h *userManagementHandler) AcceptInvite(c *gin.Context) {
	response.OK(c, "Invitation accepted successfully", gin.H{
		"user": gin.H{
			"id":        "usr_01jv4new123",
			"email":     "newuser@example.com",
			"full_name": "New User",
			"role":      "member",
		},
		"access_token":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock",
		"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh",
		"token_type":    "Bearer",
		"expires_in":    3600,
	})
}
