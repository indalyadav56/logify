package http

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

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

// resolveTenantID reads tenant_id from gin context (auth middleware), then falls
// back to the X-Tenant-ID header, and finally to a field in the request struct.
func resolveTenantID(c *gin.Context, fromBody string) string {
	if id := c.GetString("tenant_id"); id != "" {
		return id
	}
	if id := c.GetHeader("X-Tenant-ID"); id != "" {
		return id
	}
	return fromBody
}

// Search godoc
// POST /v1/logs/search
func (h *Handler) Search(c *gin.Context) {
	var req SearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenantID := resolveTenantID(c, req.TenantID)
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id is required"})
		return
	}

	q := toDomainQuery(tenantID, req)

	result, err := h.service.Search(c.Request.Context(), q)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidTimeRange),
			errors.Is(err, domain.ErrTimeRangeRequired),
			errors.Is(err, domain.ErrLimitTooLarge):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			h.log.Error("search failed", zap.String("tenant_id", tenantID), zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		}
		return
	}

	c.JSON(http.StatusOK, toSearchResponse(result))
}

// GetByID godoc
// GET /v1/logs/:id
func (h *Handler) GetByID(c *gin.Context) {
	logID := c.Param("id")
	tenantID := resolveTenantID(c, c.Query("tenant_id"))
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id is required"})
		return
	}

	entry, err := h.service.GetByID(c.Request.Context(), tenantID, logID)
	if err != nil {
		if errors.Is(err, domain.ErrLogNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "log not found"})
			return
		}
		h.log.Error("get log by id failed", zap.String("log_id", logID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch failed"})
		return
	}

	c.JSON(http.StatusOK, toLogResponse(*entry))
}

// Aggregate godoc
// POST /v1/logs/aggregate
func (h *Handler) Aggregate(c *gin.Context) {
	var req AggregateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenantID := resolveTenantID(c, req.TenantID)
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id is required"})
		return
	}

	aggReq := domain.AggregationRequest{
		Query: domain.Query{
			TenantID: tenantID,
			From:     req.From,
			To:       req.To,
		},
		GroupBy:  req.GroupBy,
		Interval: req.Interval,
	}

	result, err := h.service.Aggregate(c.Request.Context(), aggReq)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidTimeRange),
			errors.Is(err, domain.ErrTimeRangeRequired):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			h.log.Error("aggregate failed", zap.String("tenant_id", tenantID), zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "aggregate failed"})
		}
		return
	}

	c.JSON(http.StatusOK, toAggregateResponse(result))
}

// Export godoc
// POST /v1/logs/export
// Returns a static accepted response — async export is not yet implemented.
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

// ExportStatus godoc
// GET /v1/exports/:id
// Returns a static processing response — async export is not yet implemented.
func (h *Handler) ExportStatus(c *gin.Context) {
	exportID := c.Param("id")

	c.JSON(http.StatusOK, ExportStatusResponse{
		ExportID:  exportID,
		Status:    "processing",
		CreatedAt: time.Now().UTC(),
	})
}
