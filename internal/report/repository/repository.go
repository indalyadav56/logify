package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/report/models"
)

type ReportRepository interface {
	Insert(report *models.Report) (*models.Report, error)
	Update(report *models.Report) (*models.Report, error)
	FindByID(id string) (*models.Report, error)
	List(page, pageSize int) ([]models.Report, error)
	Delete(id string) error
}

type reportRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewReportRepository(db *sql.DB, log logger.Logger) *reportRepository {
	return &reportRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *reportRepository) Insert(report *models.Report) (*models.Report, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *reportRepository) FindByID(id string) (*models.Report, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM reports WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var report models.Report
	// if err := row.Scan(&report.ID, &report.Field1, &report.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &report, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *reportRepository) List(page, pageSize int) ([]models.Report, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM reports LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var reports []models.Report
	// for rows.Next() {
	// 	var report models.Report
	// 	if err := rows.Scan(&report.ID, &report.Field1, &report.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	reports = append(reports, report)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return reports, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *reportRepository) Update(report *models.Report) (*models.Report, error) {
	// query := "UPDATE reports SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, report.Field1, report.Field2, report.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return report, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *reportRepository) Delete(id string) error {
	query := "DELETE FROM reports WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
