package services

import (
	"common/pkg/logger"
	"logify/internal/report/models"
	"logify/internal/report/repository"
)

type ReportService interface {
	Create(report *models.Report) (*models.Report, error)
	GetByID(id string) (*models.Report, error)
	Update(id string, report *models.Report) (*models.Report, error)
	Delete(id string) error
	// GetAll() ([]*models.Report, error)
	// Search(query string) ([]*models.Report, error)

}

type reportService struct {
	reportRepo repository.ReportRepository
	log        logger.Logger
}

func NewReportService(repo repository.ReportRepository, log logger.Logger) *reportService {
	return &reportService{
		reportRepo: repo,
		log:        log,
	}
}

// Create creates a new report
func (s *reportService) Create(report *models.Report) (*models.Report, error) {
	return s.reportRepo.Insert(report)
}

// GetByID retrieves a report by its ID
func (s *reportService) GetByID(id string) (*models.Report, error) {
	return s.reportRepo.FindByID(id)
}

// Update updates an existing report by its ID
func (s *reportService) Update(id string, report *models.Report) (*models.Report, error) {
	// Report, err := s.reportRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingReport.Field1 = report.Field1
	// existingReport.Field2 = report.Field2

	// return s.reportRepo.Update(id, existingReport)
	return nil, nil
}

// Delete removes a report by its ID
func (s *reportService) Delete(id string) error {
	return s.reportRepo.Delete(id)
}

// // GetAll retrieves all report records
// func (s *reportService) GetAll() ([]*models.Report, error) {
// 	return s.reportRepo.FindAll()
// }

// // Search allows searching for report entities based on a query
// func (s *reportService) Search(query string) ([]*models.Report, error) {
// 	return s.reportRepo.Search(query)
// }
