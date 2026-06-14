package grpc

import (
	"context"
	"log/slog"

	"github.com/indalyadav56/logify/services/user-service/internal/application/services"
	userpb "github.com/indalyadav56/logify/services/user-service/internal/transport/grpc/proto"
	"github.com/indalyadav56/logify/services/user-service/internal/transport/http/v1/dto"
)

type UserGrpcHandler struct {
	userpb.UnimplementedUserServiceServer

	service services.UserService
}

func NewUserGrpcHandler(srv services.UserService) *UserGrpcHandler {
	return &UserGrpcHandler{
		service: srv,
	}
}

func (h *UserGrpcHandler) GetUserByEmail(ctx context.Context, req *userpb.GetUserByEmailRequest) (*userpb.GetUserByEmailResponse, error) {
	user, err := h.service.GetUserByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	return &userpb.GetUserByEmailResponse{
		Id:             user.ID.String(),
		Email:          user.Email,
		HashedPassword: user.Password,
		FirstName:      user.FirstName.String,
		TenantId:       user.TenantID.String(),
	}, nil
}

func (h *UserGrpcHandler) CreateUser(ctx context.Context, req *userpb.CreateUserRequest) (*userpb.CreateUserResponse, error) {
	slog.Info("Creating user", "email", req.Email, "first_name", req.FirstName, "last_name", req.LastName, "middle_name", req.MiddleName)
	user, err := h.service.CreateUser(&dto.CreateUserRequest{
		FirstName:  req.FirstName,
		MiddleName: req.MiddleName,
		LastName:   req.LastName,
		Email:      req.Email,
		Password:   req.Password,
	})
	if err != nil {
		return nil, err
	}

	return &userpb.CreateUserResponse{
		Id:       user.ID.String(),
		Email:    user.Email,
		TenantId: user.TenantID.String(),
	}, nil
}
