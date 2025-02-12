-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE if not exists projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    environment VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE if exists projects;
-- +goose StatementEnd
