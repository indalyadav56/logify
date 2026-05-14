package application

import (
	"context"

	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	"go.uber.org/zap"
)

type AuthService interface {
	Login(ctx context.Context) (any, error)
}

type authService struct {
	logger    *zap.Logger
	tokenRepo domain.RefreshTokenRepository
}

func NewAuthService(logger *zap.Logger) AuthService {
	return &authService{
		logger: logger.Named("auth_service"),
	}
}

func (s *authService) Login(ctx context.Context) (any, error) {
	s.logger.Info("user logged in", zap.String("user_id", ""))
	return nil, nil
}

// func (s *authService) Register(ctx context.Context, input RegisterInput) (*TokenOutput, error) {
// 	createInput := application.CreateUserInput{
// 		Email:    input.Email,
// 		FullName: input.FullName,
// 		Password: input.Password,
// 	}

// 	userOutput, err := s.userService.CreateUser(ctx, createInput)
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Build a minimal domain user for token generation.
// 	user := &domain.User{
// 		ID:    userOutput.ID,
// 		Email: userOutput.Email,
// 	}

// 	tokens, err := s.generateTokens(user)
// 	if err != nil {
// 		s.logger.Error("failed to generate tokens after registration", zap.Error(err))
// 		return nil, err
// 	}

// 	s.logger.Info("user registered", zap.String("user_id", userOutput.ID.String()))

// 	return tokens, nil
// }

// func (s *authService) RefreshToken(ctx context.Context, input RefreshInput) (*TokenOutput, error) {
// 	claims := &middleware.Claims{}
// 	token, err := jwt.ParseWithClaims(input.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
// 		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return nil, errors.New("unexpected signing method")
// 		}
// 		return []byte(s.jwtConfig.Secret), nil
// 	})

// 	if err != nil || !token.Valid {
// 		return nil, domain.ErrInvalidCredentials
// 	}

// 	userID, err := uuid.Parse(claims.UserID)
// 	if err != nil {
// 		return nil, domain.ErrInvalidCredentials
// 	}

// 	userOutput, err := s.userService.GetUser(ctx, userID)
// 	if err != nil {
// 		return nil, err
// 	}

// 	user := &domain.User{
// 		ID:    userOutput.ID,
// 		Email: userOutput.Email,
// 		Role:  userOutput.Role,
// 	}

// 	tokens, err := s.generateTokens(user)
// 	if err != nil {
// 		s.logger.Error("failed to generate tokens on refresh", zap.Error(err))
// 		return nil, err
// 	}

// 	return tokens, nil
// }

// // generateTokens creates a new access and refresh token pair.
// func (s *authService) generateTokens(user *domain.User) (*TokenOutput, error) {
// 	now := time.Now()

// 	// Access token
// 	accessClaims := &middleware.Claims{
// 		UserID: user.ID.String(),
// 		Email:  user.Email,
// 		RegisteredClaims: jwt.RegisteredClaims{
// 			Issuer:    s.jwtConfig.Issuer,
// 			Subject:   user.ID.String(),
// 			ExpiresAt: jwt.NewNumericDate(now.Add(s.jwtConfig.AccessTokenTTL)),
// 			IssuedAt:  jwt.NewNumericDate(now),
// 			ID:        uuid.New().String(),
// 		},
// 	}

// 	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
// 	accessTokenString, err := accessToken.SignedString([]byte(s.jwtConfig.Secret))
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Refresh token
// 	refreshClaims := &middleware.Claims{
// 		UserID: user.ID.String(),
// 		RegisteredClaims: jwt.RegisteredClaims{
// 			Issuer:    s.jwtConfig.Issuer,
// 			Subject:   user.ID.String(),
// 			ExpiresAt: jwt.NewNumericDate(now.Add(s.jwtConfig.RefreshTokenTTL)),
// 			IssuedAt:  jwt.NewNumericDate(now),
// 			ID:        uuid.New().String(),
// 		},
// 	}

// 	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
// 	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtConfig.Secret))
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &TokenOutput{
// 		AccessToken:  accessTokenString,
// 		RefreshToken: refreshTokenString,
// 		TokenType:    "Bearer",
// 		ExpiresIn:    int64(s.jwtConfig.AccessTokenTTL.Seconds()),
// 	}, nil
// }
