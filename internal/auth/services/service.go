package services

import (
	"common/pkg/jwt"
	"common/pkg/logger"
	"context"
	"errors"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"logify/internal/auth/dto"
	"logify/internal/user/models"
	"logify/internal/user/services"
)

type AuthService interface {
	Register(ctx context.Context, req *dto.RegisterRequest) (interface{}, error)
	Login(ctx context.Context, req *dto.LoginRequest) (interface{}, error)
	RefreshToken(ctx context.Context, req *dto.RefreshTokenRequest) (interface{}, error)
}

type authService struct {
	log     logger.Logger
	jwt     jwt.JWT
	userSrv services.UserService
}

func NewAuthService(log logger.Logger, jwt jwt.JWT, userSrv services.UserService) *authService {
	return &authService{
		log:     log,
		jwt:     jwt,
		userSrv: userSrv,
	}
}

func (s *authService) Register(ctx context.Context, req *dto.RegisterRequest) (interface{}, error) {
	user := &models.User{
		ID:         uuid.New(),
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
		Email:      req.Email,
		Password:   s.hashPassword(req.Password),
	}
	newUser, err := s.userSrv.Create(user)
	if err != nil {
		return nil, err
	}

	token, err := s.jwt.GenerateToken(map[string]interface{}{
		"user_id": newUser.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	resp := &dto.RegisterResponse{
		UserID:     newUser.ID.String(),
		FirstName:  newUser.FirstName,
		MiddleName: newUser.MiddleName,
		LastName:   newUser.LastName,
		Email:      newUser.Email,
		Token: dto.Token{
			AccessToken: token,
		},
	}
	return resp, nil
}

func (s *authService) Login(ctx context.Context, req *dto.LoginRequest) (interface{}, error) {
	user, err := s.userSrv.GetByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	token, err := s.jwt.GenerateToken(map[string]interface{}{
		"user_id": user.ID,
	})
	if err != nil {
		return nil, err
	}

	resp := &dto.LoginResponse{
		UserID: user.ID.String(),
		Email:  user.Email,
		Token: dto.Token{
			AccessToken: token,
		},
	}
	return resp, nil
}

func (s *authService) RefreshToken(ctx context.Context, req *dto.RefreshTokenRequest) (interface{}, error) {
	return nil, nil
}

func (s *authService) hashPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		s.log.Error("failed to hash password", err)
		return ""
	}
	return string(hashedPassword)
}
