package postgres

import (
	"context"
	"time"

	"github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionRepository struct {
	db *pgxpool.Pool
}

func NewSessionRepository(db *pgxpool.Pool) *SessionRepository {
	return &SessionRepository{db: db}
}

func (s *SessionRepository) Create(ctx context.Context, session *domain.Session) error {
	query := `
		INSERT INTO auth.sessions (user_id, ip_address, user_agent)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`
	err := s.db.QueryRow(ctx, query, session.UserID, session.IPAddress, session.UserAgent).
		Scan(&session.ID, &session.CreatedAt, &session.UpdatedAt)
	if err != nil {
		return err
	}
	return nil
}

func (s *SessionRepository) GetByToken(ctx context.Context, token string) (*domain.Session, error) {
	query := `
		SELECT id, user_id, ip_address, user_agent, refresh_at, created_at
		FROM auth.sessions
		WHERE token = $1 AND refresh_at > $2
	`
	var row domain.Session
	err := s.db.QueryRow(ctx, query, token, time.Now().UTC()).Scan(&row.ID, &row.UserID, &row.IPAddress, &row.UserAgent, &row.RefreshAt, &row.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &row, nil
}
