package grpc

import (
	"context"
	"log/slog"

	"github.com/indalyadav56/logify/services/project-service/internal/application/services"
	pb "github.com/indalyadav56/logify/services/project-service/internal/transport/grpc/proto"
)

type projectGrpcHandler struct {
	pb.UnimplementedProjectServiceServer
	service services.ProjectService
}

func NewProjectGrpcHandler(srv services.ProjectService) *projectGrpcHandler {
	return &projectGrpcHandler{
		service: srv,
	}
}

func (h *projectGrpcHandler) GetProjectIDs(c context.Context, req *pb.GetProjectIDsRequest) (*pb.GetProjectIDsResponse, error) {
	projects, err := h.service.GetProjectIDs(c, req.UserId)
	if err != nil {
		slog.Error("Error fetching project IDs", "error", err)
		return nil, err
	}

	return projects, nil
}
