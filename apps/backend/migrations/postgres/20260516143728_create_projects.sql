-- +goose Up
CREATE TABLE if not exists projects (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    tenant_id UUID NOT NULL,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects (tenant_id);

-- +goose Down
DROP TABLE IF EXISTS projects;