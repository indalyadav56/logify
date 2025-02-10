
FROM golang:1.23.1-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy
RUN go build -o /backend cmd/api/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /backend .
COPY .env /root/.env
COPY migrations/ /root/migrations/
EXPOSE 8080
CMD ["./backend"]

