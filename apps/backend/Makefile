.PHONY: run build test lint clean docker-build docker-run fmt vet mocks \
        migrate migrate-up migrate-up-by-one migrate-down migrate-redo \
        migrate-reset migrate-status migrate-version migrate-create

# Application
APP_NAME     := logify-backend
BUILD_DIR    := ./bin
MAIN_FILE    := ./cmd/server/main.go

# Docker
DOCKER_IMAGE := logify-backend
DOCKER_TAG   := latest

# Migrations
MIGRATOR_PKG := ./cmd/migrator
MIGRATE_ENV  ?= local
MIGRATE_DIR  ?= ./migrations/postgres
MIGRATE_DSN  ?=
MIGRATE_ARGS  = -dir $(MIGRATE_DIR) -env $(MIGRATE_ENV) $(if $(MIGRATE_DSN),-dsn $(MIGRATE_DSN),)

## run: Run the API locally (APP_ENV=local matches docker compose defaults in configs/local.yaml)
run:
	@echo "▶ Running $(APP_NAME)..."
	APP_ENV=local LOG_FORMAT=console go run $(MAIN_FILE)

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

# ---------------------------------------------------------------------------
# Migrations (Postgres, via cmd/migrator + goose)
#
# Override DSN/env/dir from the command line, e.g.
#   make migrate-up MIGRATE_ENV=dev
#   make migrate-up MIGRATE_DSN='postgres://user:pass@host:5432/db?sslmode=disable'
#   make migrate-create NAME=add_user_indexes
# ---------------------------------------------------------------------------

## migrate: Run a raw migrator command (e.g. `make migrate ARGS="up-to 20260513034123"`)
migrate:
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) $(ARGS)

## migrate-up: Apply all pending Postgres migrations
migrate-up:
	@echo "▶ migrate up ($(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) up

## migrate-up-by-one: Apply the next pending migration
migrate-up-by-one:
	@echo "▶ migrate up-by-one ($(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) up-by-one

## migrate-down: Roll back the last migration
migrate-down:
	@echo "▶ migrate down ($(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) down

## migrate-redo: Roll back the last migration, then re-apply it
migrate-redo:
	@echo "▶ migrate redo ($(MIGRATE_ENV))"
	@go run $(MIGRATOR_PKG) $(MIGRATE_ARGS) redo

## migrate-reset: Roll back ALL migrations (destructive!)
migrate-reset:
	@echo "▶ migrate reset ($(MIGRATE_ENV))"
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
	@go run $(MIGRATOR_PKG) -dir $(MIGRATE_DIR) create $(NAME) sql

## help: Show this help message
help:
	@echo "Available targets:"
	@grep -E '^##' Makefile | sed 's/## /  /'
