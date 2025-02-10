package services

import (
	"common/pkg/logger"
	"logify/internal/team/models"
	"logify/internal/team/repository"
)

type TeamService interface {
	Create(team *models.Team) (*models.Team, error)
	GetByID(id string) (*models.Team, error)
	Update(id string, team *models.Team) (*models.Team, error)
	Delete(id string) error
	// GetAll() ([]*models.Team, error)
	// Search(query string) ([]*models.Team, error)

}

type teamService struct {
	teamRepo repository.TeamRepository
	log      logger.Logger
}

func NewTeamService(repo repository.TeamRepository, log logger.Logger) *teamService {
	return &teamService{
		teamRepo: repo,
		log:      log,
	}
}

// Create creates a new team
func (s *teamService) Create(team *models.Team) (*models.Team, error) {
	return s.teamRepo.Insert(team)
}

// GetByID retrieves a team by its ID
func (s *teamService) GetByID(id string) (*models.Team, error) {
	return s.teamRepo.FindByID(id)
}

// Update updates an existing team by its ID
func (s *teamService) Update(id string, team *models.Team) (*models.Team, error) {
	// Team, err := s.teamRepo.FindByID(id)
	// if err != nil {
	// 	return nil, err
	// }

	// Update fields (example: only certain fields are updated)
	// existingTeam.Field1 = team.Field1
	// existingTeam.Field2 = team.Field2

	// return s.teamRepo.Update(id, existingTeam)
	return nil, nil
}

// Delete removes a team by its ID
func (s *teamService) Delete(id string) error {
	return s.teamRepo.Delete(id)
}

// // GetAll retrieves all team records
// func (s *teamService) GetAll() ([]*models.Team, error) {
// 	return s.teamRepo.FindAll()
// }

// // Search allows searching for team entities based on a query
// func (s *teamService) Search(query string) ([]*models.Team, error) {
// 	return s.teamRepo.Search(query)
// }
