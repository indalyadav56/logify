package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/indalyadav56/logify/apps/backend/internal/embedder/domain"
)

type logRepository struct {
	db *pgxpool.Pool
}

func NewLogRepository(db *pgxpool.Pool) domain.LogRepository {
	return &logRepository{db: db}
}

func (r *logRepository) Insert(ctx context.Context, entry *domain.LogEntry) error {
	const query = `
		INSERT INTO logs (metadata, embedding)
		VALUES ($1, $2)
		RETURNING id, created_at
	`
	return r.db.QueryRow(ctx, query, entry.Metadata, entry.Embedding).
		Scan(&entry.ID, &entry.CreatedAt)
}
