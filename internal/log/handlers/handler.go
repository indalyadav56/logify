package handlers

import (
	"common/pkg/logger"
	"common/pkg/validator"
	"fmt"
	"logify/internal/log/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LogHandler interface {
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	LogSearch(c *gin.Context)
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
func (h *logHandler) Create(c *gin.Context) {
	rawData, err := c.GetRawData()
	if err != nil {
		h.log.Error("failed to get raw data", err)
		c.JSON(500, gin.H{"message": "failed to get raw data"})
		return
	}
	fmt.Println("rawData", string(rawData))
	// if err := h.validator.Validate(rawData); err != nil {
	// 	h.log.Error("failed to validate raw data", err)
	// 	c.JSON(400, gin.H{"message": "failed to validate raw data"})
	// 	return
	// }
	if err := h.service.PublishLog(string(rawData)); err != nil {
		h.log.Error("failed to publish log", err)
		c.JSON(500, gin.H{"message": "failed to publish log"})
		return
	}
	c.JSON(http.StatusAccepted, gin.H{"message": "log created successfully"})
}

// @Summary Update log details
// @Description Update details of an existing log entry
// @Tags log
// @Accept json
// @Produce json
// @Param id path int true "log ID"
// @Router /v1/logs/{id} [patch]
func (h *logHandler) Update(c *gin.Context) {
	// Implementation for Update
}

// @Summary Delete log
// @Description Delete an existing log entry
// @Tags log
// @Accept json
// @Produce json
// @Router /v1/logs/{id} [delete]
func (h *logHandler) Delete(c *gin.Context) {
	// Implementation for Delete
}

func (h *logHandler) LogSearch(c *gin.Context) {
	result, err := h.service.Search("query")
	if err != nil {
		h.log.Error("failed to filter logs", err)
		c.JSON(500, gin.H{"message": "failed to filter logs"})
		return
	}

	c.JSON(200, gin.H{"message": "Get log", "logs": result})

}
