package application

import (
	"context"
	"errors"
	"time"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
)

// AuthService is the application-facing entry point for the auth bounded
// context. Implementations must be safe for concurrent use.
type AuthService interface {
	// Register creates a new user account and returns a fresh token pair.
	Register(ctx context.Context, input RegisterInput) (*TokenOutput, error)

	// Login verifies credentials and returns a fresh token pair.
	Login(ctx context.Context, input LoginInput) (*TokenOutput, error)
}

type authService struct {
	logger    *zap.Logger
	issuer    *TokenIssuer
	tokenRepo domain.RefreshTokenRepository
	users     UserLookupPort
	now       func() time.Time
}

// NewAuthService wires the auth service with its collaborators.
func NewAuthService(
	logger *zap.Logger,
	issuer *TokenIssuer,
	tokenRepo domain.RefreshTokenRepository,
	users UserLookupPort,
) AuthService {
	return &authService{
		logger:    logger.Named("auth_service"),
		issuer:    issuer,
		tokenRepo: tokenRepo,
		users:     users,
		now:       time.Now,
	}
}

func (s *authService) Register(ctx context.Context, input RegisterInput) (*TokenOutput, error) {
	user, err := s.users.CreateUser(ctx, CreateUserInput{
		FullName: input.FullName,
		Email:    input.Email,
		Password: input.Password,
	})
	if err != nil {
		if errors.Is(err, domain.ErrUserAlreadyExists) {
			return nil, err
		}
		s.logger.Error("register: create user failed", zap.String("email", input.Email), zap.Error(err))
		return nil, err
	}

	tokens, err := s.issueAndPersist(ctx, user)
	if err != nil {
		return nil, err
	}

	s.logger.Info("user registered", zap.String("user_id", user.ID.String()))
	return tokens, nil
}

func (s *authService) Login(ctx context.Context, input LoginInput) (*TokenOutput, error) {
	record, err := s.users.FindByEmail(ctx, input.Email)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidCredentials) {
			return nil, domain.ErrInvalidCredentials
		}
		s.logger.Error("login: lookup user failed", zap.String("email", input.Email), zap.Error(err))
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(record.PasswordHash), []byte(input.Password)); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	tokens, err := s.issueAndPersist(ctx, &record.UserOutput)
	if err != nil {
		return nil, err
	}

	s.logger.Info("user logged in", zap.String("user_id", record.ID.String()))
	return tokens, nil
}

// issueAndPersist mints a token pair and stores the refresh token hash.
func (s *authService) issueAndPersist(ctx context.Context, user *UserOutput) (*TokenOutput, error) {
	tokens, plainRefresh, err := s.issuer.Issue(user.ID, user.Email, user.Role)
	if err != nil {
		s.logger.Error("issue tokens failed", zap.String("user_id", user.ID.String()), zap.Error(err))
		return nil, err
	}

	rt := domain.NewRefreshToken(user.ID, plainRefresh, s.now().Add(s.issuer.RefreshTokenTTL()))
	if err := s.tokenRepo.Create(ctx, rt); err != nil {
		s.logger.Error("persist refresh token failed", zap.String("user_id", user.ID.String()), zap.Error(err))
		return nil, err
	}

	tokens.User = AuthUserView{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     user.Role,
	}
	return tokens, nil
}
