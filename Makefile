
# Project variables
BINARY_NAME := myapp
PKG := ./...

# Go commands
GO := go
GOFMT := gofmt

.PHONY: all build run test fmt lint clean tidy tools ci swagger run-test

# Default target
all: build

# Build the binary
build:
	$(GO) build -o $(BINARY_NAME)

# Run the application
run: build
	./$(BINARY_NAME)

# Run the API
run-api:
	$(GO) run cmd/api/main.go

# Generate Swagger documentation
swagger:
	swag init -g ./cmd/api/main.go -o ./docs
	
#swag init -o ./docs -d ./cmd/api

# Run tests with coverage
run-test:
	GIN_MODE=test $(GO) test -v -cover -coverprofile=coverage.out $(PKG)

# Test the code
test:
	$(GO) test -v $(PKG)

# Format the code
fmt:
	$(GOFMT) -s -w .

# Lint the code
lint:
	golangci-lint run

# Clean up build files
clean:
	rm -f $(BINARY_NAME)

# Tidy dependencies
tidy:
	$(GO) mod tidy

# Install necessary Go tools
tools:
	$(GO) install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run all the tests and check formatting
ci: fmt test lint

# goose migrations
goose-create-new:
	goose -dir ./migrations create $(MIGRATION_NAME) sql

create_migration:
	@read -p "Enter migration name: " name; \
	goose -dir ./migrations create $$name sql

goose-up:
	@GOOSE_DRIVER=postgres GOOSE_DBSTRING="postgres://$(POSTGRES_USER_NAME):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):5432/$(POSTGRES_DATABASE)?sslmode=disable" goose -dir='./migrations' up

goose-up-by-one:
	@GOOSE_DRIVER=postgres GOOSE_DBSTRING="postgres://$(POSTGRES_USER_NAME):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):5432/$(POSTGRES_DATABASE)?sslmode=disable" goose -dir='./migrations' up-by-one

goose-down:
	@GOOSE_DRIVER=postgres GOOSE_DBSTRING="postgres://$(POSTGRES_USER_NAME):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):5432/$(POSTGRES_DATABASE)?sslmode=disable" goose -dir='./migrations' down

goose-down-to:
	goose -dir=./migrations postgres "$(DB_STRING)" down-to $(VERSION)

goose-status:
	goose -dir=./migrations postgres "$(DB_STRING)" status

goose-version:
	@GOOSE_DRIVER=postgres GOOSE_DBSTRING="postgres://$(POSTGRES_USER_NAME):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):5432/$(POSTGRES_DATABASE)?sslmode=disable" goose -dir='./migrations' version