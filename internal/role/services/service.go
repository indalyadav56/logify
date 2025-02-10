package services

import (
	"common/pkg/logger"
	"logify/internal/role/models"
	"logify/internal/role/repository"
)

type RoleService interface {
	Create(role *models.Role) (*models.Role, error)
	GetByID(id string) (*models.Role, error)
	Update(id string, role *models.Role) (*models.Role, error)
	Delete(id string) error
	// GetAll() ([]*models.Role, error)
	// Search(query string) ([]*models.Role, error)

}

type roleService struct {
	roleRepo repository.RoleRepository
	log      logger.Logger
}

func NewRoleService(repo repository.RoleRepository, log logger.Logger) *roleService {
	return &roleService{
		roleRepo: repo,
		log:      log,
	}
}

// Create creates a new role
func (s *roleService) Create(role *models.Role) (*models.Role, error) {
	return s.roleRepo.Insert(role)
}

// GetByID retrieves a role by its ID
func (s *roleService) GetByID(id string) (*models.Role, error) {
	return s.roleRepo.FindByID(id)
}

// Update updates an existing role by its ID
func (s *roleService) Update(id string, role *models.Role) (*models.Role, error) {
	// Role, err := s.roleRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingRole.Field1 = role.Field1
	// existingRole.Field2 = role.Field2

	// return s.roleRepo.Update(id, existingRole)
	return nil, nil
}

// Delete removes a role by its ID
func (s *roleService) Delete(id string) error {
	return s.roleRepo.Delete(id)
}

// // GetAll retrieves all role records
// func (s *roleService) GetAll() ([]*models.Role, error) {
// 	return s.roleRepo.FindAll()
// }

// // Search allows searching for role entities based on a query
// func (s *roleService) Search(query string) ([]*models.Role, error) {
// 	return s.roleRepo.Search(query)
// }
