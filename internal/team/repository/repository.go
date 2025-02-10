package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/team/models"
)

type TeamRepository interface {
	Insert(team *models.Team) (*models.Team, error)
	Update(team *models.Team) (*models.Team, error)
	FindByID(id string) (*models.Team, error)
	List(page, pageSize int) ([]models.Team, error)
	Delete(id string) error
}

type teamRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewTeamRepository(db *sql.DB, log logger.Logger) *teamRepository {
	return &teamRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *teamRepository) Insert(team *models.Team) (*models.Team, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *teamRepository) FindByID(id string) (*models.Team, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM teams WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var team models.Team
	// if err := row.Scan(&team.ID, &team.Field1, &team.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &team, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *teamRepository) List(page, pageSize int) ([]models.Team, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM teams LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var teams []models.Team
	// for rows.Next() {
	// 	var team models.Team
	// 	if err := rows.Scan(&team.ID, &team.Field1, &team.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	teams = append(teams, team)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return teams, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *teamRepository) Update(team *models.Team) (*models.Team, error) {
	// query := "UPDATE teams SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, team.Field1, team.Field2, team.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return team, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *teamRepository) Delete(id string) error {
	query := "DELETE FROM teams WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
