-- +goose Up
CREATE TABLE IF NOT EXISTS user_verifications (
    id         UUID        PRIMARY KEY,
    user_id    UUID        NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    kind       VARCHAR(30) NOT NULL DEFAULT 'email',
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),

    CONSTRAINT user_verifications_token_hash_unique UNIQUE (token_hash),
    CONSTRAINT user_verifications_kind_check        CHECK  (kind IN ('email', 'password_reset')),
    CONSTRAINT user_verifications_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id    ON user_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_expires_at ON user_verifications (expires_at);

-- +goose Down
DROP TABLE IF EXISTS user_verifications;
