-- +goose Up
CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    refresh_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc')
);

-- +goose Down
DROP TABLE IF EXISTS auth.sessions;