package postgres

import (
	"context"
	"time"

	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RefreshTokenRepository struct {
	db *pgxpool.Pool
}

func NewRefreshTokenRepository(db *pgxpool.Pool) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, refreshToken *domain.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Exec(ctx, query, refreshToken.ID, refreshToken.UserID, refreshToken.TokenHash, refreshToken.ExpiresAt)
	if err != nil {
		return err
	}
	return nil
}

func (r *RefreshTokenRepository) GetByToken(ctx context.Context, token string) (*domain.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, created_at
		FROM refresh_tokens
		WHERE token_hash = $1 AND expires_at > $2
	`
	var row domain.RefreshToken
	err := r.db.QueryRow(ctx, query, token, time.Now().UTC()).Scan(&row.ID, &row.UserID, &row.TokenHash, &row.ExpiresAt, &row.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &row, nil
}
