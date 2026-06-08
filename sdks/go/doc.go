// Package logify is the official Go client for sending (ingesting) logs to a
// Logify backend.
//
// The package talks to the ingest endpoint (POST /v1/logs) and offers two
// modes of operation:
//
//   - Synchronous: each call to Send/Info/Error/... performs an HTTP request
//     and returns when the backend has accepted (or rejected) the log.
//   - Asynchronous: logs are buffered in memory and flushed by a pool of
//     background workers. Enable it with WithAsync and remember to call
//     Close so buffered logs are drained on shutdown.
//
// A minimal example:
//
//	client, err := logify.New(
//		logify.WithBaseURL("http://localhost:8080"),
//		logify.WithService("payment-api"),
//		logify.WithEnvironment("production"),
//	)
//	if err != nil {
//		log.Fatal(err)
//	}
//	defer client.Close(context.Background())
//
//	client.Info(context.Background(), "service started")
//	client.Error(context.Background(), "payment failed",
//		logify.WithEntryMetadata(map[string]any{"order.id": "order_998877"}),
//	)
//
// The package depends only on the standard library.
package logify
