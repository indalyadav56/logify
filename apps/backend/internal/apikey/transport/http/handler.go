package http

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/internal/apikey/application"
	"github.com/indalyadav56/logify/apps/backend/internal/apikey/domain"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

type Handler struct{ service *application.Service }

func NewHandler(service *application.Service) *Handler { return &Handler{service: service} }

type CreateKeyRequest struct {
	Name string `json:"name" binding:"required,max=64"`
}

// Create issues a project key. The secret is returned only in this response.
// @Summary Create a project API key
// @Tags API keys
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Project UUID"
// @Param request body CreateKeyRequest true "Key name"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /v1/projects/{id}/api-keys [post]
func (h *Handler) Create(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var input CreateKeyRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "A key name of up to 64 characters is required")
		return
	}
	key, err := h.service.Create(c.Request.Context(), id, input.Name)
	if err != nil {
		writeError(c, err)
		return
	}
	response.Created(c, "API key created. Save the key; it won't be shown again.", key)
}

// List returns metadata without secrets or hashes.
// @Summary List project API keys
// @Tags API keys
// @Security BearerAuth
// @Produce json
// @Param id path string true "Project UUID"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /v1/projects/{id}/api-keys [get]
func (h *Handler) List(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	keys, err := h.service.List(c.Request.Context(), id)
	if err != nil {
		writeError(c, err)
		return
	}
	response.OK(c, "API keys retrieved", keys)
}

// Revoke immediately prevents a key from authenticating future ingest requests.
// @Summary Revoke a project API key
// @Tags API keys
// @Security BearerAuth
// @Param id path string true "Project UUID"
// @Param keyId path string true "API key UUID"
// @Success 204 "No content"
// @Failure 401 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /v1/projects/{id}/api-keys/{keyId} [delete]
func (h *Handler) Revoke(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	keyID, ok := parseID(c, "keyId")
	if !ok {
		return
	}
	if err := h.service.Revoke(c.Request.Context(), id, keyID); err != nil {
		writeError(c, err)
		return
	}
	response.NoContent(c)
}

func parseID(c *gin.Context, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(name))
	if err != nil {
		response.BadRequest(c, "Invalid "+name+" format")
		return uuid.Nil, false
	}
	return id, true
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, projectDomain.ErrProjectNotFound):
		response.NotFound(c, "Project not found")
	case errors.Is(err, domain.ErrKeyNotFound):
		response.NotFound(c, "API key not found")
	case errors.Is(err, domain.ErrInvalidName):
		response.BadRequest(c, err.Error())
	default:
		response.InternalServerError(c, "Failed to manage API keys")
	}
}
