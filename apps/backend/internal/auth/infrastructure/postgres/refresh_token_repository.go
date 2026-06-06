package postgres

import (
	"context"

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
		INSERT INTO auth.refresh_tokens (id, user_id, token, session_id)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Exec(ctx, query, refreshToken.ID, refreshToken.UserID, refreshToken.TokenHash, refreshToken.SessionID)
	if err != nil {
		return err
	}
	return nil
}

func (r *RefreshTokenRepository) GetByToken(ctx context.Context, token string) (*domain.RefreshToken, error) {
	// query := `
	// 	SELECT id, user_id, token, created_at
	// 	FROM auth.refresh_tokens
	// 	WHERE token = $1 AND expires_at > $2
	// `
	// var row domain.RefreshToken
	// err := r.db.QueryRow(ctx, query, token, time.Now().UTC()).Scan(&row.ID, &row.UserID, &row.TokenHash, &row.ExpiresAt, &row.CreatedAt)
	// if err != nil {
	// 	return nil, err
	// }
	return nil, nil
}
