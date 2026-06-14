package application

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/indalyadav56/logify/services/auth-service/config"
	pb "github.com/indalyadav56/logify/services/auth-service/internal/transport/grpc/proto"
	"github.com/indalyadav56/logify/services/auth-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/auth-service/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, req *dto.RegisterRequest) (interface{}, error)
	Login(ctx context.Context, req *dto.LoginRequest) (interface{}, error)
}

type authService struct {
	jwt    jwt.JWT
	cfg    *config.Config
	client pb.UserServiceClient
}

func NewAuthService(jwt jwt.JWT, cfg *config.Config, client pb.UserServiceClient) *authService {
	return &authService{jwt: jwt, cfg: cfg, client: client}
}

func (s *authService) Register(ctx context.Context, req *dto.RegisterRequest) (interface{}, error) {
	res, err := s.client.CreateUser(ctx, &pb.CreateUserRequest{
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
		Email:      req.Email,
		Password:   s.hashPassword(req.Password),
	})
	if err != nil {
		slog.Error("failed to create user", "error", err)
		return nil, err
	}

	token, err := s.jwt.GenerateToken(map[string]interface{}{
		"user_id":   res.Id,
		"tenant_id": res.TenantId,
	})
	if err != nil {
		return nil, err
	}

	resp := &dto.RegisterResponse{
		Email: req.Email,
		Token: dto.Token{
			AccessToken: token,
		},
	}
	return resp, nil
}

func (s *authService) Login(ctx context.Context, req *dto.LoginRequest) (interface{}, error) {
	resp, err := s.client.GetUserByEmail(ctx, &pb.GetUserByEmailRequest{
		Email: req.Email,
	})
	if err != nil {
		slog.Error("failed to get user by email", "error", err)
		return nil, err
	}

	fmt.Println("User found:", resp)

	// if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
	// 	return nil, errors.New("invalid credentials")
	// }

	token, err := s.jwt.GenerateToken(map[string]interface{}{
		"user_id":   resp.Id,
		"tenant_id": resp.TenantId,
	})
	if err != nil {
		return nil, err
	}

	res := &dto.LoginResponse{
		UserID: resp.Id,
		Email:  resp.Email,
		Token: dto.Token{
			AccessToken: token,
		},
	}
	return res, nil
}

func (s *authService) RefreshToken(ctx context.Context, req *dto.RefreshTokenRequest) (interface{}, error) {
	return nil, nil
}

func (s *authService) hashPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		slog.Error("failed to hash password", "error", err)
		return ""
	}
	return string(hashedPassword)
}
