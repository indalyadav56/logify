package services

import (
	"common/pkg/logger"
	"logify/internal/alert/models"
	"logify/internal/alert/repository"
)

type AlertService interface {
	Create(alert *models.Alert) (*models.Alert, error)
	GetByID(id string) (*models.Alert, error)
	Update(id string, alert *models.Alert) (*models.Alert, error)
	Delete(id string) error
	// GetAll() ([]*models.Alert, error)
	// Search(query string) ([]*models.Alert, error)

}

type alertService struct {
	alertRepo repository.AlertRepository
	log       logger.Logger
}

func NewAlertService(repo repository.AlertRepository, log logger.Logger) *alertService {
	return &alertService{
		alertRepo: repo,
		log:       log,
	}
}

// Create creates a new alert
func (s *alertService) Create(alert *models.Alert) (*models.Alert, error) {
	return s.alertRepo.Insert(alert)
}

// GetByID retrieves a alert by its ID
func (s *alertService) GetByID(id string) (*models.Alert, error) {
	return s.alertRepo.FindByID(id)
}

// Update updates an existing alert by its ID
func (s *alertService) Update(id string, alert *models.Alert) (*models.Alert, error) {
	// Alert, err := s.alertRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingAlert.Field1 = alert.Field1
	// existingAlert.Field2 = alert.Field2

	// return s.alertRepo.Update(id, existingAlert)
	return nil, nil
}

// Delete removes a alert by its ID
func (s *alertService) Delete(id string) error {
	return s.alertRepo.Delete(id)
}

// // GetAll retrieves all alert records
// func (s *alertService) GetAll() ([]*models.Alert, error) {
// 	return s.alertRepo.FindAll()
// }

// // Search allows searching for alert entities based on a query
// func (s *alertService) Search(query string) ([]*models.Alert, error) {
// 	return s.alertRepo.Search(query)
// }
