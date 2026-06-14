package postgres

import (
	"context"
	"database/sql"

	"github.com/indalyadav56/logify/services/user-service/internal/domain/entity"
)

type postgresUserRepository struct {
	db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) *postgresUserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) InsertUser(u *entity.User) error {
	query := `INSERT INTO users (first_name, middle_name, last_name, email, password) 
		VALUES ($1, $2, $3, $4, $5) RETURNING id, tenant_id`

	err := r.db.QueryRowContext(
		context.Background(),
		query,
		u.FirstName,
		u.MiddleName,
		u.LastName,
		u.Email,
		u.Password,
	).Scan(&u.ID, &u.TenantID)

	if err != nil {
		return err
	}

	return nil
}

func (r *postgresUserRepository) FindByEmail(email string) (*entity.User, error) {
	query := `
		SELECT id, tenant_id, first_name, middle_name, last_name, email, password from users where email = $1;
	`
	var user entity.User
	err := r.db.QueryRow(query, email).Scan(&user.ID, &user.TenantID, &user.FirstName, &user.MiddleName, &user.LastName, &user.Email, &user.Password)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// FindByID retrieves a record by its ID from the database
func (r *postgresUserRepository) FindByID(id string) (*entity.User, error) {
	query := "SELECT id, first_name, last_name, email, password FROM users WHERE id = $1"
	row := r.db.QueryRow(query, id)

	var user entity.User
	if err := row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Password); err != nil {
		return nil, err
	}

	return &user, nil
}
