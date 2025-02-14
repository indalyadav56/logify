package services

import (
	"common/pkg/logger"
	"logify/internal/user/models"
	"logify/internal/user/repository"
)

type UserService interface {
	Create(user *models.User) (*models.User, error)
	GetByID(id string) (*models.User, error)
	Update(id string, user *models.User) (*models.User, error)
	Delete(id string) error
	GetByEmail(email string) (*models.User, error)
}

type userService struct {
	userRepo repository.UserRepository
	log      logger.Logger
}

func NewUserService(repo repository.UserRepository, log logger.Logger) *userService {
	return &userService{
		userRepo: repo,
		log:      log,
	}
}

// Create creates a new user
func (s *userService) Create(user *models.User) (*models.User, error) {
	return s.userRepo.Insert(user)
}

// GetByID retrieves a user by its ID
func (s *userService) GetByID(id string) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

// Update updates an existing user by its ID
func (s *userService) Update(id string, user *models.User) (*models.User, error) {
	// User, err := s.userRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingUser.Field1 = user.Field1
	// existingUser.Field2 = user.Field2

	// return s.userRepo.Update(id, existingUser)
	return nil, nil
}

// Delete removes a user by its ID
func (s *userService) Delete(id string) error {
	return s.userRepo.Delete(id)
}

func (s *userService) GetByEmail(email string) (*models.User, error) {
	existingUser, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, nil
	}

	return existingUser, nil
}
