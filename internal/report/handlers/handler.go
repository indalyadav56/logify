package handlers

import (
	"common/pkg/logger"
	"common/pkg/validator"
	"github.com/gin-gonic/gin"
	"logify/internal/report/services"
)

type ReportHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
}

type reportHandler struct {
	service   services.ReportService
	log       logger.Logger
	validator validator.Validator
}

func NewReportHandler(service services.ReportService, log logger.Logger, validator validator.Validator) ReportHandler {
	return &reportHandler{
		service:   service,
		log:       log,
		validator: validator,
	}
}

// @Summary Create a new report
// @Description Create a new report entry
// @Tags report
// @Accept json
// @Produce json
// @Router /v1/reports [post]
func (h *reportHandler) Create(c *gin.Context) {
	// Implementation for Create
}

// @Summary Get report details
// @Description Get details of a report entry
// @Tags report
// @Accept json
// @Produce json
// @Param id path int true "report ID"
// @Router /v1/reports/{id} [get]
func (h *reportHandler) Get(c *gin.Context) {
	// Implementation for Get
}

// @Summary Update report details
// @Description Update details of an existing report entry
// @Tags report
// @Accept json
// @Produce json
// @Param id path int true "report ID"
// @Router /v1/reports/{id} [patch]
func (h *reportHandler) Update(c *gin.Context) {
	// Implementation for Update
}

// @Summary Delete report
// @Description Delete an existing report entry
// @Tags report
// @Accept json
// @Produce json
// @Router /v1/reports/{id} [delete]
func (h *reportHandler) Delete(c *gin.Context) {
	// Implementation for Delete
}
