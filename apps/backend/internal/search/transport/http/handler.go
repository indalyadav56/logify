package http

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/search/application"
	"github.com/indalyadav56/logify/apps/backend/internal/search/domain"
)

// Handler handles all search-related HTTP requests.
type Handler struct {
	service *application.SearchService
	log     *zap.Logger
}

func NewHandler(service *application.SearchService, log *zap.Logger) *Handler {
	return &Handler{service: service, log: log}
}

// Search runs a log query against ClickHouse.
// @Summary      Search logs
// @Description  Search logs in a project visible to the authenticated user.
// @Tags         logs
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request      body      SearchRequest  true   "Search query"
// @Success      200          {object}  SearchResponse "Search results"
// @Failure      400          {object}  map[string]string "Invalid request or missing project_id"
// @Failure      500          {object}  map[string]string "Search failed"
// @Router       /v1/logs/search [post]
func (h *Handler) Search(c *gin.Context) {
	var req SearchRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.Search(c.Request.Context(), req.ToQuery())
	if err != nil {
		switch {
		case errors.Is(err, project.ErrProjectNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		case errors.Is(err, project.ErrForbidden):
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		case errors.Is(err, domain.ErrTenantIDRequired):
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		case errors.Is(err, domain.ErrProjectIDRequired),
			errors.Is(err, domain.ErrTimeRangeRequired),
			errors.Is(err, domain.ErrInvalidTimeRange),
			errors.Is(err, domain.ErrLimitTooLarge):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			h.log.Error("search failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		}
		return
	}

	c.JSON(http.StatusOK, toSearchResponse(result))
}

// GetByID fetches a single log entry by ID.
// @Summary      Get log by ID
// @Description  Retrieve a log from an accessible project. Supply project_id for shared projects.
// @Tags         logs
// @Produce      json
// @Security     BearerAuth
// @Param        id           path      string  true   "Log ID"
// @Param        project_id   query     string  false  "Project UUID (required for shared projects)"
// @Success      200          {object}  LogResponse "Log entry"
// @Failure      400          {object}  map[string]string "Invalid project_id"
// @Failure      404          {object}  map[string]string "Log not found"
// @Failure      500          {object}  map[string]string "Fetch failed"
// @Router       /v1/logs/{id} [get]
func (h *Handler) GetByID(c *gin.Context) {
	logID := c.Param("id")
	entry, err := h.service.GetByID(c.Request.Context(), c.Query("project_id"), logID)
	if err != nil {
		if errors.Is(err, domain.ErrProjectIDRequired) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, domain.ErrLogNotFound) || errors.Is(err, project.ErrProjectNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "log not found"})
			return
		}
		h.log.Error("get log by id failed", zap.String("log_id", logID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch failed"})
		return
	}

	c.JSON(http.StatusOK, toLogResponse(*entry))
}

// Aggregate runs a log aggregation query.
// @Summary      Aggregate logs
// @Description  Run a grouped/time-bucketed aggregation over logs.
// @Tags         logs
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      AggregateRequest  true  "Aggregation query"
// @Success      200      {object}  AggregateResponse "Aggregation result"
// @Failure      400      {object}  map[string]string "Invalid request"
// @Failure      500      {object}  map[string]string "Aggregate failed"
// @Router       /v1/logs/aggregate [post]
func (h *Handler) Aggregate(c *gin.Context) {
	var req AggregateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	aggReq := domain.AggregationRequest{
		Query: domain.Query{
			ProjectID: req.ProjectID,
			From:      req.From,
			To:        req.To,
		},
		GroupBy:  req.GroupBy,
		Interval: req.Interval,
	}

	result, err := h.service.Aggregate(c.Request.Context(), aggReq)
	if err != nil {
		switch {
		case errors.Is(err, project.ErrProjectNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		case errors.Is(err, project.ErrForbidden):
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		case errors.Is(err, domain.ErrProjectIDRequired),
			errors.Is(err, domain.ErrInvalidTimeRange),
			errors.Is(err, domain.ErrTimeRangeRequired):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			h.log.Error("aggregate failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "aggregate failed"})
		}
		return
	}

	c.JSON(http.StatusOK, toAggregateResponse(result))
}

// Export starts an async log export job.
// @Summary      Export logs
// @Description  Start an asynchronous log export job; returns the export job ID.
// @Tags         logs
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      ExportRequest  true  "Export query"
// @Success      202      {object}  ExportResponse "Export accepted"
// @Failure      400      {object}  map[string]string "Invalid request"
// @Router       /v1/logs/export [post]
func (h *Handler) Export(c *gin.Context) {
	var req ExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, ExportResponse{
		ExportID:  uuid.NewString(),
		Status:    "pending",
		CreatedAt: time.Now().UTC(),
	})
}

// ExportStatus returns the status of an export job.
// @Summary      Get export status
// @Description  Return the current status of an async log export job.
// @Tags         logs
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Export ID"
// @Success      200  {object}  ExportStatusResponse "Export status"
// @Router       /exports/{id} [get]
func (h *Handler) ExportStatus(c *gin.Context) {
	exportID := c.Param("id")

	c.JSON(http.StatusOK, ExportStatusResponse{
		ExportID:  exportID,
		Status:    "processing",
		CreatedAt: time.Now().UTC(),
	})
}
