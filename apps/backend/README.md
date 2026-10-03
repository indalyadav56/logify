# Logify Backend

The Go backend handles authentication, project teams, API keys, log ingestion, and search.
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
| `GET` | `/v1/projects` | List owned and shared projects with the current role |
| `POST` | `/v1/projects` | Create a project |
| `GET`, `PUT`, `DELETE` | `/v1/projects/:id` | Read, update, or delete a project |
| `POST`, `GET` | `/v1/projects/:id/api-keys` | Create a project API key or list its metadata |
| `DELETE` | `/v1/projects/:id/api-keys/:keyId` | Revoke a project API key |
| `GET` | `/v1/projects/:id/team` | List project members and invitation metadata (invitations visible to managers) |
| `POST` | `/v1/projects/:id/invitations` | Create an email-bound invitation; return `data.token` once |
| `DELETE` | `/v1/projects/:id/invitations/:invitationId` | Cancel an unused invitation |
| `PATCH`, `DELETE` | `/v1/projects/:id/members/:userId` | Change a member’s role, remove them, or leave |
| `POST` | `/v1/invitations/preview` | Validate and review an invitation for the signed-in recipient |
| `POST` | `/v1/invitations/accept` | Consume an invitation and return the shared project |
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

### Teams

Membership is scoped to a project. Its creator is the Owner; additional roles
are `admin`, `member`, and `viewer`. Owners and Admins manage settings, keys,
and the team. All roles can search/view logs; Viewers cannot ingest. Only the
Owner can delete the project. The Owner cannot be removed or demoted. A member
can remove themselves to leave a project.

Creating an invitation accepts `{"email":"teammate@example.com","role":"member"}`.
Share `/invite#token=TOKEN` using the frontend’s origin. The token is returned
once, stored only as SHA-256, expires after seven days, and binds to the
recipient’s normalized account email. No email is sent. Preview/accept accept
`{"token":"TOKEN"}` with the recipient’s Bearer JWT. Acceptance adds membership
and consumes the invitation in one transaction. Repeat acceptance is idempotent
while membership remains, and never restores a removed or demoted member.

Duplicate pending invitations or existing members return `409`, wrong-account
acceptance returns `403`, and expired/canceled tokens return `410`. A removed
member cannot use an old JWT or invitation to regain access. Demotion below
Admin or removal revokes that person’s project keys and pending invitations in
the same transaction. API key validation also checks the creator’s current role.

Project list/read responses include `role`. Search and aggregation require
`project_id`; shared event lookup uses `GET /v1/logs/:id?project_id=UUID`.
The backend resolves the project’s storage tenant after checking membership.
A caller-supplied tenant cannot bypass isolation. Nonmembers receive `404`;
existing members attempting a disallowed action receive `403`.

### Ingestion

Applications authenticate with `X-API-Key: lgfy_...` (or
`Authorization: Bearer lgfy_...`). Create and revoke keys in **Connect a source**
or through the JWT-protected project key routes. Creation accepts
`{"name":"my-app"}` and returns the secret in `data.key` once; listing returns
only names, prefixes, and status. Keys are random, stored as SHA-256 hashes, and
checked against PostgreSQL on every request so revocation takes effect immediately.

A key can only call `POST /v1/logs` for its own project. `project_id` can be
omitted; a mismatched project returns `403`. Invalid or revoked keys return
`401`. Deleted or suspended projects and disabled key owners invalidate keys.
JWT ingestion remains supported for Owner, Admin, and Member roles with an
accessible project ID. Only Owners and Admins can manage keys. Requests containing
both `X-API-Key` and `Authorization` return `400`.

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

### Project API keys

```bash
LOGIFY_TEST_DATABASE_URL='postgres://postgres:postgres@localhost:5432/logify?sslmode=disable' \
  go test -tags=integration -race ./internal/apikey/application -run TestProjectAPIKeysIntegration -v
```

This also creates and removes an isolated database. It covers one-time secret
responses, hashed storage, project and account isolation, JWT compatibility,
revocation, invalid credentials, and project/user lifecycle changes. A capturing
producer verifies authorized payloads without writing to Kafka.

### Project teams

```bash
LOGIFY_TEST_DATABASE_URL='postgres://postgres:postgres@localhost:5432/logify?sslmode=disable' \
  go test -tags=integration -race ./internal/team/application -run TestProjectTeamsIntegration -v
```

This uses an isolated database and real HTTP handlers. It covers role and
project isolation, shared search/ingestion scopes, wrong-account/expired/canceled
invitations, concurrent creation/acceptance, rollback and retry after a storage
failure, owner protection, leaving/removal, and immediate revocation of keys and
pending invitations. JWTs deliberately claim Owner to verify that persisted
project roles are enforced independently of token claims.

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
internal/project/       Project application, membership access checks, and persistence
internal/team/          Project members, invitations, role changes, and leaving
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
