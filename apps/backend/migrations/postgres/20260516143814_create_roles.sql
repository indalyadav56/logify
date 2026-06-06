-- +goose Up

CREATE TABLE auth.roles (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    key VARCHAR(50) NOT NULL UNIQUE CHECK (key ~ '^[a-z][a-z0-9_]*$'),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    scope VARCHAR(20) NOT NULL CHECK (
        scope IN ('platform', 'workspace')
    ),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT(now() AT TIME ZONE 'utc')
);

INSERT INTO
    auth.roles (
        key,
        name,
        description,
        scope,
        is_system
    )
VALUES
    -- Platform roles
    (
        'super_admin',
        'Super Admin',
        'Highest platform-level privileges',
        'platform',
        TRUE
    ),
    (
        'support_agent',
        'Support Agent',
        'Read-only platform support access',
        'platform',
        TRUE
    ),

-- Workspace roles
(
    'owner',
    'Owner',
    'Workspace owner with full access',
    'workspace',
    TRUE
),
(
    'admin',
    'Admin',
    'Workspace administrator',
    'workspace',
    TRUE
),
(
    'member',
    'Member',
    'Regular workspace member',
    'workspace',
    TRUE
),
(
    'viewer',
    'Viewer',
    'Read-only workspace access',
    'workspace',
    TRUE
);

-- +goose Down
DROP TABLE IF EXISTS auth.roles;