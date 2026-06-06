-- +goose Up
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    token VARCHAR(512) NOT NULL,
    revoked BOOLEAN DEFAULT false,
    parent VARCHAR(512) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc')
);

-- +goose Down
DROP TABLE IF EXISTS auth.refresh_tokens;