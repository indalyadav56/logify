package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/project/models"
)

type ProjectRepository interface {
	Insert(project *models.Project) (*models.Project, error)
	Update(project *models.Project) (*models.Project, error)
	FindByID(id string) (*models.Project, error)
	List(page, pageSize int) ([]models.Project, error)
	Delete(id string) error
}

type projectRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewProjectRepository(db *sql.DB, log logger.Logger) *projectRepository {
	return &projectRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *projectRepository) Insert(project *models.Project) (*models.Project, error) {
	query := "INSERT INTO projects (name, user_id, environment, api_key) VALUES ($1, $2, $3, $4) RETURNING id"
	err := r.db.QueryRow(query, project.Name, project.UserID, project.Environment, project.ApiKey).Scan(&project.ID)
	if err != nil {
		return nil, err
	}
	return project, nil
}

// FindByID retrieves a record by its ID from the database
func (r *projectRepository) FindByID(id string) (*models.Project, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM projects WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var project models.Project
	// if err := row.Scan(&project.ID, &project.Field1, &project.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &project, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *projectRepository) List(page, pageSize int) ([]models.Project, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM projects LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var projects []models.Project
	// for rows.Next() {
	// 	var project models.Project
	// 	if err := rows.Scan(&project.ID, &project.Field1, &project.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	projects = append(projects, project)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return projects, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *projectRepository) Update(project *models.Project) (*models.Project, error) {
	// query := "UPDATE projects SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, project.Field1, project.Field2, project.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return project, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *projectRepository) Delete(id string) error {
	query := "DELETE FROM projects WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
