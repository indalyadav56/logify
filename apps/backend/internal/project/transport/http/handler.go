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

// CreateProject handles POST /v1/projects
func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var input application.CreateProjectInput
	if !validator.ValidateRequest(c, &input) {
		return
	}

	tenantID, ok := middleware.TenantIDFromContext(c.Request.Context())
	if !ok {
		response.Unauthorized(c, "Tenant ID is required")
		return
	}
	input.TenantID = uuid.MustParse(tenantID)

	ws, err := h.service.CreateProject(c.Request.Context(), input)
	if err != nil {
		h.writeError(c, err, "Failed to create project")
		return
	}
	response.Created(c, "Project created successfully", ws)
}

// GetProject handles GET /v1/projects/:id
func (h *ProjectHandler) GetProject(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	ws, err := h.service.GetProject(c.Request.Context(), id)
	if err != nil {
		h.writeError(c, err, "Failed to retrieve project")
		return
	}
	response.OK(c, "Project retrieved successfully", ws)
}

// ListProjects handles GET /v1/projects[?tenant_id=...]
func (h *ProjectHandler) ListProjects(c *gin.Context) {
	var tenantID *uuid.UUID
	if v := c.Query("tenant_id"); v != "" {
		id, err := uuid.Parse(v)
		if err != nil {
			response.BadRequest(c, "Invalid tenant_id format")
			return
		}
		tenantID = &id
	}

	items, err := h.service.ListProjects(c.Request.Context(), tenantID)
	if err != nil {
		response.InternalServerError(c, "Failed to list projects")
		return
	}
	response.OK(c, "Projects retrieved successfully", items)
}

// UpdateProject handles PUT /v1/projects/:id
func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	var input application.UpdateProjectInput
	if !validator.ValidateRequest(c, &input) {
		return
	}

	ws, err := h.service.UpdateProject(c.Request.Context(), id, input)
	if err != nil {
		h.writeError(c, err, "Failed to update project")
		return
	}
	response.OK(c, "Project updated successfully", ws)
}

// DeleteProject handles DELETE /v1/projects/:id
func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	if err := h.service.DeleteProject(c.Request.Context(), id); err != nil {
		h.writeError(c, err, "Failed to delete project")
		return
	}
	response.NoContent(c)
}

// writeError maps domain errors to HTTP responses with a consistent envelope.
func (h *ProjectHandler) writeError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, domain.ErrProjectNotFound):
		response.NotFound(c, "Project not found")
	case errors.Is(err, domain.ErrProjectAlreadyExists):
		response.Conflict(c, "A project with this name already exists in the tenant")
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
