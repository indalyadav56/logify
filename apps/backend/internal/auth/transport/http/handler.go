package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

type AuthHandler struct {
	svc application.AuthService
}

func NewAuthHandler(service application.AuthService) *AuthHandler {
	return &AuthHandler{svc: service}
}

// Register handles POST /api/v1/auth/register.
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	tokens, err := h.svc.Register(c.Request.Context(), application.RegisterInput{
		FullName: req.FullName,
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserAlreadyExists):
			response.Conflict(c, "A user with this email already exists")
		default:
			response.InternalServerError(c, "Failed to register user")
		}
		return
	}

	c.JSON(http.StatusCreated, response.APIResponse{
		Success: true,
		Message: "Registration successful",
		Data:    toTokenResponse(tokens),
	})
}

// Login handles POST /api/v1/auth/login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	tokens, err := h.svc.Login(c.Request.Context(), application.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidCredentials):
			response.Unauthorized(c, "Invalid email or password")
		default:
			response.InternalServerError(c, "Failed to authenticate")
		}
		return
	}

	response.OK(c, "Login successful", toTokenResponse(tokens))
}

// RefreshToken handles POST /api/v1/auth/refresh-token.
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
}

// Logout handles POST /api/v1/auth/logout.
func (h *AuthHandler) Logout(c *gin.Context) {
	var req LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	// err := h.svc.Logout(c.Request.Context(), application.LogoutInput{
	// 	RefreshToken: req.RefreshToken,
	// })
	// if err != nil {
	// 	response.InternalServerError(c, "Failed to logout")
	// 	return
	// }
	response.OK(c, "Logout successful", nil)
}

func toTokenResponse(t *application.TokenOutput) TokenResponse {
	if t == nil {
		return TokenResponse{}
	}
	return TokenResponse{
		AccessToken:  t.AccessToken,
		RefreshToken: t.RefreshToken,
		TokenType:    t.TokenType,
		ExpiresAt:    t.ExpiresAt,
		User: UserResponse{
			ID:       t.User.ID.String(),
			Email:    t.User.Email,
			FullName: t.User.FullName,
			Role:     t.User.Role,
		},
	}
}
