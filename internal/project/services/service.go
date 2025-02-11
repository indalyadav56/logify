package services

import (
	"common/pkg/logger"
	"logify/internal/project/models"
	"logify/internal/project/repository"
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
}

func NewProjectService(repo repository.ProjectRepository, log logger.Logger) *projectService {
	return &projectService{
		projectRepo: repo,
		log:         log,
	}
}

// Create creates a new project
func (s *projectService) Create(project *models.Project) (*models.Project, error) {
	return s.projectRepo.Insert(project)
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
