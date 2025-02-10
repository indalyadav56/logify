package services

import (
	"common/pkg/logger"
	"logify/internal/metrics/models"
	"logify/internal/metrics/repository"
)

type MetricsService interface {
	Create(metrics *models.Metrics) (*models.Metrics, error)
	GetByID(id string) (*models.Metrics, error)
	Update(id string, metrics *models.Metrics) (*models.Metrics, error)
	Delete(id string) error
	// GetAll() ([]*models.Metrics, error)
	// Search(query string) ([]*models.Metrics, error)

}

type metricsService struct {
	metricsRepo repository.MetricsRepository
	log         logger.Logger
}

func NewMetricsService(repo repository.MetricsRepository, log logger.Logger) *metricsService {
	return &metricsService{
		metricsRepo: repo,
		log:         log,
	}
}

// Create creates a new metrics
func (s *metricsService) Create(metrics *models.Metrics) (*models.Metrics, error) {
	return s.metricsRepo.Insert(metrics)
}

// GetByID retrieves a metrics by its ID
func (s *metricsService) GetByID(id string) (*models.Metrics, error) {
	return s.metricsRepo.FindByID(id)
}

// Update updates an existing metrics by its ID
func (s *metricsService) Update(id string, metrics *models.Metrics) (*models.Metrics, error) {
	// Metrics, err := s.metricsRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingMetrics.Field1 = metrics.Field1
	// existingMetrics.Field2 = metrics.Field2

	// return s.metricsRepo.Update(id, existingMetrics)
	return nil, nil
}

// Delete removes a metrics by its ID
func (s *metricsService) Delete(id string) error {
	return s.metricsRepo.Delete(id)
}

// // GetAll retrieves all metrics records
// func (s *metricsService) GetAll() ([]*models.Metrics, error) {
// 	return s.metricsRepo.FindAll()
// }

// // Search allows searching for metrics entities based on a query
// func (s *metricsService) Search(query string) ([]*models.Metrics, error) {
// 	return s.metricsRepo.Search(query)
// }
