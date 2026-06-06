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

// Register handles user registration.
// @Summary      Register a new user
// @Description  Create a new user account and return JWT access and refresh tokens.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      RegisterRequest  true  "Registration request details"
// @Success      201      {object}  response.APIResponse{data=TokenResponse} "Successfully registered and authenticated"
// @Failure      400      {object}  response.APIResponse{error=string} "Invalid JSON or missing fields"
// @Failure      409      {object}  response.APIResponse{error=string} "Email already in use"
// @Failure      500      {object}  response.APIResponse{error=string} "Internal server error"
// @Router       /v1/auth/register [post]
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

// Login handles user authentication.
// @Summary      Login a user
// @Description  Authenticate user credentials and return JWT tokens.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      LoginRequest  true  "Login credentials"
// @Success      200      {object}  response.APIResponse{data=TokenResponse} "Successfully authenticated"
// @Failure      400      {object}  response.APIResponse{error=string} "Invalid input format"
// @Failure      401      {object}  response.APIResponse{error=string} "Invalid credentials"
// @Failure      500      {object}  response.APIResponse{error=string} "Internal server error"
// @Router       /v1/auth/login [post]
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

// RefreshToken handles refreshing JWT access tokens.
// @Summary      Refresh token
// @Description  Generate a new access token using a valid refresh token.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      RefreshTokenRequest  true  "Refresh token payload"
// @Success      200      {object}  response.APIResponse{data=TokenResponse} "Token refreshed successfully"
// @Failure      400      {object}  response.APIResponse{error=string} "Invalid request body"
// @Router       /v1/auth/refresh-token [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
}

// Logout invalidates a user session.
// @Summary      Logout a user
// @Description  Revoke the refresh token and clear user session.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      LogoutRequest  true  "Logout payload"
// @Success      200      {object}  response.APIResponse "Logged out successfully"
// @Failure      400      {object}  response.APIResponse{error=string} "Invalid request body"
// @Router       /v1/auth/logout [post]
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
		User: UserResponse{
			ID:       t.User.ID.String(),
			Email:    t.User.Email,
			FullName: t.User.FullName,
			Role:     t.User.Role,
		},
	}
}
