package application

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net"
	"time"

	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	userApp "github.com/indalyadav56/logify/apps/backend/internal/user/application"
	userDomain "github.com/indalyadav56/logify/apps/backend/internal/user/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

type AuthService interface {
	Register(ctx context.Context, input RegisterInput) (*TokenOutput, error)
	Login(ctx context.Context, input LoginInput) (*TokenOutput, error)
}

type authService struct {
	logger      *zap.Logger
	tokens      *jwt.JWT
	tokenRepo   domain.RefreshTokenRepository
	sessionRepo domain.SessionRepository
	userSrv     userApp.UserService
	now         func() time.Time
}

func NewAuthService(
	logger *zap.Logger,
	tokens *jwt.JWT,
	tokenRepo domain.RefreshTokenRepository,
	sessionRepo domain.SessionRepository,
	userSrv userApp.UserService,
) AuthService {
	return &authService{
		logger:      logger.Named("auth_service"),
		tokens:      tokens,
		tokenRepo:   tokenRepo,
		sessionRepo: sessionRepo,
		userSrv:     userSrv,
		now:         time.Now,
	}
}

func (s *authService) Register(ctx context.Context, input RegisterInput) (*TokenOutput, error) {
	user, err := s.userSrv.CreateUser(ctx, userApp.CreateUserInput{
		FullName: input.FullName,
		Email:    input.Email,
		Password: input.Password,
	})
	if err != nil {
		if errors.Is(err, userDomain.ErrUserAlreadyExists) {
			return nil, domain.ErrUserAlreadyExists
		}
		s.logger.Error("register: create user failed", zap.String("email", input.Email), zap.Error(err))
		return nil, err
	}

	// session
	session := &domain.Session{
		UserID:    user.ID,
		UserAgent: "test-agent",
		IPAddress: net.IPv4(0, 0, 0, 0),
	}
	err = s.sessionRepo.Create(ctx, session)
	if err != nil {
		return nil, err
	}

	output := &TokenOutput{}
	output.TokenType = "Bearer"

	accessToken, err := s.tokens.GenerateToken(map[string]interface{}{
		"sub":       user.ID.String(),
		"tenant_id": user.ID.String(), // placeholder until a real tenant model exists
	})
	output.AccessToken = accessToken

	plainRefreshToken, err := s.generateRandomToken()
	if err != nil {
		return nil, fmt.Errorf("generate refresh token: %w", err)
	}
	output.RefreshToken = plainRefreshToken

	rt := domain.NewRefreshToken(user.ID, session.ID, plainRefreshToken)
	if err := s.tokenRepo.Create(ctx, rt); err != nil {
		s.logger.Error("persist refresh token failed", zap.String("user_id", user.ID.String()), zap.Error(err))
		return nil, err
	}

	s.logger.Info("user registered", zap.String("user_id", user.ID.String()))
	return output, nil
}

func (s *authService) Login(ctx context.Context, input LoginInput) (*TokenOutput, error) {
	user, err := s.userSrv.Authenticate(ctx, input.Email, input.Password)
	if err != nil {
		if errors.Is(err, userDomain.ErrInvalidCredentials) {
			return nil, domain.ErrInvalidCredentials
		}
		s.logger.Error("login: authenticate failed", zap.String("email", input.Email), zap.Error(err))
		return nil, err
	}

	output := &TokenOutput{}

	accessToken, err := s.tokens.GenerateToken(map[string]interface{}{
		"sub":       user.ID.String(),
		"tenant_id": user.ID.String(), // placeholder until a real tenant model exists
	})
	output.AccessToken = accessToken
	output.TokenType = "Bearer"

	plainRefreshToken, err := s.generateRandomToken()
	if err != nil {
		return nil, fmt.Errorf("generate refresh token: %w", err)
	}
	output.RefreshToken = plainRefreshToken

	// rt := domain.NewRefreshToken(user.ID, session.ID, plainRefreshToken)
	// if err := s.tokenRepo.Create(ctx, rt); err != nil {
	// 	s.logger.Error("persist refresh token failed", zap.String("user_id", user.ID.String()), zap.Error(err))
	// 	return nil, err
	// }

	s.logger.Info("user logged in", zap.String("user_id", user.ID.String()))
	return output, nil
}

func (s *authService) generateRandomToken() (string, error) {
	b := make([]byte, 16) // 128 bits
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
