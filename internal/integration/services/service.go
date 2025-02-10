package services

import (
	"common/pkg/logger"
	"logify/internal/integration/models"
	"logify/internal/integration/repository"
)

type IntegrationService interface {
	Create(integration *models.Integration) (*models.Integration, error)
	GetByID(id string) (*models.Integration, error)
	Update(id string, integration *models.Integration) (*models.Integration, error)
	Delete(id string) error
	// GetAll() ([]*models.Integration, error)
	// Search(query string) ([]*models.Integration, error)

}

type integrationService struct {
	integrationRepo repository.IntegrationRepository
	log             logger.Logger
}

func NewIntegrationService(repo repository.IntegrationRepository, log logger.Logger) *integrationService {
	return &integrationService{
		integrationRepo: repo,
		log:             log,
	}
}

// Create creates a new integration
func (s *integrationService) Create(integration *models.Integration) (*models.Integration, error) {
	return s.integrationRepo.Insert(integration)
}

// GetByID retrieves a integration by its ID
func (s *integrationService) GetByID(id string) (*models.Integration, error) {
	return s.integrationRepo.FindByID(id)
}

// Update updates an existing integration by its ID
func (s *integrationService) Update(id string, integration *models.Integration) (*models.Integration, error) {
	// Integration, err := s.integrationRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingIntegration.Field1 = integration.Field1
	// existingIntegration.Field2 = integration.Field2

	// return s.integrationRepo.Update(id, existingIntegration)
	return nil, nil
}

// Delete removes a integration by its ID
func (s *integrationService) Delete(id string) error {
	return s.integrationRepo.Delete(id)
}

// // GetAll retrieves all integration records
// func (s *integrationService) GetAll() ([]*models.Integration, error) {
// 	return s.integrationRepo.FindAll()
// }

// // Search allows searching for integration entities based on a query
// func (s *integrationService) Search(query string) ([]*models.Integration, error) {
// 	return s.integrationRepo.Search(query)
// }
