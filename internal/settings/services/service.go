package services

import (
	"common/pkg/logger"
	"logify/internal/settings/models"
	"logify/internal/settings/repository"
)

type SettingsService interface {
	Create(settings *models.Settings) (*models.Settings, error)
	GetByID(id string) (*models.Settings, error)
	Update(id string, settings *models.Settings) (*models.Settings, error)
	Delete(id string) error
	// GetAll() ([]*models.Settings, error)
	// Search(query string) ([]*models.Settings, error)

}

type settingsService struct {
	settingsRepo repository.SettingsRepository
	log          logger.Logger
}

func NewSettingsService(repo repository.SettingsRepository, log logger.Logger) *settingsService {
	return &settingsService{
		settingsRepo: repo,
		log:          log,
	}
}

// Create creates a new settings
func (s *settingsService) Create(settings *models.Settings) (*models.Settings, error) {
	return s.settingsRepo.Insert(settings)
}

// GetByID retrieves a settings by its ID
func (s *settingsService) GetByID(id string) (*models.Settings, error) {
	return s.settingsRepo.FindByID(id)
}

// Update updates an existing settings by its ID
func (s *settingsService) Update(id string, settings *models.Settings) (*models.Settings, error) {
	// Settings, err := s.settingsRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingSettings.Field1 = settings.Field1
	// existingSettings.Field2 = settings.Field2

	// return s.settingsRepo.Update(id, existingSettings)
	return nil, nil
}

// Delete removes a settings by its ID
func (s *settingsService) Delete(id string) error {
	return s.settingsRepo.Delete(id)
}

// // GetAll retrieves all settings records
// func (s *settingsService) GetAll() ([]*models.Settings, error) {
// 	return s.settingsRepo.FindAll()
// }

// // Search allows searching for settings entities based on a query
// func (s *settingsService) Search(query string) ([]*models.Settings, error) {
// 	return s.settingsRepo.Search(query)
// }
