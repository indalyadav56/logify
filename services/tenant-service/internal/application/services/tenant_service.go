package services

import (
	"log/slog"

	"github.com/indalyadav56/logify/services/tenant-service/internal/domain/entity"
	"github.com/indalyadav56/logify/services/tenant-service/internal/domain/repository"
	"github.com/indalyadav56/logify/services/tenant-service/internal/transport/http/v1/dto"
)

type TenantService interface {
	CreateTenant(req *dto.CreateTenantRequest) (*entity.Tenant, error)
	GetTenantByID(id string) (*entity.Tenant, error)
	ListTenants(limit, offset int) ([]*entity.Tenant, error)
}

type tenantService struct {
	repo repository.TenantRepository
}

func NewTenantService(repo repository.TenantRepository) TenantService {
	return &tenantService{repo: repo}
}

func (s *tenantService) CreateTenant(req *dto.CreateTenantRequest) (*entity.Tenant, error) {
	t := &entity.Tenant{
		Name: req.Name,
		Slug: req.Slug,
		Plan: req.Plan,
	}

	if err := s.repo.InsertTenant(t); err != nil {
		slog.Error(err.Error())
		return nil, err
	}

	return t, nil
}

func (s *tenantService) GetTenantByID(id string) (*entity.Tenant, error) {
	return s.repo.FindByID(id)
}

func (s *tenantService) ListTenants(limit, offset int) ([]*entity.Tenant, error) {
	return s.repo.ListTenants(limit, offset)
}
