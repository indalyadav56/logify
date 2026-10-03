# Logify Backend

The Go backend handles authentication, projects, log ingestion, and search.
PostgreSQL stores account and project data; Kafka carries accepted log events
to the log processor; ClickHouse stores events for search.

## Run locally

Requires Docker with Compose v2 and the Go toolchain declared in `go.mod`
(Go 1.26.2). From this directory:

```bash
APP_SERVER_PORT=:8081 make run
```

`make run` starts the development PostgreSQL, Redis, Kafka, and ClickHouse
containers, waits for their health checks, applies both database schemas, starts
the log processor in Docker, and runs the API. The API and processor ensure the
Kafka `logs` topic exists during startup.

| Endpoint | Local URL |
| --- | --- |
| Health | [localhost:8081/healthz](http://localhost:8081/healthz) |
| Readiness | [localhost:8081/readyz](http://localhost:8081/readyz) |
| Swagger | [localhost:8081/swagger/index.html](http://localhost:8081/swagger/index.html) |

The configuration defaults to port `8080`. `APP_SERVER_PORT=:8081` explicitly
selects the port used in the root guide. Keep the web app's
`NEXT_PUBLIC_LOGIFY_API_BASE_URL` aligned with that port.

Stop the API with `Ctrl+C`. `make dev-down` stops the development containers
while preserving their named volumes.

## API

Authentication routes and health endpoints are public. Log and project routes
require `Authorization: Bearer YOUR_ACCESS_TOKEN`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Health endpoint |
| `GET` | `/readyz` | Readiness endpoint |
| `POST` | `/v1/auth/register` | Register a user and provision the default project |
| `POST` | `/v1/auth/login` | Sign in and receive tokens |
| `POST` | `/v1/auth/refresh-token` | Refresh authentication |
| `POST` | `/v1/auth/logout` | Revoke the supplied refresh token |
| `GET` | `/v1/projects` | List the authenticated account's projects |
| `POST` | `/v1/projects` | Create a project |
| `GET`, `PUT`, `DELETE` | `/v1/projects/:id` | Read, update, or delete a project |
| `POST` | `/v1/logs` | Accept a log event into Kafka |
| `POST` | `/v1/logs/search` | Search events by project, message, time range, and cursor |
| `GET` | `/v1/logs/:id` | Read an event |
| `POST` | `/v1/logs/aggregate` | Aggregate stored events |
| `POST` | `/v1/logs/export` | Request a log export |
| `GET` | `/exports/:id` | Check an export's status |

Route definitions in `internal/*/transport/http/routes.go` and their request
DTOs are the source of truth for request shapes.

### Registration

`POST /v1/auth/register` writes the user, `default-project`, session, and refresh
token in one PostgreSQL transaction. The project belongs to the user's tenant
and records that user as its creator. A failed step rolls back signup.

Duplicate registration returns `409`; signing in does not create another
project. The web app selects the project returned by `GET /v1/projects`.

### Ingestion

`POST /v1/logs` returns `202` after Kafka acknowledges the event. The log
processor stores it in ClickHouse asynchronously, using a consumer group
independent of the embedding worker. Refresh search after processing and choose
a time range covering the event's timestamp.

See the [root ingest example](../../README.md#sending-logs) and
[sample-data script](../../mock-data/README.md) for complete requests.

## Configuration

For `APP_ENV=dev`, the backend reads `configs/dev.yaml`. Environment variables
with the `APP_` prefix override configuration; an optional `.env` provides
values that have not already been set in the environment.

Common overrides are `APP_SERVER_PORT`, `APP_JWT_SECRET`,
`APP_POSTGRES_HOST`, `APP_POSTGRES_PORT`, `APP_POSTGRES_USER`,
`APP_POSTGRES_PASSWORD`, `APP_POSTGRES_DATABASE`, `APP_KAFKA_BROKERS`, and
`APP_CLICKHOUSE_HOST`, `APP_CLICKHOUSE_PORT`, `APP_CLICKHOUSE_USER`,
`APP_CLICKHOUSE_PASSWORD`, `APP_CLICKHOUSE_DATABASE`.

Development PostgreSQL credentials are `postgres` / `postgres`, database
`logify`. ClickHouse uses `default` / `mypassword`, database `logify`.
The development Compose override exposes PostgreSQL `5432`, Redis `6379`,
Kafka `29092`, and ClickHouse `8123` / `9000` on loopback.

## Useful commands

Run from this directory:

| Command | Purpose |
| --- | --- |
| `make dev-up` | Start infrastructure and apply migrations |
| `make dev-logs` | Start infrastructure, migrations, and the log processor |
| `make run` | Start the development pipeline and run the API |
| `make build` | Build `bin/server` |
| `make test` | Run Go tests with the race detector and coverage |
| `make vet` | Run Go static analysis |
| `make migrate-status` | Inspect PostgreSQL migration status |
| `make migrate-status-ch` | Inspect ClickHouse migration status |
| `make dev-down` | Stop development containers, preserving volumes |
| `make help` | List available Make targets |

## Integration checks

Run these against the development services after `make dev-up`.

### Transactional registration

```bash
LOGIFY_TEST_DATABASE_URL='postgres://postgres:postgres@localhost:5432/logify?sslmode=disable' \
  go test -tags=integration -race ./internal/auth/application -run TestRegistrationIntegration -v
```

The test creates, migrates, and removes a separate temporary database. It needs
PostgreSQL 18 with pgvector and a database user with `CREATE DATABASE`
permission. It covers project ownership and visibility, duplicate and
concurrent signup, repeated login, invalid requests, and rollback/retry after
project, session, or refresh-token persistence failures.

### Kafka topic creation and delivery

```bash
LOGIFY_TEST_KAFKA_BROKERS=localhost:29092 \
  go test -tags=integration -race ./internal/di -run TestEnsureKafkaTopicsIntegration -v
```

The test creates and removes a uniquely named topic, checks repeated topic
initialization, and publishes and reads an event. It preserves the application's
`logs` topic.

## Code map

```text
cmd/server/             API entry point
cmd/log-processor/      Kafka-to-ClickHouse worker
cmd/embedding-worker/   Embedding worker entry point
cmd/migrator/           PostgreSQL and ClickHouse migrations
internal/auth/          Registration, login, sessions, and refresh tokens
internal/project/       Project application and persistence layers
internal/ingest/        Event validation and publication
internal/search/        ClickHouse search and event retrieval
internal/di/            Service wiring, Kafka initialization, and routes
internal/server/http/   HTTP server and middleware
pkg/postgres/           Connection and shared transaction support
migrations/             Database schemas
configs/                Environment configuration
```

For screenshots, frontend setup, and troubleshooting, see the
[root README](../../README.md).
