package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/alert/models"
)

type AlertRepository interface {
	Insert(alert *models.Alert) (*models.Alert, error)
	Update(alert *models.Alert) (*models.Alert, error)
	FindByID(id string) (*models.Alert, error)
	List(page, pageSize int) ([]models.Alert, error)
	Delete(id string) error
}

type alertRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewAlertRepository(db *sql.DB, log logger.Logger) *alertRepository {
	return &alertRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *alertRepository) Insert(alert *models.Alert) (*models.Alert, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *alertRepository) FindByID(id string) (*models.Alert, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM alerts WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var alert models.Alert
	// if err := row.Scan(&alert.ID, &alert.Field1, &alert.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &alert, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *alertRepository) List(page, pageSize int) ([]models.Alert, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM alerts LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var alerts []models.Alert
	// for rows.Next() {
	// 	var alert models.Alert
	// 	if err := rows.Scan(&alert.ID, &alert.Field1, &alert.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	alerts = append(alerts, alert)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return alerts, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *alertRepository) Update(alert *models.Alert) (*models.Alert, error) {
	// query := "UPDATE alerts SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, alert.Field1, alert.Field2, alert.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return alert, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *alertRepository) Delete(id string) error {
	query := "DELETE FROM alerts WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
