package handlers

import (
	"net/http"

	"common/pkg/logger"
	"common/pkg/response"
	"common/pkg/validator"
	"logify/internal/auth/dto"
	"logify/internal/auth/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler interface {
	Register(c *gin.Context)
	Login(c *gin.Context)
	RefreshToken(c *gin.Context)
	Logout(c *gin.Context)
	ResetPassword(c *gin.Context)
}

type authHandler struct {
	service   services.AuthService
	logger    logger.Logger
	validator validator.Validator
}

func NewAuthHandler(service services.AuthService, log logger.Logger, validator validator.Validator) AuthHandler {
	return &authHandler{
		service:   service,
		logger:    log,
		validator: validator,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with the provided details
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param user body dto.RegisterRequest true "User details"
// @Router /auth/register [post]
func (h *authHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "Failed to register user", err)
		return
	}

	resp, err := h.service.Register(c.Request.Context(), &req)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "Failed to register user", err)
		return
	}

	response.SendSuccess(c, "User registered successfully", resp)
}

// Login godoc
// @Summary Login a user
// @Description Authenticate a user and return a JWT token
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param user body dto.LoginRequest true "User details"
// @Router /auth/login [post]
func (h *authHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "Failed to login user", err)
		return
	}

	resp, err := h.service.Login(c.Request.Context(), &req)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "Failed to login user", err)
		return
	}

	response.SendSuccess(c, "User logged in successfully", resp)
}

// RefreshToken godoc
// @Summary Refresh the JWT token
// @Description Refresh the JWT token using a valid refresh token
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param user body dto.RefreshTokenRequest true "Refresh token"
// @Router /auth/refresh [post]
func (h *authHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.RefreshToken(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Logout godoc
// @Summary Logout a user
// @Description Invalidate the refresh token to log the user out
// @Tags Auth
// @Accept  json
// @Produce  json
// @Router /auth/logout [post]
func (h *authHandler) Logout(ctx *gin.Context) {

}

// ResetPassword godoc
// @Summary Reset password
// @Description Reset the user's password using a valid reset token
// @Tags Auth
// @Accept  json
// @Produce  json
// @Router /auth/reset-password [post]
func (h *authHandler) ResetPassword(ctx *gin.Context) {

}
