package handlers

import (
	"common/pkg/logger"
	"common/pkg/response"
	"common/pkg/validator"
	"logify/internal/log/dto"
	"logify/internal/log/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type LogHandler interface {
	PublishLog(c *gin.Context)
	LogSearch(c *gin.Context)
	GetAllServices(c *gin.Context)

	AddBookmark(c *gin.Context)
}

type logHandler struct {
	service   services.LogService
	log       logger.Logger
	validator validator.Validator
}

func NewLogHandler(service services.LogService, log logger.Logger, validator validator.Validator) LogHandler {
	return &logHandler{
		service:   service,
		log:       log,
		validator: validator,
	}
}

// @Summary Create a new log
// @Description Create a new log entry
// @Tags log
// @Accept json
// @Produce json
// @Router /v1/logs [post]
func (h *logHandler) PublishLog(c *gin.Context) {
	tenantID := c.MustGet("tenant_id").(string)
	projectID := c.MustGet("project_id").(string)

	// if err := h.validator.Validate(rawData); err != nil {
	// 	h.log.Error("failed to validate raw data", err)
	// 	c.JSON(400, gin.H{"message": "failed to validate raw data"})
	// 	return
	// }

	var req dto.LogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Error("failed to bind json", err)
		response.SendError(c, http.StatusBadRequest, "failed to bind json", err)
		return
	}

	if req.Timestamp == "" {
		req.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	req.TenantID = tenantID
	req.ProjectID = projectID
	if err := h.service.PublishLog(&req); err != nil {
		h.log.Error("failed to publish log", err)
		response.SendError(c, http.StatusInternalServerError, "failed to publish log", err)
		return
	}

	response.SendSuccess(c, "log created successfully", nil)
}

func (h *logHandler) LogSearch(c *gin.Context) {
	tenantID := c.MustGet("tenant_id").(string)
	projectID := c.MustGet("project_id").(string)

	var req dto.LogSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Error("failed to bind json", err)
		response.SendError(c, http.StatusBadRequest, "failed to bind json", err)
		return
	}

	req.TenantID = tenantID
	req.ProjectID = projectID

	result, err := h.service.Search(&req)
	if err != nil {
		h.log.Error("failed to filter logs", err)
		response.SendError(c, http.StatusInternalServerError, "failed to filter logs", err)
		return
	}

	response.SendSuccess(c, "Get log", result)

}

func (h *logHandler) GetAllServices(c *gin.Context) {
	result, err := h.service.GetAllServices()
	if err != nil {
		h.log.Error("failed to get all services", err)
		response.SendError(c, http.StatusInternalServerError, "failed to get all services", err)
		return
	}

	response.SendSuccess(c, "Get log", result)

}

func (h *logHandler) AddBookmark(c *gin.Context) {

	tenantID := c.MustGet("tenant_id").(string)
	projectID := c.MustGet("project_id").(string)

	var req dto.AddBookmarkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Error("failed to bind json", err)
		response.SendError(c, http.StatusBadRequest, "failed to bind json", err)
		return
	}

	result, err := h.service.AddBookmark(req.LogID, tenantID, projectID)
	if err != nil {
		h.log.Error("failed to get all services", err)
		response.SendError(c, http.StatusInternalServerError, "failed to get all services", err)
		return
	}

	response.SendSuccess(c, "Get log", result)

}
