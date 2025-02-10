package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/metrics/models"
)

type MetricsRepository interface {
	Insert(metrics *models.Metrics) (*models.Metrics, error)
	Update(metrics *models.Metrics) (*models.Metrics, error)
	FindByID(id string) (*models.Metrics, error)
	List(page, pageSize int) ([]models.Metrics, error)
	Delete(id string) error
}

type metricsRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewMetricsRepository(db *sql.DB, log logger.Logger) *metricsRepository {
	return &metricsRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *metricsRepository) Insert(metrics *models.Metrics) (*models.Metrics, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *metricsRepository) FindByID(id string) (*models.Metrics, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM metricss WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var metrics models.Metrics
	// if err := row.Scan(&metrics.ID, &metrics.Field1, &metrics.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &metrics, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *metricsRepository) List(page, pageSize int) ([]models.Metrics, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM metricss LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var metricss []models.Metrics
	// for rows.Next() {
	// 	var metrics models.Metrics
	// 	if err := rows.Scan(&metrics.ID, &metrics.Field1, &metrics.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	metricss = append(metricss, metrics)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return metricss, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *metricsRepository) Update(metrics *models.Metrics) (*models.Metrics, error) {
	// query := "UPDATE metricss SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, metrics.Field1, metrics.Field2, metrics.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return metrics, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *metricsRepository) Delete(id string) error {
	query := "DELETE FROM metricss WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
