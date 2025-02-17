package handlers

import (
	"common/pkg/logger"
	"common/pkg/response"
	"common/pkg/validator"
	"logify/internal/user/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)

	GetCurrentUser(ctx *gin.Context)
}

type userHandler struct {
	service   services.UserService
	log       logger.Logger
	validator validator.Validator
}

func NewUserHandler(service services.UserService, log logger.Logger, validator validator.Validator) UserHandler {
	return &userHandler{
		service:   service,
		log:       log,
		validator: validator,
	}
}

// @Summary Create a new user
// @Description Create a new user entry
// @Tags user
// @Accept json
// @Produce json
// @Router /v1/users [post]
func (h *userHandler) Create(c *gin.Context) {
	// Implementation for Create
}

// @Summary Get user details
// @Description Get details of a user entry
// @Tags user
// @Accept json
// @Produce json
// @Param id path int true "user ID"
// @Router /v1/users/{id} [get]
func (h *userHandler) Get(c *gin.Context) {
	// Implementation for Get
}

// @Summary Update user details
// @Description Update details of an existing user entry
// @Tags user
// @Accept json
// @Produce json
// @Param id path int true "user ID"
// @Router /v1/users/{id} [patch]
func (h *userHandler) Update(c *gin.Context) {
	// Implementation for Update
}

// @Summary Delete user
// @Description Delete an existing user entry
// @Tags user
// @Accept json
// @Produce json
// @Router /v1/users/{id} [delete]
func (h *userHandler) Delete(c *gin.Context) {
	// Implementation for Delete
}

// GetCurrentUser godoc
// @Summary Get the current authenticated user
// @Description Return details of the currently authenticated user
// @Tags Auth
// @Accept  json
// @Produce  json
// @Router /v1/users/me [get]
func (h *userHandler) GetCurrentUser(ctx *gin.Context) {
	userId := ctx.MustGet("user_id")

	data, err := h.service.GetByID(userId.(string))
	if err != nil {
		response.SendError(ctx, http.StatusInternalServerError, "failed to get user", err)
		return
	}

	response.SendSuccess(ctx, "fetched user", data)
}
