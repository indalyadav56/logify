-- +goose Up


CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE RESTRICT,  -- can't delete a role in use

-- Invite tracking
invited_by UUID REFERENCES auth.users (id),
invited_at TIMESTAMPTZ,
joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

-- Status
status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'suspended', 'left')
    )
);

-- Audit

-- created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

--     CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
-- );

-- CREATE INDEX idx_workspace_members_workspace ON workspace_members (workspace_id)
-- WHERE
--     status = 'active';

-- CREATE INDEX idx_workspace_members_user ON workspace_members (user_id)
-- WHERE
--     status = 'active';

-- CREATE INDEX idx_workspace_members_role ON workspace_members (role_id);

-- +goose Down
DROP TABLE IF EXISTS project_members;