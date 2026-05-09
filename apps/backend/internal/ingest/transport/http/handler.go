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
