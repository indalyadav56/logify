package services

import (
	"common/pkg/jwt"
	"common/pkg/logger"
	"logify/internal/project/models"
	"logify/internal/project/repository"
)

type ProjectService interface {
	Create(project *models.Project) (*models.Project, error)
	GetByID(id string) (*models.Project, error)
	GetAll() ([]models.Project, error)
	Update(id string, project *models.Project) (*models.Project, error)
	Delete(id string) error

	CreateAPIKey(userID, tenantID, projectID string) (interface{}, error)
	DeleteAPIKey(projectID string) (interface{}, error)
}

type projectService struct {
	projectRepo repository.ProjectRepository
	log         logger.Logger
	clientJWT   jwt.JWT
}

func NewProjectService(repo repository.ProjectRepository, log logger.Logger, clientJwt jwt.JWT) *projectService {
	return &projectService{
		projectRepo: repo,
		log:         log,
		clientJWT:   clientJwt,
	}
}

// Create creates a new project
func (s *projectService) Create(project *models.Project) (*models.Project, error) {
	project, err := s.projectRepo.Insert(project)
	if err != nil {
		return nil, err
	}
	return project, nil
}

func (s *projectService) GetAll() ([]models.Project, error) {
	return s.projectRepo.List(1, 10)
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

func (s *projectService) CreateAPIKey(userID, tenantID, projectID string) (interface{}, error) {
	// type CustomClaims struct {
	// 	UserID    string `json:"user_id"`
	// 	TenantID  string `json:"tenant_id"`
	// 	ProjectID string `json:"project_id"`
	// 	jwt.RegisteredClaims
	// }

	// // Create a new token
	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, CustomClaims{
	// 	UserID:    userID,
	// 	TenantID:  tenantID,
	// 	ProjectID: projectID,
	// })

	// // Sign the token with a secret key
	// secretKey := []byte("your-256-bit-secret")
	// signedToken, err := token.SignedString(secretKey)
	// if err != nil {
	// 	fmt.Println("Failed to sign token:", err)
	// }

	// fmt.Println("JWT Token:", signedToken)

	token, err := s.clientJWT.GenerateTokenWithoutExpiration(map[string]interface{}{
		"user_id":    userID,
		"tenant_id":  tenantID,
		"project_id": projectID,
	})
	if err != nil {
		return nil, err
	}

	return token, nil
}

func (s *projectService) DeleteAPIKey(projectID string) (interface{}, error) {
	return nil, nil
}
