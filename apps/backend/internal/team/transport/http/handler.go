package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/team/application"
	"github.com/indalyadav56/logify/apps/backend/internal/team/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

type Handler struct{ service *application.Service }

func NewHandler(service *application.Service) *Handler { return &Handler{service} }

type InvitationRequest struct {
	Email string       `json:"email" binding:"required"`
	Role  project.Role `json:"role" binding:"required" swaggertype:"string" enums:"admin,member,viewer"`
}
type RoleRequest struct {
	Role project.Role `json:"role" binding:"required" swaggertype:"string" enums:"admin,member,viewer"`
}
type TokenRequest struct {
	Token string `json:"token" binding:"required,max=128"`
}

func RegisterRoutes(router *gin.RouterGroup, h *Handler) {
	router.GET("/v1/projects/:id/team", h.View)
	router.POST("/v1/projects/:id/invitations", h.Invite)
	router.DELETE("/v1/projects/:id/invitations/:invitationId", h.Cancel)
	router.PATCH("/v1/projects/:id/members/:userId", h.ChangeRole)
	router.DELETE("/v1/projects/:id/members/:userId", h.Remove)
	router.POST("/v1/invitations/preview", h.Preview)
	router.POST("/v1/invitations/accept", h.Accept)
}
func param(c *gin.Context, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(name))
	if err != nil {
		response.BadRequest(c, "Invalid "+name+" format")
		return uuid.Nil, false
	}
	return id, true
}
func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, project.ErrProjectNotFound), errors.Is(err, domain.ErrMemberNotFound):
		response.NotFound(c, err.Error())
	case errors.Is(err, project.ErrForbidden), errors.Is(err, domain.ErrOwnerProtected), errors.Is(err, domain.ErrWrongEmail):
		response.Forbidden(c, err.Error())
	case errors.Is(err, domain.ErrAlreadyMember), errors.Is(err, domain.ErrPendingInvite):
		response.Conflict(c, err.Error())
	case errors.Is(err, domain.ErrInvalidInput):
		response.BadRequest(c, err.Error())
	case errors.Is(err, domain.ErrInvalidInvite):
		response.Error(c, http.StatusGone, "INVITATION_UNAVAILABLE", err.Error())
	default:
		response.InternalServerError(c, "Failed to manage project team")
	}
}

// View lists the owner, members and invitations visible to the current role.
// @Summary Get project team
// @Tags teams
// @Security BearerAuth
// @Produce json
// @Param id path string true "Project UUID"
// @Success 200 {object} response.APIResponse
// @Router /v1/projects/{id}/team [get]
func (h *Handler) View(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	id, ok := param(c, "id")
	if !ok {
		return
	}
	team, err := h.service.View(c.Request.Context(), id)
	if err != nil {
		writeError(c, err)
		return
	}
	response.OK(c, "Project team retrieved", team)
}

// Invite creates an email-bound link valid for seven days. The token is returned once.
// @Summary Invite a project team member
// @Tags teams
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Project UUID"
// @Param request body InvitationRequest true "Email and project role"
// @Success 201 {object} response.APIResponse
// @Router /v1/projects/{id}/invitations [post]
func (h *Handler) Invite(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	id, ok := param(c, "id")
	if !ok {
		return
	}
	var input InvitationRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Email and role are required")
		return
	}
	invite, err := h.service.CreateInvitation(c.Request.Context(), id, input.Email, input.Role)
	if err != nil {
		writeError(c, err)
		return
	}
	response.Created(c, "Invitation created. Copy the link and share it with this person.", invite)
}

// Cancel revokes an unused invitation.
// @Summary Cancel a project invitation
// @Tags teams
// @Security BearerAuth
// @Param id path string true "Project UUID"
// @Param invitationId path string true "Invitation UUID"
// @Success 204 "No content"
// @Router /v1/projects/{id}/invitations/{invitationId} [delete]
func (h *Handler) Cancel(c *gin.Context) {
	id, ok := param(c, "id")
	if !ok {
		return
	}
	invite, ok := param(c, "invitationId")
	if !ok {
		return
	}
	if err := h.service.Cancel(c.Request.Context(), id, invite); err != nil {
		writeError(c, err)
		return
	}
	response.NoContent(c)
}

// ChangeRole updates a non-owner member's role.
// @Summary Change project member role
// @Tags teams
// @Security BearerAuth
// @Accept json
// @Param id path string true "Project UUID"
// @Param userId path string true "User UUID"
// @Param request body RoleRequest true "Admin, Member, or Viewer"
// @Success 204 "No content"
// @Router /v1/projects/{id}/members/{userId} [patch]
func (h *Handler) ChangeRole(c *gin.Context) {
	id, ok := param(c, "id")
	if !ok {
		return
	}
	user, ok := param(c, "userId")
	if !ok {
		return
	}
	var input RoleRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Role is required")
		return
	}
	if err := h.service.ChangeRole(c.Request.Context(), id, user, input.Role); err != nil {
		writeError(c, err)
		return
	}
	response.NoContent(c)
}

// Remove removes a member. Non-owners can also leave their own project.
// @Summary Remove or leave a project team
// @Tags teams
// @Security BearerAuth
// @Param id path string true "Project UUID"
// @Param userId path string true "User UUID"
// @Success 204 "No content"
// @Router /v1/projects/{id}/members/{userId} [delete]
func (h *Handler) Remove(c *gin.Context) {
	id, ok := param(c, "id")
	if !ok {
		return
	}
	user, ok := param(c, "userId")
	if !ok {
		return
	}
	if err := h.service.Remove(c.Request.Context(), id, user); err != nil {
		writeError(c, err)
		return
	}
	response.NoContent(c)
}

// Preview verifies an invitation for the authenticated recipient.
// @Summary Preview a team invitation
// @Tags teams
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body TokenRequest true "Invitation token"
// @Success 200 {object} response.APIResponse
// @Router /v1/invitations/preview [post]
func (h *Handler) Preview(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	var input TokenRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Invitation token is required")
		return
	}
	invite, err := h.service.Preview(c.Request.Context(), input.Token)
	if err != nil {
		writeError(c, err)
		return
	}
	response.OK(c, "Invitation retrieved", invite)
}

// Accept atomically consumes an invitation and grants access to its project.
// @Summary Accept a team invitation
// @Tags teams
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body TokenRequest true "Invitation token"
// @Success 200 {object} response.APIResponse
// @Router /v1/invitations/accept [post]
func (h *Handler) Accept(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	var input TokenRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Invitation token is required")
		return
	}
	p, err := h.service.Accept(c.Request.Context(), input.Token)
	if err != nil {
		writeError(c, err)
		return
	}
	response.OK(c, "You joined the project", p)
}
