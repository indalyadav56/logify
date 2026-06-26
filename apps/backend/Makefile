.PHONY: run run-log-processor run-embedding-worker build test lint clean docker-build docker-run fmt vet mocks \
        migrate migrate-up migrate-up-by-one migrate-down migrate-redo \
        migrate-reset migrate-status migrate-version migrate-create \
        migrate-ch migrate-up-ch migrate-up-by-one-ch migrate-down-ch \
        migrate-redo-ch migrate-reset-ch migrate-status-ch migrate-version-ch \
        migrate-create-ch swagger

APP_NAME     := logify-backend
BUILD_DIR    := ./bin
MAIN_FILE    := ./cmd/server/main.go

DOCKER_IMAGE := logify-backend
DOCKER_TAG   := latest

MIGRATOR_PKG    := ./cmd/migrator
MIGRATE_ENV     ?= dev
MIGRATE_DRIVER  ?= postgres
MIGRATE_DIR     ?=
MIGRATE_DSN     ?=
# -dir/-dsn are only passed when set so the migrator can fall back to its
# driver-specific defaults (./migrations/<driver>) and config-based DSN.
MIGRATE_ARGS     = -driver $(MIGRATE_DRIVER) -env $(MIGRATE_ENV) \
                   $(if $(MIGRATE_DIR),-dir $(MIGRATE_DIR),) \
                   $(if $(MIGRATE_DSN),-dsn $(MIGRATE_DSN),)

## run: Run the API locally (APP_ENV=dev loads configs/dev.yaml)
run:
	@echo "▶ Running $(APP_NAME)..."
	APP_ENV=dev go run $(MAIN_FILE)

## run-log-processor: Consume logs from Kafka and write to ClickHouse
run-log-processor:
	@echo "▶ Running log processor (Kafka → ClickHouse)..."
	APP_ENV=dev go run ./cmd/log-processor

## run-embedding-worker: Consume logs from Kafka, embed via Ollama, store in Postgres
run-embedding-worker:
	@echo "▶ Running embedding worker (Ollama → Postgres pgvector)..."
	APP_ENV=dev go run ./cmd/embedding-worker

## build: Build the application binary
build:
	@echo "▶ Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 go build -ldflags="-w -s" -o $(BUILD_DIR)/server $(MAIN_FILE)

## test: Run all tests with coverage
test:
	@echo "▶ Running tests..."
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -func=coverage.out

## lint: Run the Go linter
lint:
	@echo "▶ Linting..."
	golangci-lint run ./...

## fmt: Format all Go source files
fmt:
	@echo "▶ Formatting..."
	gofmt -s -w .

## vet: Run go vet
vet:
	@echo "▶ Vetting..."
	go vet ./...

## mocks: Generate mocks via mockery (config: .mockery.yaml)
mocks:
	@echo "▶ Generating mocks..."
	mockery

## clean: Remove build artifacts
clean:
	@echo "▶ Cleaning..."
	@rm -rf $(BUILD_DIR) coverage.out

## docker-build: Build the Docker image
docker-build:
	@echo "▶ Building Docker image..."
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

## docker-run: Run the Docker container
docker-run:
	@echo "▶ Running Docker container..."
	docker run --rm -p 8080:8080 --env-file .env $(DOCKER_IMAGE):$(DOCKER_TAG)

# Capture words after `make migrate`/`migrate-ch` as the subcommand and declare
# them as no-op targets so make doesn't fail with "No rule to make target 'up'".
ifneq ($(filter migrate migrate-ch,$(firstword $(MAKECMDGOALS))),)
  MIGRATE_SUBCMD := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifneq ($(strip $(MIGRATE_SUBCMD)),)
    $(eval $(MIGRATE_SUBCMD):;@:)
  endif
endif

## migrate: Run a migrator command directly, e.g. `make migrate up` or `make migrate up-to 20260513034123`
migrate:
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) $(if $(strip $(MIGRATE_SUBCMD)),$(MIGRATE_SUBCMD),$(ARGS))

## migrate-up: Apply all pending Postgres migrations
migrate-up:
	@echo "▶ migrate up ($(MIGRATE_DRIVER), $(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) up

## migrate-up-by-one: Apply the next pending migration
migrate-up-by-one:
	@echo "▶ migrate up-by-one ($(MIGRATE_DRIVER), $(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) up-by-one

## migrate-down: Roll back the last migration
migrate-down:
	@echo "▶ migrate down ($(MIGRATE_DRIVER), $(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) down

## migrate-redo: Roll back the last migration, then re-apply it
migrate-redo:
	@echo "▶ migrate redo ($(MIGRATE_DRIVER), $(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) redo

## migrate-reset: Roll back ALL migrations (destructive!)
migrate-reset:
	@echo "▶ migrate reset ($(MIGRATE_DRIVER), $(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) reset

## migrate-status: Show migration status
migrate-status:
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) status

## migrate-version: Show current DB schema version
migrate-version:
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) version

## migrate-create: Create a new SQL migration. Usage: make migrate-create NAME=add_foo
migrate-create:
	@if [ -z "$(NAME)" ]; then echo "NAME is required, e.g. make migrate-create NAME=add_foo"; exit 1; fi
	@go run $(MIGRATOR_PKG) -driver $(MIGRATE_DRIVER) $(if $(MIGRATE_DIR),-dir $(MIGRATE_DIR),) create $(NAME) sql

## migrate-ch: Run a migrator command against ClickHouse, e.g. `make migrate-ch up` or `make migrate-ch up-to 20260503061402`
migrate-ch:
	@$(MAKE) migrate MIGRATE_DRIVER=clickhouse ARGS="$(if $(strip $(MIGRATE_SUBCMD)),$(MIGRATE_SUBCMD),$(ARGS))"

## migrate-up-ch: Apply all pending ClickHouse migrations
migrate-up-ch:
	@$(MAKE) migrate-up MIGRATE_DRIVER=clickhouse

## migrate-up-by-one-ch: Apply the next pending ClickHouse migration
migrate-up-by-one-ch:
	@$(MAKE) migrate-up-by-one MIGRATE_DRIVER=clickhouse

## migrate-down-ch: Roll back the last ClickHouse migration
migrate-down-ch:
	@$(MAKE) migrate-down MIGRATE_DRIVER=clickhouse

## migrate-redo-ch: Roll back then re-apply the last ClickHouse migration
migrate-redo-ch:
	@$(MAKE) migrate-redo MIGRATE_DRIVER=clickhouse

## migrate-reset-ch: Roll back ALL ClickHouse migrations (destructive!)
migrate-reset-ch:
	@$(MAKE) migrate-reset MIGRATE_DRIVER=clickhouse

## migrate-status-ch: Show ClickHouse migration status
migrate-status-ch:
	@$(MAKE) migrate-status MIGRATE_DRIVER=clickhouse

## migrate-version-ch: Show current ClickHouse schema version
migrate-version-ch:
	@$(MAKE) migrate-version MIGRATE_DRIVER=clickhouse

## migrate-create-ch: Create a new ClickHouse SQL migration. Usage: make migrate-create-ch NAME=add_foo
migrate-create-ch:
	@$(MAKE) migrate-create MIGRATE_DRIVER=clickhouse NAME=$(NAME)

## swagger: Generate Swagger documentation from Go code comments
swagger:
	@echo "▶ Generating Swagger documentation..."
	@go run github.com/swaggo/swag/cmd/swag init -g cmd/server/main.go -o docs/swagger

## help: Show this help message
help:
	@echo "Available targets:"
	@grep -E '^##' Makefile | sed 's/## /  /'
