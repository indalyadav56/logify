package services

import (
	"common/pkg/logger"
	"logify/internal/analytics/models"
	"logify/internal/analytics/repository"
)

type AnalyticsService interface {
	Create(analytics *models.Analytics) (*models.Analytics, error)
	GetByID(id string) (*models.Analytics, error)
	Update(id string, analytics *models.Analytics) (*models.Analytics, error)
	Delete(id string) error
	// GetAll() ([]*models.Analytics, error)
	// Search(query string) ([]*models.Analytics, error)

}

type analyticsService struct {
	analyticsRepo repository.AnalyticsRepository
	log           logger.Logger
}

func NewAnalyticsService(repo repository.AnalyticsRepository, log logger.Logger) *analyticsService {
	return &analyticsService{
		analyticsRepo: repo,
		log:           log,
	}
}

// Create creates a new analytics
func (s *analyticsService) Create(analytics *models.Analytics) (*models.Analytics, error) {
	return s.analyticsRepo.Insert(analytics)
}

// GetByID retrieves a analytics by its ID
func (s *analyticsService) GetByID(id string) (*models.Analytics, error) {
	return s.analyticsRepo.FindByID(id)
}

// Update updates an existing analytics by its ID
func (s *analyticsService) Update(id string, analytics *models.Analytics) (*models.Analytics, error) {
	// Analytics, err := s.analyticsRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingAnalytics.Field1 = analytics.Field1
	// existingAnalytics.Field2 = analytics.Field2

	// return s.analyticsRepo.Update(id, existingAnalytics)
	return nil, nil
}

// Delete removes a analytics by its ID
func (s *analyticsService) Delete(id string) error {
	return s.analyticsRepo.Delete(id)
}

// // GetAll retrieves all analytics records
// func (s *analyticsService) GetAll() ([]*models.Analytics, error) {
// 	return s.analyticsRepo.FindAll()
// }

// // Search allows searching for analytics entities based on a query
// func (s *analyticsService) Search(query string) ([]*models.Analytics, error) {
// 	return s.analyticsRepo.Search(query)
// }
