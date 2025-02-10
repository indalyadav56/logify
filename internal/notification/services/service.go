package services

import (
	"common/pkg/logger"
	"logify/internal/notification/models"
	"logify/internal/notification/repository"
)

type NotificationService interface {
	Create(notification *models.Notification) (*models.Notification, error)
	GetByID(id string) (*models.Notification, error)
	Update(id string, notification *models.Notification) (*models.Notification, error)
	Delete(id string) error
	// GetAll() ([]*models.Notification, error)
	// Search(query string) ([]*models.Notification, error)

}

type notificationService struct {
	notificationRepo repository.NotificationRepository
	log              logger.Logger
}

func NewNotificationService(repo repository.NotificationRepository, log logger.Logger) *notificationService {
	return &notificationService{
		notificationRepo: repo,
		log:              log,
	}
}

// Create creates a new notification
func (s *notificationService) Create(notification *models.Notification) (*models.Notification, error) {
	return s.notificationRepo.Insert(notification)
}

// GetByID retrieves a notification by its ID
func (s *notificationService) GetByID(id string) (*models.Notification, error) {
	return s.notificationRepo.FindByID(id)
}

// Update updates an existing notification by its ID
func (s *notificationService) Update(id string, notification *models.Notification) (*models.Notification, error) {
	// Notification, err := s.notificationRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingNotification.Field1 = notification.Field1
	// existingNotification.Field2 = notification.Field2

	// return s.notificationRepo.Update(id, existingNotification)
	return nil, nil
}

// Delete removes a notification by its ID
func (s *notificationService) Delete(id string) error {
	return s.notificationRepo.Delete(id)
}

// // GetAll retrieves all notification records
// func (s *notificationService) GetAll() ([]*models.Notification, error) {
// 	return s.notificationRepo.FindAll()
// }

// // Search allows searching for notification entities based on a query
// func (s *notificationService) Search(query string) ([]*models.Notification, error) {
// 	return s.notificationRepo.Search(query)
// }
