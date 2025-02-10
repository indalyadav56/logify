package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/settings/models"
)

type SettingsRepository interface {
	Insert(settings *models.Settings) (*models.Settings, error)
	Update(settings *models.Settings) (*models.Settings, error)
	FindByID(id string) (*models.Settings, error)
	List(page, pageSize int) ([]models.Settings, error)
	Delete(id string) error
}

type settingsRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewSettingsRepository(db *sql.DB, log logger.Logger) *settingsRepository {
	return &settingsRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *settingsRepository) Insert(settings *models.Settings) (*models.Settings, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *settingsRepository) FindByID(id string) (*models.Settings, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM settingss WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var settings models.Settings
	// if err := row.Scan(&settings.ID, &settings.Field1, &settings.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &settings, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *settingsRepository) List(page, pageSize int) ([]models.Settings, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM settingss LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var settingss []models.Settings
	// for rows.Next() {
	// 	var settings models.Settings
	// 	if err := rows.Scan(&settings.ID, &settings.Field1, &settings.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	settingss = append(settingss, settings)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return settingss, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *settingsRepository) Update(settings *models.Settings) (*models.Settings, error) {
	// query := "UPDATE settingss SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, settings.Field1, settings.Field2, settings.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return settings, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *settingsRepository) Delete(id string) error {
	query := "DELETE FROM settingss WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
