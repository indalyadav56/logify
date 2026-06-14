package grpc

import (
	"context"

	"github.com/indalyadav56/logify/services/tenant-service/internal/application/services"
	"github.com/indalyadav56/logify/services/tenant-service/internal/transport/http/v1/dto"
	pb "github.com/indalyadav56/logify/services/tenant-service/internal/transport/grpc/proto"
)

type TenantGrpcHandler struct {
	pb.UnimplementedTenantServiceServer
	svc services.TenantService
}

func NewTenantGrpcHandler(svc services.TenantService) *TenantGrpcHandler {
	return &TenantGrpcHandler{svc: svc}
}

func (h *TenantGrpcHandler) CreateTenant(ctx context.Context, req *pb.CreateTenantRequest) (*pb.CreateTenantResponse, error) {
	t, err := h.svc.CreateTenant(&dto.CreateTenantRequest{
		Name: req.GetName(),
		Slug: req.GetSlug(),
		Plan: req.GetPlan(),
	})
	if err != nil {
		return nil, err
	}
	return &pb.CreateTenantResponse{
		Id:   t.ID.String(),
		Name: t.Name,
		Slug: t.Slug,
	}, nil
}

func (h *TenantGrpcHandler) GetTenantByID(ctx context.Context, req *pb.GetTenantByIDRequest) (*pb.GetTenantByIDResponse, error) {
	t, err := h.svc.GetTenantByID(req.GetId())
	if err != nil {
		return nil, err
	}
	return &pb.GetTenantByIDResponse{
		Id:   t.ID.String(),
		Name: t.Name,
		Slug: t.Slug,
		Plan: t.Plan,
	}, nil
}

func (h *TenantGrpcHandler) ListTenants(ctx context.Context, req *pb.ListTenantsRequest) (*pb.ListTenantsResponse, error) {
	tenants, err := h.svc.ListTenants(int(req.GetLimit()), int(req.GetOffset()))
	if err != nil {
		return nil, err
	}
	out := make([]*pb.GetTenantByIDResponse, 0, len(tenants))
	for _, t := range tenants {
		out = append(out, &pb.GetTenantByIDResponse{
			Id:   t.ID.String(),
			Name: t.Name,
			Slug: t.Slug,
			Plan: t.Plan,
		})
	}
	return &pb.ListTenantsResponse{Tenants: out}, nil
}
