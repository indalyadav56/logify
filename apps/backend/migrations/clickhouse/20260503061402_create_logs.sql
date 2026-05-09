-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS logify.logs (
    id UUID DEFAULT generateUUIDv7 (),
    tenant_id LowCardinality (String),
    project_id LowCardinality (String),
    timestamp DateTime64 (3, 'UTC') DEFAULT now64 (3),
    level LowCardinality (String) CODEC (ZSTD (1)),
    service LowCardinality (String),
    namespace LowCardinality (String),
    environment LowCardinality (String),
    host String,
    source LowCardinality (String),
    trace_id String,
    span_id String,
    request_id String,
    user_id String,
    message String CODEC (ZSTD (3)),
    tags Map (String, String),
    attributes Map (String, String) CODEC (ZSTD (1)),
    ingestion_time DateTime DEFAULT now()
) ENGINE = MergeTree
PARTITION BY
    toYYYYMM (timestamp)
ORDER BY (
        tenant_id,
        timestamp,
        service,
        level
    ) TTL timestamp + INTERVAL 90 DAY SETTINGS index_granularity = 8192;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS logify.logs;
-- +goose StatementEnd