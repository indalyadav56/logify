-- +goose Up
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector (4096),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_metadata_gin ON logs USING gin (metadata);

-- +goose Down
DROP TABLE IF EXISTS logs;
