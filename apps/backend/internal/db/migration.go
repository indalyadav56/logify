package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/pressly/goose/v3"
)

// ApplyMigrations applies database migrations using goose for the specified dialect.
func ApplyMigrations(ctx context.Context, dialect string, migrationDir string, db *sql.DB) error {
	if err := goose.SetDialect(dialect); err != nil {
		return fmt.Errorf("failed to set dialect %s: %w", dialect, err)
	}

	// Use UpContext to respect the context timeout/cancellation
	if err := goose.UpContext(ctx, db, migrationDir); err != nil {
		return fmt.Errorf("failed to apply migrations for %s: %w", dialect, err)
	}

	return nil
}
