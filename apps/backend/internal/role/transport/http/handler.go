package http

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/internal/role/application"
	"github.com/indalyadav56/logify/apps/backend/internal/role/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
	"github.com/indalyadav56/logify/apps/backend/pkg/validator"
)

// RoleHandler defines the HTTP surface for the roles bounded context.
type RoleHandler interface {
	CreateRole(c *gin.Context)
	GetRole(c *gin.Context)
	UpdateRole(c *gin.Context)
	DeleteRole(c *gin.Context)
	ListRoles(c *gin.Context)

	ListPermissions(c *gin.Context)
	AddPermission(c *gin.Context)
	RemovePermission(c *gin.Context)
	ReplacePermissions(c *gin.Context)
}

type roleHandler struct {
	service application.RoleService
}

// NewRoleHandler creates a new RoleHandler.
func NewRoleHandler(service application.RoleService) RoleHandler {
	return &roleHandler{service: service}
}

// replacePermissionsRequest is a thin wrapper so the JSON body can be a single
// object (`{"permissions": [...]}`) instead of a bare array.
type replacePermissionsRequest struct {
	Permissions []application.PermissionInput `json:"permissions" validate:"required,dive"`
}

// CreateRole handles POST /v1/roles
func (h *roleHandler) CreateRole(c *gin.Context) {
	var input application.CreateRoleInput
	if !validator.ValidateRequest(c, &input) {
		return
	}

	role, err := h.service.CreateRole(c.Request.Context(), input)
	if err != nil {
		h.writeError(c, err, "Failed to create role")
		return
	}
	response.Created(c, "Role created successfully", role)
}

// GetRole handles GET /v1/roles/:id
func (h *roleHandler) GetRole(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	role, err := h.service.GetRole(c.Request.Context(), id)
	if err != nil {
		h.writeError(c, err, "Failed to retrieve role")
		return
	}
	response.OK(c, "Role retrieved successfully", role)
}

// UpdateRole handles PUT /v1/roles/:id
func (h *roleHandler) UpdateRole(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	var input application.UpdateRoleInput
	if !validator.ValidateRequest(c, &input) {
		return
	}

	role, err := h.service.UpdateRole(c.Request.Context(), id, input)
	if err != nil {
		h.writeError(c, err, "Failed to update role")
		return
	}
	response.OK(c, "Role updated successfully", role)
}

// DeleteRole handles DELETE /v1/roles/:id
func (h *roleHandler) DeleteRole(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}

	if err := h.service.DeleteRole(c.Request.Context(), id); err != nil {
		h.writeError(c, err, "Failed to delete role")
		return
	}
	response.NoContent(c)
}

// ListRoles handles GET /v1/roles
func (h *roleHandler) ListRoles(c *gin.Context) {
	filter := domain.DefaultListFilter()

	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			filter.Page = n
		}
	}
	if v := c.Query("per_page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			filter.PerPage = n
		}
	}
	if v := strings.TrimSpace(c.Query("search")); v != "" {
		filter.Search = v
	}
	if v := c.Query("sort_by"); v != "" {
		filter.SortBy = v
	}
	if v := c.Query("sort_dir"); v != "" {
		filter.SortDir = v
	}
	if v := c.Query("tenant_id"); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			filter.TenantID = &id
		}
	}
	if v := c.Query("is_system"); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			filter.IsSystem = &b
		}
	}
	if v := c.Query("include_global"); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			filter.IncludeGlobal = b
		}
	}

	roles, total, err := h.service.ListRoles(c.Request.Context(), filter)
	if err != nil {
		response.InternalServerError(c, "Failed to list roles")
		return
	}
	response.Paginated(c, roles, filter.Page, filter.PerPage, total)
}

// ListPermissions handles GET /v1/roles/:id/permissions
func (h *roleHandler) ListPermissions(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}
	perms, err := h.service.ListPermissions(c.Request.Context(), id)
	if err != nil {
		h.writeError(c, err, "Failed to list permissions")
		return
	}
	response.OK(c, "Permissions retrieved successfully", perms)
}

// AddPermission handles POST /v1/roles/:id/permissions
func (h *roleHandler) AddPermission(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}
	var input application.PermissionInput
	if !validator.ValidateRequest(c, &input) {
		return
	}
	if err := h.service.AddPermission(c.Request.Context(), id, input); err != nil {
		h.writeError(c, err, "Failed to add permission")
		return
	}
	response.Created(c, "Permission added successfully", input)
}

// RemovePermission handles DELETE /v1/roles/:id/permissions/:resource/:action
func (h *roleHandler) RemovePermission(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}
	input := application.PermissionInput{
		Resource: c.Param("resource"),
		Action:   c.Param("action"),
	}
	if err := h.service.RemovePermission(c.Request.Context(), id, input); err != nil {
		h.writeError(c, err, "Failed to remove permission")
		return
	}
	response.NoContent(c)
}

// ReplacePermissions handles PUT /v1/roles/:id/permissions
func (h *roleHandler) ReplacePermissions(c *gin.Context) {
	id, ok := parseUUIDParam(c, "id")
	if !ok {
		return
	}
	var body replacePermissionsRequest
	if !validator.ValidateRequest(c, &body) {
		return
	}
	if err := h.service.ReplacePermissions(c.Request.Context(), id, body.Permissions); err != nil {
		h.writeError(c, err, "Failed to replace permissions")
		return
	}
	response.OK(c, "Permissions replaced successfully", body)
}

// --- helpers ---

// writeError maps domain errors to HTTP responses with a consistent envelope.
func (h *roleHandler) writeError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, domain.ErrRoleNotFound):
		response.NotFound(c, "Role not found")
	case errors.Is(err, domain.ErrPermissionNotFound):
		response.NotFound(c, "Permission not found on role")
	case errors.Is(err, domain.ErrRoleAlreadyExists):
		response.Conflict(c, "A role with this name already exists in the tenant")
	case errors.Is(err, domain.ErrSystemRoleReadOnly):
		response.Forbidden(c, "System roles cannot be modified or deleted")
	case errors.Is(err, domain.ErrInvalidPermission):
		response.BadRequest(c, "Permission must include both resource and action")
	default:
		response.InternalServerError(c, fallback)
	}
}

// parseUUIDParam extracts and validates a UUID path parameter, writing the
// proper 400 response on failure. Returns (uuid, ok).
func parseUUIDParam(c *gin.Context, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(name))
	if err != nil {
		response.BadRequest(c, "Invalid "+name+" format")
		return uuid.Nil, false
	}
	return id, true
}
