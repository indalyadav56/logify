-- +goose Up
CREATE TABLE if not exists projects (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN (
            'active',
            'suspended',
            'deleted'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc'),
    deleted_at TIMESTAMPTZ
);

-- +goose Down
DROP TABLE IF EXISTS projects;