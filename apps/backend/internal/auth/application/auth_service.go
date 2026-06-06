package application

import (
	"context"
	"errors"
	"net"
	"time"

	"go.uber.org/zap"

	"github.com/google/uuid"
	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	userApp "github.com/indalyadav56/logify/apps/backend/internal/user/application"
	userDomain "github.com/indalyadav56/logify/apps/backend/internal/user/domain"
)

type AuthService interface {
	Register(ctx context.Context, input RegisterInput) (*TokenOutput, error)
	Login(ctx context.Context, input LoginInput) (*TokenOutput, error)
}

type authService struct {
	logger      *zap.Logger
	tokens      *TokenIssuer
	tokenRepo   domain.RefreshTokenRepository
	sessionRepo domain.SessionRepository
	userSrv     userApp.UserService
	now         func() time.Time
}

func NewAuthService(
	logger *zap.Logger,
	tokens *TokenIssuer,
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

	tokens, err := s.issueAndPersist(ctx, user, session.ID)
	if err != nil {
		return nil, err
	}

	s.logger.Info("user registered", zap.String("user_id", user.ID.String()))
	return tokens, nil
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

	tokens, err := s.issueAndPersist(ctx, user, uuid.New())
	if err != nil {
		return nil, err
	}

	s.logger.Info("user logged in", zap.String("user_id", user.ID.String()))
	return tokens, nil
}

func (s *authService) issueAndPersist(ctx context.Context, user *userApp.UserOutput, sessionID uuid.UUID) (*TokenOutput, error) {
	role := string(user.Role)
	if role == "" {
		role = string(userDomain.RoleMember)
	}

	tokens, plainRefresh, err := s.tokens.Issue(user.ID, user.Email, role)
	if err != nil {
		s.logger.Error("issue tokens failed", zap.String("user_id", user.ID.String()), zap.Error(err))
		return nil, err
	}

	rt := domain.NewRefreshToken(user.ID, sessionID, plainRefresh, s.now().Add(s.tokens.RefreshTokenTTL()))
	if err := s.tokenRepo.Create(ctx, rt); err != nil {
		s.logger.Error("persist refresh token failed", zap.String("user_id", user.ID.String()), zap.Error(err))
		return nil, err
	}

	tokens.User = AuthUserView{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     role,
	}
	return tokens, nil
}
