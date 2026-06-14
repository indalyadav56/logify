package grpc

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/indalyadav56/logify/services/project-service/internal/application/services"
	pb "github.com/indalyadav56/logify/services/project-service/internal/transport/grpc/proto"
)

type projectApiKeyGrpcHandler struct {
	pb.UnimplementedProjectAPIKeyServiceServer

	service services.ApiKeyService
}

func NewProjectApiKeyGrpcHandler(srv services.ApiKeyService) *projectApiKeyGrpcHandler {
	return &projectApiKeyGrpcHandler{
		service: srv,
	}
}

func (h *projectApiKeyGrpcHandler) GetApiDataByKey(c context.Context, req *pb.Request) (*pb.Response, error) {
	slog.Info("Received request to get API key data", "key", req.Key)
	res, err := h.service.GetApiKeyDataByKey(req.Key)
	if err != nil {
		slog.Error("failed to get API key data", "error", err.Error())
		return nil, fmt.Errorf("failed to get API key data: %w", err)
	}

	fmt.Println("API Key Data:", res)

	return &pb.Response{
		ProjectId: res.ProjectID.String(),
		UserId:    res.UserID,
		TanentId:  res.TenantID,
	}, nil
}
