package db

import (
	"context"
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"github.com/pressly/goose"
)

func InitDB(postgresURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", postgresURL)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}

func ApplyMigrations(ctx context.Context, migrationDir string, db *sql.DB) error {
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("%w: failed to set dialect: ", err)
	}

	if err := goose.Up(db, migrationDir); err != nil {
		return fmt.Errorf("%w: failed to apply migrations: ", err)
	}

	return nil
}
