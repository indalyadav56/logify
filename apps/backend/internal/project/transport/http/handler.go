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

// CreateProject creates a new project for the current tenant.
// @Summary      Create project
// @Description  Create a new project within the authenticated tenant.
// @Tags         projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      application.CreateProjectInput  true  "Project payload"
// @Success      201      {object}  response.APIResponse "Project created successfully"
// @Failure      400      {object}  response.APIResponse "Invalid request"
// @Failure      401      {object}  response.APIResponse "Unauthorized"
// @Failure      409      {object}  response.APIResponse "Project already exists"
// @Failure      500      {object}  response.APIResponse "Internal server error"
// @Router       /v1/projects [post]
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

// GetProject retrieves a single project by ID.
// @Summary      Get project
// @Description  Retrieve a project by UUID.
// @Tags         projects
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID (UUID)"
// @Success      200  {object}  response.APIResponse "Project retrieved successfully"
// @Failure      400  {object}  response.APIResponse "Invalid id format"
// @Failure      404  {object}  response.APIResponse "Project not found"
// @Failure      500  {object}  response.APIResponse "Internal server error"
// @Router       /v1/projects/{id} [get]
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

// ListProjects lists projects, optionally filtered by tenant.
// @Summary      List projects
// @Description  Return projects visible to the caller. Optionally filter by tenant_id.
// @Tags         projects
// @Produce      json
// @Security     BearerAuth
// @Param        tenant_id  query     string  false  "Filter by tenant UUID"
// @Success      200        {object}  response.APIResponse "Projects retrieved successfully"
// @Failure      400        {object}  response.APIResponse "Invalid tenant_id format"
// @Failure      500        {object}  response.APIResponse "Internal server error"
// @Router       /v1/projects [get]
func (h *ProjectHandler) ListProjects(c *gin.Context) {
	items, err := h.service.ListProjects(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to list projects")
		return
	}
	response.OK(c, "Projects retrieved successfully", items)
}

// UpdateProject updates an existing project.
// @Summary      Update project
// @Description  Update fields on an existing project.
// @Tags         projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                           true  "Project ID (UUID)"
// @Param        request  body      application.UpdateProjectInput   true  "Project update payload"
// @Success      200      {object}  response.APIResponse "Project updated successfully"
// @Failure      400      {object}  response.APIResponse "Invalid request"
// @Failure      404      {object}  response.APIResponse "Project not found"
// @Failure      500      {object}  response.APIResponse "Internal server error"
// @Router       /v1/projects/{id} [put]
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

// DeleteProject deletes a project.
// @Summary      Delete project
// @Description  Delete a project by UUID.
// @Tags         projects
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID (UUID)"
// @Success      204  "No content"
// @Failure      400  {object}  response.APIResponse "Invalid id format"
// @Failure      404  {object}  response.APIResponse "Project not found"
// @Failure      500  {object}  response.APIResponse "Internal server error"
// @Router       /v1/projects/{id} [delete]
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
