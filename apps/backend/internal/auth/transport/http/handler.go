package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/auth/application"
)

type AuthHandler struct {
	svc application.AuthService
}

func NewAuthHandler(service application.AuthService) *AuthHandler {
	return &AuthHandler{svc: service}
}

func (h *AuthHandler) Login(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

// 	tokens, err := h.service.Login(c.Request.Context(), input)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrInvalidCredentials) {
// 			response.Unauthorized(c, "Invalid email or password")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to authenticate")
// 		return
// 	}

// 	response.OK(c, "Login successful", tokens)
// }

// // Register handles POST /api/v1/auth/register
// func (h *authHandler) Register(c *gin.Context) {
// 	var input application.RegisterInput
// 	if !validator.ValidateRequest(c, &input) {
// 		return
// 	}

// 	tokens, err := h.service.Register(c.Request.Context(), input)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrUserAlreadyExists) {
// 			response.Conflict(c, "A user with this email already exists")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to register")
// 		return
// 	}

// 	response.Created(c, "Registration successful", tokens)
// }

// // RefreshToken handles POST /api/v1/auth/refresh
// func (h *authHandler) RefreshToken(c *gin.Context) {
// 	var input application.RefreshInput
// 	if !validator.ValidateRequest(c, &input) {
// 		return
// 	}

// 	tokens, err := h.service.RefreshToken(c.Request.Context(), input)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrInvalidCredentials) {
// 			response.Unauthorized(c, "Invalid or expired refresh token")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to refresh token")
// 		return
// 	}

// 	response.OK(c, "Token refreshed successfully", tokens)
// }

// // Logout handles POST /api/v1/auth/logout (Mock)
// func (h *authHandler) Logout(c *gin.Context) {
// 	// In a real implementation, you might invalidate the token in Redis.
// 	response.OK(c, "Logged out successfully (mock)", nil)
// }

// // ForgotPassword handles POST /api/v1/auth/forgot-password (Mock)
// func (h *authHandler) ForgotPassword(c *gin.Context) {
// 	response.OK(c, "Password reset email sent (mock)", nil)
// }

// // ResetPassword handles POST /api/v1/auth/reset-password (Mock)
// func (h *authHandler) ResetPassword(c *gin.Context) {
// 	response.OK(c, "Password has been reset successfully (mock)", nil)
// }

// // VerifyEmail handles POST /api/v1/auth/verify-email (Mock)
// func (h *authHandler) VerifyEmail(c *gin.Context) {
// 	response.OK(c, "Email verified successfully (mock)", nil)
// }

// // ResendVerification handles POST /api/v1/auth/resend-verification (Mock)
// func (h *authHandler) ResendVerification(c *gin.Context) {
// 	response.OK(c, "Verification email resent (mock)", nil)
// }
