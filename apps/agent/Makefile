# logify-agent build targets
BINARY      := logify-agent
VERSION     ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
LDFLAGS     := -s -w -X main.version=$(VERSION)
DIST        := dist
PLATFORMS   := linux/amd64 linux/arm64 darwin/amd64 darwin/arm64

export CGO_ENABLED=0

.PHONY: build install test vet clean dist

## build: compile for the current machine
build:
	go build -ldflags "$(LDFLAGS)" -o $(BINARY) .

## install: build and copy to /usr/local/bin (needs sudo)
install: build
	install -m 0755 $(BINARY) /usr/local/bin/$(BINARY)

## test: run unit tests
test:
	go test ./...

## vet: static checks
vet:
	go vet ./...

## dist: cross-compile static binaries for every supported platform
dist:
	@mkdir -p $(DIST)
	@for p in $(PLATFORMS); do \
		os=$${p%/*}; arch=$${p#*/}; \
		out=$(DIST)/$(BINARY)-$$os-$$arch; \
		echo "building $$out"; \
		GOOS=$$os GOARCH=$$arch go build -ldflags "$(LDFLAGS)" -o $$out . || exit 1; \
	done
	@echo "artifacts in $(DIST)/ (version $(VERSION))"

## clean: remove build artifacts
clean:
	rm -rf $(BINARY) $(DIST)
