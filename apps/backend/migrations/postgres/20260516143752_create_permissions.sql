-- +goose Up
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    key VARCHAR(100) NOT NULL UNIQUE CHECK (
        key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
    ),
    description TEXT NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (
        scope IN ('platform', 'workspace')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO
    permissions (key, description, scope)
VALUES
    -- Platform-level (super admin only)
    (
        'platform.workspaces.manage',
        'Manage all workspaces across the platform',
        'platform'
    ),
    (
        'platform.users.manage',
        'Manage all users across the platform',
        'platform'
    ),
    (
        'platform.billing.manage',
        'Manage platform billing and plans',
        'platform'
    ),

-- Workspace-level
(
    'workspace.read',
    'View workspace details',
    'workspace'
),
(
    'workspace.update',
    'Update workspace settings',
    'workspace'
),
(
    'workspace.delete',
    'Delete the workspace',
    'workspace'
),
(
    'member.read',
    'View workspace members',
    'workspace'
),
(
    'member.invite',
    'Invite new members',
    'workspace'
),
(
    'member.remove',
    'Remove members',
    'workspace'
),
(
    'member.update_role',
    'Change member roles',
    'workspace'
),
(
    'logs.read',
    'View logs',
    'workspace'
),
(
    'logs.export',
    'Export logs',
    'workspace'
),
(
    'alerts.read',
    'View alert rules',
    'workspace'
),
(
    'alerts.write',
    'Create and modify alert rules',
    'workspace'
),
(
    'billing.read',
    'View billing and usage',
    'workspace'
),
(
    'billing.manage',
    'Manage billing (payment methods, plans)',
    'workspace'
),
(
    'api_keys.read',
    'View API keys',
    'workspace'
),
(
    'api_keys.manage',
    'Create, rotate, and revoke API keys',
    'workspace'
);

-- +goose Down
DROP TABLE IF EXISTS permissions;