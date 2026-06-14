-- +goose Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(255) NOT NULL,
    slug       VARCHAR(64)  NOT NULL UNIQUE,
    plan       VARCHAR(32)  NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- +goose Down
DROP TABLE IF EXISTS tenants;
