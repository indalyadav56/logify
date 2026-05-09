package application

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/indalyadav56/logify/apps/backend/internal/user/application"
	"github.com/indalyadav56/logify/apps/backend/internal/user/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/config"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

// LoginInput holds the data required for authentication.
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RegisterInput holds the data required for user registration.
type RegisterInput struct {
	Email    string `json:"email" validate:"required,email"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Password string `json:"password" validate:"required,min=8,max=72"`
}

// RefreshInput holds the refresh token.
type RefreshInput struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// TokenOutput holds the generated tokens.
type TokenOutput struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

// AuthService defines the authentication operations.
type AuthService interface {
	Login(ctx context.Context, input LoginInput) (*TokenOutput, error)
	Register(ctx context.Context, input RegisterInput) (*TokenOutput, error)
	RefreshToken(ctx context.Context, input RefreshInput) (*TokenOutput, error)
}

type authService struct {
	userService application.UserService
	jwtConfig   config.JWTConfig
	logger      *zap.Logger
}

// NewAuthService creates a new AuthService.
func NewAuthService(userService application.UserService, jwtConfig config.JWTConfig, logger *zap.Logger) AuthService {
	return &authService{
		userService: userService,
		jwtConfig:   jwtConfig,
		logger:      logger.Named("auth_service"),
	}
}

func (s *authService) Login(ctx context.Context, input LoginInput) (*TokenOutput, error) {
	user, err := s.userService.GetUserByEmail(ctx, input.Email)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return nil, domain.ErrInvalidCredentials
		}
		s.logger.Error("failed to get user by email", zap.Error(err))
		return nil, err
	}

	if !user.IsActive {
		return nil, domain.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		s.logger.Error("failed to generate tokens", zap.Error(err))
		return nil, err
	}

	s.logger.Info("user logged in", zap.String("user_id", user.ID.String()))

	return tokens, nil
}

func (s *authService) Register(ctx context.Context, input RegisterInput) (*TokenOutput, error) {
	createInput := application.CreateUserInput{
		Email:    input.Email,
		FullName: input.FullName,
		Password: input.Password,
	}

	userOutput, err := s.userService.CreateUser(ctx, createInput)
	if err != nil {
		return nil, err
	}

	// Build a minimal domain user for token generation.
	user := &domain.User{
		ID:    userOutput.ID,
		Email: userOutput.Email,
		Role:  userOutput.Role,
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		s.logger.Error("failed to generate tokens after registration", zap.Error(err))
		return nil, err
	}

	s.logger.Info("user registered", zap.String("user_id", userOutput.ID.String()))

	return tokens, nil
}

func (s *authService) RefreshToken(ctx context.Context, input RefreshInput) (*TokenOutput, error) {
	claims := &middleware.Claims{}
	token, err := jwt.ParseWithClaims(input.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.jwtConfig.Secret), nil
	})

	if err != nil || !token.Valid {
		return nil, domain.ErrInvalidCredentials
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	userOutput, err := s.userService.GetUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		ID:    userOutput.ID,
		Email: userOutput.Email,
		Role:  userOutput.Role,
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		s.logger.Error("failed to generate tokens on refresh", zap.Error(err))
		return nil, err
	}

	return tokens, nil
}

// generateTokens creates a new access and refresh token pair.
func (s *authService) generateTokens(user *domain.User) (*TokenOutput, error) {
	now := time.Now()

	// Access token
	accessClaims := &middleware.Claims{
		UserID: user.ID.String(),
		Email:  user.Email,
		Role:   string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.jwtConfig.Issuer,
			Subject:   user.ID.String(),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.jwtConfig.AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        uuid.New().String(),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(s.jwtConfig.Secret))
	if err != nil {
		return nil, err
	}

	// Refresh token
	refreshClaims := &middleware.Claims{
		UserID: user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.jwtConfig.Issuer,
			Subject:   user.ID.String(),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.jwtConfig.RefreshTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        uuid.New().String(),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtConfig.Secret))
	if err != nil {
		return nil, err
	}

	return &TokenOutput{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		TokenType:    "Bearer",
		ExpiresIn:    int64(s.jwtConfig.AccessTokenTTL.Seconds()),
	}, nil
}
