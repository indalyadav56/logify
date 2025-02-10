package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/role/models"
)

type RoleRepository interface {
	Insert(role *models.Role) (*models.Role, error)
	Update(role *models.Role) (*models.Role, error)
	FindByID(id string) (*models.Role, error)
	List(page, pageSize int) ([]models.Role, error)
	Delete(id string) error
}

type roleRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewRoleRepository(db *sql.DB, log logger.Logger) *roleRepository {
	return &roleRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *roleRepository) Insert(role *models.Role) (*models.Role, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *roleRepository) FindByID(id string) (*models.Role, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM roles WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var role models.Role
	// if err := row.Scan(&role.ID, &role.Field1, &role.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &role, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *roleRepository) List(page, pageSize int) ([]models.Role, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM roles LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var roles []models.Role
	// for rows.Next() {
	// 	var role models.Role
	// 	if err := rows.Scan(&role.ID, &role.Field1, &role.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	roles = append(roles, role)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return roles, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *roleRepository) Update(role *models.Role) (*models.Role, error) {
	// query := "UPDATE roles SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, role.Field1, role.Field2, role.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return role, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *roleRepository) Delete(id string) error {
	query := "DELETE FROM roles WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
