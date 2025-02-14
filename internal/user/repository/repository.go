package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/user/models"
)

type UserRepository interface {
	Insert(user *models.User) (*models.User, error)
	Update(user *models.User) (*models.User, error)
	FindByID(id string) (*models.User, error)
	List(page, pageSize int) ([]models.User, error)
	Delete(id string) error
	FindByEmail(email string) (*models.User, error)
}

type userRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewUserRepository(db *sql.DB, log logger.Logger) *userRepository {
	return &userRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database.
func (r *userRepository) Insert(user *models.User) (*models.User, error) {

	query := "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id"
	err := r.db.QueryRow(query, user.FirstName, user.LastName, user.Email, user.Password).Scan(&user.ID)
	if err != nil {
		return nil, err
	}
	return user, nil

}

// FindByID retrieves a record by its ID from the database
func (r *userRepository) FindByID(id string) (*models.User, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM users WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var user models.User
	// if err := row.Scan(&user.ID, &user.Field1, &user.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &user, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *userRepository) List(page, pageSize int) ([]models.User, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM users LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var users []models.User
	// for rows.Next() {
	// 	var user models.User
	// 	if err := rows.Scan(&user.ID, &user.Field1, &user.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	users = append(users, user)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return users, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *userRepository) Update(user *models.User) (*models.User, error) {
	// query := "UPDATE users SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, user.Field1, user.Field2, user.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return user, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *userRepository) Delete(id string) error {
	query := "DELETE FROM users WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, tenant_id, first_name, middle_name, last_name, email, password from users where email = $1;
	`
	var user models.User
	err := r.db.QueryRow(query, email).Scan(&user.ID, &user.TenantID, &user.FirstName, &user.MiddleName, &user.LastName, &user.Email, &user.Password)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
