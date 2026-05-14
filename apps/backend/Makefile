.PHONY: run build test lint clean docker-build docker-run migrate-up migrate-down fmt vet mocks

# Application
APP_NAME     := logify-backend
BUILD_DIR    := ./bin
MAIN_FILE    := ./cmd/server/main.go

# Docker
DOCKER_IMAGE := logify-backend
DOCKER_TAG   := latest

# Database
MIGRATE_DSN  ?= "postgres://postgres:postgres@localhost:5433/logify?sslmode=disable"

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

## migrate-up: Run database migrations (up)
migrate-up:
	@echo "▶ Running migrations (up)..."
	migrate -path ./migrations -database $(MIGRATE_DSN) up

## migrate-down: Run database migrations (down)
migrate-down:
	@echo "▶ Running migrations (down)..."
	migrate -path ./migrations -database $(MIGRATE_DSN) down 1

## help: Show this help message
help:
	@echo "Available targets:"
	@grep -E '^##' Makefile | sed 's/## /  /'



# GOOSE_DRIVER=postgres \
# GOOSE_DBSTRING="postgres://user:pass@localhost:5432/logify?sslmode=disable" \
# GOOSE_MIGRATION_DIR=./migrations/postgres \
# goose up


# GOOSE_DRIVER=clickhouse \
# GOOSE_DBSTRING="tcp://default:mypassword@localhost:9000/logify" \
# GOOSE_MIGRATION_DIR=./migrations/clickhouse \
# goose up

# goose -dir migrations/clickhouse create create_logs sql
# goose -dir migrations/postgres create create_users sql


# Apply
# goose -dir migrations/clickhouse clickhouse "tcp://default:mypassword@localhost:9000/logify" up

# # Check status
# goose -dir migrations/clickhouse clickhouse "tcp://default:mypassword@localhost:9000/logify" status

# # Rollback last one
# goose -dir migrations/clickhouse clickhouse "tcp://default:mypassword@localhost:9000/logify" down