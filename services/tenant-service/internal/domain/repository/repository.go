package repository

import "github.com/indalyadav56/logify/services/tenant-service/internal/domain/entity"

type TenantRepository interface {
	InsertTenant(t *entity.Tenant) error
	FindByID(id string) (*entity.Tenant, error)
	FindBySlug(slug string) (*entity.Tenant, error)
	ListTenants(limit, offset int) ([]*entity.Tenant, error)
}
