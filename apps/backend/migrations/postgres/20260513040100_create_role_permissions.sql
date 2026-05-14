-- +goose Up
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id    UUID         NOT NULL,
    resource   VARCHAR(100) NOT NULL,
    action     VARCHAR(50)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),

    PRIMARY KEY (role_id, resource, action),

    CONSTRAINT role_permissions_role_fk
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id  ON role_permissions (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON role_permissions (resource);
CREATE INDEX IF NOT EXISTS idx_role_permissions_action   ON role_permissions (action);

-- +goose Down
DROP TABLE IF EXISTS role_permissions;
