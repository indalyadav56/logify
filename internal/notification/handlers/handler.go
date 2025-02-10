package handlers

import (
	"common/pkg/logger"
	"common/pkg/validator"
	"github.com/gin-gonic/gin"
	"logify/internal/notification/services"
)

type NotificationHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
}

type notificationHandler struct {
	service   services.NotificationService
	log       logger.Logger
	validator validator.Validator
}

func NewNotificationHandler(service services.NotificationService, log logger.Logger, validator validator.Validator) NotificationHandler {
	return &notificationHandler{
		service:   service,
		log:       log,
		validator: validator,
	}
}

// @Summary Create a new notification
// @Description Create a new notification entry
// @Tags notification
// @Accept json
// @Produce json
// @Router /v1/notifications [post]
func (h *notificationHandler) Create(c *gin.Context) {
	// Implementation for Create
}

// @Summary Get notification details
// @Description Get details of a notification entry
// @Tags notification
// @Accept json
// @Produce json
// @Param id path int true "notification ID"
// @Router /v1/notifications/{id} [get]
func (h *notificationHandler) Get(c *gin.Context) {
	// Implementation for Get
}

// @Summary Update notification details
// @Description Update details of an existing notification entry
// @Tags notification
// @Accept json
// @Produce json
// @Param id path int true "notification ID"
// @Router /v1/notifications/{id} [patch]
func (h *notificationHandler) Update(c *gin.Context) {
	// Implementation for Update
}

// @Summary Delete notification
// @Description Delete an existing notification entry
// @Tags notification
// @Accept json
// @Produce json
// @Router /v1/notifications/{id} [delete]
func (h *notificationHandler) Delete(c *gin.Context) {
	// Implementation for Delete
}
