package http

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/internal/project/application"
	"github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
	"github.com/indalyadav56/logify/apps/backend/pkg/validator"
)

type ProjectHandler struct {
	service application.ProjectService
}

func NewProjectHandler(service application.ProjectService) *ProjectHandler {
	return &ProjectHandler{service: service}
}

// CreateWorkspace handles POST /v1/workspaces
func (h *ProjectHandler) CreateWorkspace(c *gin.Context) {
	var input application.CreateWorkspaceInput
	if !validator.ValidateRequest(c, &input) {
		return
	}

	tenantID, ok := middleware.TenantIDFromContext(c.Request.Context())
	if !ok {
		response.Unauthorized(c, "Tenant ID is required")
		return
	}
	input.TenantID = uuid.MustParse(tenantID)

	ws, err := h.service.CreateWorkspace(c.Request.Context(), input)
	if err != nil {
		h.writeError(c, err, "Failed to create workspace")
		return
	}
	response.Created(c, "Workspace created successfully", ws)
}

// GetWorkspace handles GET /v1/workspaces/:id
func (h *ProjectHandler) GetWorkspace(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	ws, err := h.service.GetWorkspace(c.Request.Context(), id)
	if err != nil {
		h.writeError(c, err, "Failed to retrieve workspace")
		return
	}
	response.OK(c, "Workspace retrieved successfully", ws)
}

// ListWorkspaces handles GET /v1/workspaces[?tenant_id=...]
func (h *ProjectHandler) ListWorkspaces(c *gin.Context) {
	var tenantID *uuid.UUID
	if v := c.Query("tenant_id"); v != "" {
		id, err := uuid.Parse(v)
		if err != nil {
			response.BadRequest(c, "Invalid tenant_id format")
			return
		}
		tenantID = &id
	}

	items, err := h.service.ListWorkspaces(c.Request.Context(), tenantID)
	if err != nil {
		response.InternalServerError(c, "Failed to list workspaces")
		return
	}
	response.OK(c, "Workspaces retrieved successfully", items)
}

// UpdateWorkspace handles PUT /v1/workspaces/:id
func (h *ProjectHandler) UpdateWorkspace(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	var input application.UpdateWorkspaceInput
	if !validator.ValidateRequest(c, &input) {
		return
	}

	ws, err := h.service.UpdateWorkspace(c.Request.Context(), id, input)
	if err != nil {
		h.writeError(c, err, "Failed to update workspace")
		return
	}
	response.OK(c, "Workspace updated successfully", ws)
}

// DeleteWorkspace handles DELETE /v1/workspaces/:id
func (h *ProjectHandler) DeleteWorkspace(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	if err := h.service.DeleteWorkspace(c.Request.Context(), id); err != nil {
		h.writeError(c, err, "Failed to delete workspace")
		return
	}
	response.NoContent(c)
}

// writeError maps domain errors to HTTP responses with a consistent envelope.
func (h *ProjectHandler) writeError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, domain.ErrWorkspaceNotFound):
		response.NotFound(c, "Workspace not found")
	case errors.Is(err, domain.ErrWorkspaceAlreadyExists):
		response.Conflict(c, "A workspace with this name already exists in the tenant")
	default:
		response.InternalServerError(c, fallback)
	}
}

func parseUUIDParam(c *gin.Context, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(name))
	if err != nil {
		response.BadRequest(c, "Invalid "+name+" format")
		return uuid.Nil, false
	}
	return id, true
}
