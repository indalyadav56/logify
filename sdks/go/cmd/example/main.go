// Command example demonstrates the logify Go SDK against a running backend.
//
// Usage:
//
//	LOGIFY_URL=http://localhost:8080 go run ./cmd/example
package main

import (
	"context"
	"log"
	"os"
	"time"

	logify "github.com/indalyadav56/logify/sdks/go"
)

func main() {
	baseURL := os.Getenv("LOGIFY_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	client, err := logify.New(
		logify.WithBaseURL(baseURL),
		logify.WithAPIKey(os.Getenv("LOGIFY_API_KEY")),
		logify.WithProjectID("ecommerce-prod"),
		logify.WithService("payment-api"),
		logify.WithNamespace("checkout"),
		logify.WithEnvironment("production"),
		logify.WithDefaultTags(map[string]string{
			"region":  "ap-south-1",
			"version": "v1.4.2",
		}),
		// Buffer logs and deliver them from background workers.
		logify.WithAsync(true),
		logify.WithWorkers(4),
		logify.WithErrorHandler(func(e logify.Entry, err error) {
			log.Printf("failed to deliver log %q: %v", e.Message, err)
		}),
	)
	if err != nil {
		log.Fatalf("init logify: %v", err)
	}
	// Drain buffered logs before exiting.
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Close(ctx); err != nil {
			log.Printf("flush on close: %v", err)
		}
	}()

	ctx := context.Background()

	client.Info(ctx, "service started")

	client.Error(ctx, "Payment processing failed due to timeout",
		logify.WithEntryTrace("4bf92f3577b34da6a3ce929d0e0e4736", "00f067aa0ba902b7"),
		logify.WithEntryRequestID("req_123456789"),
		logify.WithEntryUserID("user_98765"),
		logify.WithEntryMetadata(map[string]any{
			"http.method":      "POST",
			"http.route":       "/payments",
			"http.status_code": 500,
			"order.id":         "order_998877",
			"retry_count":      2,
			"exception.type":   "TimeoutException",
		}),
	)

	// Fully-specified entry via Send.
	client.Send(ctx, logify.Entry{
		Level:     logify.LevelWarn,
		Message:   "high latency detected",
		Timestamp: time.Now(),
		Metadata:  map[string]any{"latency_ms": 1820},
	})

	log.Println("logs enqueued; flushing on exit")
}
