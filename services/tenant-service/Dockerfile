# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o main cmd/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/internal/infrastructure/postgres/migrations ./internal/infrastructure/postgres/migrations

EXPOSE 8083
EXPOSE 50053

CMD ["./main"]
