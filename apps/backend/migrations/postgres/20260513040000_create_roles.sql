-- +goose Up
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    tenant_id   UUID,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT (now() AT TIME ZONE 'utc')

-- NOTE: When the `tenants` table is introduced, add the FK with:
--   ALTER TABLE roles
--   ADD CONSTRAINT roles_tenant_fk
--   FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE;
);

-- A role name is unique within a tenant. System/global roles (tenant_id IS NULL)
-- are kept in their own namespace via COALESCE to a sentinel UUID.
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_tenant_name ON roles (
    COALESCE(
        tenant_id,
        '00000000-0000-0000-0000-000000000000'::uuid
    ),
    LOWER(name)
);

CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles (tenant_id);

CREATE INDEX IF NOT EXISTS idx_roles_is_system ON roles (is_system);

-- +goose Down
DROP TABLE IF EXISTS roles;