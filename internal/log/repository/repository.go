package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/log/models"
)

type LogRepository interface {
	Insert(log *models.Log) (*models.Log, error)
	Update(log *models.Log) (*models.Log, error)
	FindByID(id string) (*models.Log, error)
	List(page, pageSize int) ([]models.Log, error)
	Delete(id string) error
}

type logRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewLogRepository(db *sql.DB, log logger.Logger) *logRepository {
	return &logRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *logRepository) Insert(log *models.Log) (*models.Log, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *logRepository) FindByID(id string) (*models.Log, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM logs WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var log models.Log
	// if err := row.Scan(&log.ID, &log.Field1, &log.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &log, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *logRepository) List(page, pageSize int) ([]models.Log, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM logs LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var logs []models.Log
	// for rows.Next() {
	// 	var log models.Log
	// 	if err := rows.Scan(&log.ID, &log.Field1, &log.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	logs = append(logs, log)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return logs, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *logRepository) Update(log *models.Log) (*models.Log, error) {
	// query := "UPDATE logs SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, log.Field1, log.Field2, log.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return log, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *logRepository) Delete(id string) error {
	query := "DELETE FROM logs WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
