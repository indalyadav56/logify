package handlers

import (
	"common/pkg/logger"
	"common/pkg/response"
	"common/pkg/validator"
	"fmt"
	"logify/internal/log/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LogHandler interface {
	PublishLog(c *gin.Context)
	LogSearch(c *gin.Context)
	GetAllServices(c *gin.Context)
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

	rawData, err := c.GetRawData()
	if err != nil {
		h.log.Error("failed to get raw data", err)
		response.SendError(c, http.StatusInternalServerError, "failed to get raw data", err)
		return
	}

	fmt.Println("rawData:::=>", string(rawData))
	// if err := h.validator.Validate(rawData); err != nil {
	// 	h.log.Error("failed to validate raw data", err)
	// 	c.JSON(400, gin.H{"message": "failed to validate raw data"})
	// 	return
	// }
	if err := h.service.PublishLog(string(rawData), tenantID, projectID); err != nil {
		h.log.Error("failed to publish log", err)
		response.SendError(c, http.StatusInternalServerError, "failed to publish log", err)
		return
	}

	response.SendSuccess(c, "log created successfully", nil)
}

func (h *logHandler) LogSearch(c *gin.Context) {
	tenantID := c.MustGet("tenant_id").(string)
	projectID := c.MustGet("project_id").(string)

	result, err := h.service.Search("query", tenantID, projectID)
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
