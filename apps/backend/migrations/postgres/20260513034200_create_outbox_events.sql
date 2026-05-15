-- +goose Up
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT uuidv7 (),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    last_error TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
    CONSTRAINT outbox_events_status_check CHECK (
        status IN (
            'pending',
            'processing',
            'completed',
            'failed'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_status ON outbox_events (status);

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate_type ON outbox_events (aggregate_type);

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate_id ON outbox_events (aggregate_id);

CREATE INDEX IF NOT EXISTS idx_outbox_events_event_type ON outbox_events (event_type);

CREATE INDEX IF NOT EXISTS idx_outbox_events_created_at ON outbox_events (created_at);

-- +goose Down
DROP TABLE IF EXISTS outbox_events;