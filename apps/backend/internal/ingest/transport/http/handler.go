package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	ingestApplication "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
	"github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

type IngestHandler interface {
	CreateLog(c *gin.Context)
}

type ingestHandler struct {
	service ingestApplication.IngestService
}

func NewIngestHandler(service ingestApplication.IngestService) IngestHandler {
	return &ingestHandler{service: service}
}

// CreateLog ingests a single log entry.
// @Summary      Ingest a log entry
// @Description  Send with X-API-Key or a Bearer token. A project API key supplies project_id automatically and is restricted to that project.
// @Tags         ingest
// @Security     APIKeyAuth
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        X-API-Key header string false "Project API key"
// @Param        request  body      CreateLogRequest  true  "Log payload"
// @Success      202      {object}  map[string]string "log received"
// @Failure      400      {object}  map[string]string "invalid request body"
// @Failure      401      {object}  response.APIResponse "invalid authentication"
// @Failure      403      {object}  response.APIResponse "key cannot access this project"
// @Failure      500      {object}  map[string]string "failed to publish log"
// @Router       /v1/logs [post]
func (h *ingestHandler) CreateLog(c *gin.Context) {
	var req CreateLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Ingest(c.Request.Context(), req.ToDomain()); err != nil {
		switch {
		case errors.Is(err, domain.ErrUnauthorized):
			response.Unauthorized(c, err.Error())
		case errors.Is(err, domain.ErrInvalidProject):
			response.BadRequest(c, "Invalid or missing project_id")
		case errors.Is(err, domain.ErrProjectForbidden):
			response.Forbidden(c, err.Error())
		case errors.Is(err, projectDomain.ErrProjectNotFound):
			response.NotFound(c, "Project not found")
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to publish log"})
		}
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"message": "log received"})
}
