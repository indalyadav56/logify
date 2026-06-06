-- +goose Up
CREATE TABLE IF NOT EXISTS auth.role_permissions (
    role_id UUID NOT NULL REFERENCES auth.roles (id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions (id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- Seed role → permission mappings
-- super_admin gets ALL permissions
INSERT INTO
    auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
    CROSS JOIN auth.permissions p
WHERE
    r.key = 'super_admin';

-- owner: all workspace permissions
INSERT INTO
    auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
    CROSS JOIN auth.permissions p
WHERE
    r.key = 'owner'
    AND p.scope = 'workspace';

-- admin: most workspace permissions, but not delete workspace
INSERT INTO
    auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
    CROSS JOIN auth.permissions p
WHERE
    r.key = 'admin'
    AND p.scope = 'workspace'
    AND p.key NOT IN(
        'workspace.delete',
        'billing.manage'
    );

-- member: read + log ingest + alert read
INSERT INTO
    auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
    CROSS JOIN auth.permissions p
WHERE
    r.key = 'member'
    AND p.key IN (
        'workspace.read',
        'member.read',
        'logs.read',
        'logs.export',
        'alerts.read',
        'alerts.write',
        'api_keys.read'
    );

-- viewer: read only
INSERT INTO
    auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
    CROSS JOIN auth.permissions p
WHERE
    r.key = 'viewer'
    AND p.key IN (
        'workspace.read',
        'member.read',
        'logs.read',
        'alerts.read'
    );

-- support_agent: read-only platform access
INSERT INTO
    auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
    CROSS JOIN auth.permissions p
WHERE
    r.key = 'support_agent'
    AND p.key IN ('platform.workspaces.manage');

-- +goose Down
DROP TABLE IF EXISTS auth.role_permissions;