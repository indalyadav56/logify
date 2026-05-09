package http

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/indalyadav56/logify/apps/backend/internal/outbox/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// OutboxHandler exposes admin endpoints for inspecting the outbox.
type OutboxHandler interface {
	ListEvents(c *gin.Context)
	GetStats(c *gin.Context)
	RetryFailed(c *gin.Context)
}

type outboxHandler struct {
	db *gorm.DB
}

// NewOutboxHandler creates a new OutboxHandler.
func NewOutboxHandler(db *gorm.DB) OutboxHandler {
	return &outboxHandler{db: db}
}

// ListEvents handles GET /api/v1/admin/outbox
func (h *outboxHandler) ListEvents(c *gin.Context) {
	var events []domain.OutboxEvent

	query := h.db.WithContext(c.Request.Context()).Model(&domain.OutboxEvent{})

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by aggregate type
	if aggType := c.Query("aggregate_type"); aggType != "" {
		query = query.Where("aggregate_type = ?", aggType)
	}

	// Pagination
	page := 1
	perPage := 50

	if p := c.Query("page"); p != "" {
		if val, err := strconv.Atoi(p); err == nil && val > 0 {
			page = val
		}
	}
	if pp := c.Query("per_page"); pp != "" {
		if val, err := strconv.Atoi(pp); err == nil && val > 0 && val <= 100 {
			perPage = val
		}
	}

	var total int64
	query.Count(&total)

	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&events).Error; err != nil {
		response.InternalServerError(c, "Failed to list outbox events")
		return
	}

	response.Paginated(c, events, page, perPage, total)
}

// StatusCount is a helper DTO for the stats endpoint.
type StatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

// GetStats handles GET /api/v1/admin/outbox/stats
func (h *outboxHandler) GetStats(c *gin.Context) {
	var stats []StatusCount

	err := h.db.WithContext(c.Request.Context()).
		Model(&domain.OutboxEvent{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&stats).Error

	if err != nil {
		response.InternalServerError(c, "Failed to retrieve outbox stats")
		return
	}

	response.OK(c, "Outbox stats retrieved", stats)
}

// RetryFailed handles POST /api/v1/admin/outbox/retry
// Resets all permanently failed events back to pending status.
func (h *outboxHandler) RetryFailed(c *gin.Context) {
	result := h.db.WithContext(c.Request.Context()).
		Model(&domain.OutboxEvent{}).
		Where("status = ?", domain.OutboxStatusFailed).
		Updates(map[string]interface{}{
			"status":      domain.OutboxStatusPending,
			"retry_count": 0,
			"last_error":  "",
		})

	if result.Error != nil {
		response.InternalServerError(c, "Failed to retry failed events")
		return
	}

	response.OK(c, "Failed events reset to pending", gin.H{
		"reset_count": result.RowsAffected,
	})
}
