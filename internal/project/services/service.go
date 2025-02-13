package services

import (
	customJWT "common/pkg/jwt"
	"common/pkg/logger"
	"fmt"
	"logify/internal/project/models"
	"logify/internal/project/repository"

	"github.com/golang-jwt/jwt/v5"
)

type ProjectService interface {
	Create(project *models.Project) (*models.Project, error)
	GetByID(id string) (*models.Project, error)
	Update(id string, project *models.Project) (*models.Project, error)
	Delete(id string) error
}

type projectService struct {
	projectRepo repository.ProjectRepository
	log         logger.Logger
	jwt         customJWT.JWT
}

func NewProjectService(repo repository.ProjectRepository, log logger.Logger, jwt customJWT.JWT) *projectService {
	return &projectService{
		projectRepo: repo,
		log:         log,
		jwt:         jwt,
	}
}

// Create creates a new project
func (s *projectService) Create(project *models.Project) (*models.Project, error) {
	// create api
	type CustomClaims struct {
		UserID               int    `json:"user_id"`
		Email                string `json:"email"`
		jwt.RegisteredClaims        // Embed registered claims (optional)
	}

	// Create a new token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, CustomClaims{
		UserID: 123,
		Email:  "user@example.com",
		// Omit the `exp` field to create a token without expiration
	})

	// Sign the token with a secret key
	secretKey := []byte("your-256-bit-secret")
	signedToken, err := token.SignedString(secretKey)
	if err != nil {
		fmt.Println("Failed to sign token:", err)
	}

	fmt.Println("JWT Token:", signedToken)

	project, err = s.projectRepo.Insert(project)
	if err != nil {
		return nil, err
	}
	return project, nil
}

// GetByID retrieves a project by its ID
func (s *projectService) GetByID(id string) (*models.Project, error) {
	return s.projectRepo.FindByID(id)
}

// Update updates an existing project by its ID
func (s *projectService) Update(id string, project *models.Project) (*models.Project, error) {
	// Project, err := s.projectRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingProject.Field1 = project.Field1
	// existingProject.Field2 = project.Field2

	// return s.projectRepo.Update(id, existingProject)
	return nil, nil
}

// Delete removes a project by its ID
func (s *projectService) Delete(id string) error {
	return s.projectRepo.Delete(id)
}
