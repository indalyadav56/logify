package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	ingestApplication "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
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
// @Description  Accept a log entry and publish it to the ingest pipeline.
// @Tags         ingest
// @Accept       json
// @Produce      json
// @Param        request  body      CreateLogRequest  true  "Log payload"
// @Success      202      {object}  map[string]string "log received"
// @Failure      400      {object}  map[string]string "invalid request body"
// @Failure      500      {object}  map[string]string "failed to publish log"
// @Router       /v1/logs [post]
func (h *ingestHandler) CreateLog(c *gin.Context) {
	var req CreateLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Ingest(c.Request.Context(), req.ToDomain()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to publish log"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"message": "log received"})
}
