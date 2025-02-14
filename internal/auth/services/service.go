package services

import (
	"common/pkg/jwt"
	"common/pkg/logger"
	"common/types"
	"context"
	"errors"
	"logify/internal/auth/dto"
	"logify/internal/user/models"
	"logify/internal/user/services"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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
		FirstName:  types.FromString(req.FirstName),
		MiddleName: types.FromString(req.MiddleName),
		LastName:   types.FromString(req.LastName),
		Email:      req.Email,
		Password:   s.hashPassword(req.Password),
	}
	newUser, err := s.userSrv.Create(user)
	if err != nil {
		return nil, err
	}

	token, err := s.jwt.GenerateToken(map[string]interface{}{
		"user_id":   newUser.ID.String(),
		"tenant_id": newUser.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	resp := &dto.RegisterResponse{
		UserID:     newUser.ID.String(),
		FirstName:  newUser.FirstName.GetValue(),
		MiddleName: newUser.MiddleName.GetValue(),
		LastName:   newUser.LastName.GetValue(),
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

	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	token, err := s.jwt.GenerateToken(map[string]interface{}{
		"user_id":   user.ID.String(),
		"tenant_id": user.TenantID.String(),
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
