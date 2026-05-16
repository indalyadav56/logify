package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/indalyadav56/logify/apps/backend/internal/user/domain"
)

const pgUniqueViolation = "23505"

type userRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	const query = `
		INSERT INTO users (id, email, full_name, password_hash, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		user.ID,
		user.Email,
		user.FullName,
		user.PasswordHash,
		user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return mapUniqueViolation(err)
	}
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	const query = `
		SELECT id, email, full_name, password_hash, is_active, created_at, updated_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`
	var u domain.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID,
		&u.Email,
		&u.FullName,
		&u.PasswordHash,
		&u.IsActive,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	const query = `
		SELECT id, email, full_name, password_hash, is_active, created_at, updated_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`
	var u domain.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID,
		&u.Email,
		&u.FullName,
		&u.PasswordHash,
		&u.IsActive,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

func mapUniqueViolation(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == pgUniqueViolation {
		return domain.ErrUserAlreadyExists
	}
	return err
}
