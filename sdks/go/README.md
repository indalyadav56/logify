# Logify Go SDK

Official Go client for sending (ingesting) logs to a [Logify](../../) backend.
It posts to the ingest endpoint (`POST /v1/logs`) and supports both synchronous
and buffered asynchronous delivery. **Standard library only — no dependencies.**

## Install

```bash
go get github.com/indalyadav56/logify/sdks/go
```

```go
import logify "github.com/indalyadav56/logify/sdks/go"
```

## Quick start

```go
client, err := logify.New(
    logify.WithBaseURL("http://localhost:8080"),
    logify.WithService("payment-api"),
    logify.WithEnvironment("production"),
)
if err != nil {
    log.Fatal(err)
}

ctx := context.Background()
client.Info(ctx, "service started")
client.Error(ctx, "payment failed",
    logify.WithEntryTrace("4bf92f...", "00f067..."),
    logify.WithEntryMetadata(map[string]any{"order.id": "order_998877"}),
)
```

## Asynchronous (buffered) delivery

Enable `WithAsync` to enqueue logs in memory and deliver them from a pool of
background workers. Calls return immediately; **call `Close` on shutdown** to
flush the buffer.

```go
client, _ := logify.New(
    logify.WithBaseURL("http://localhost:8080"),
    logify.WithAsync(true),
    logify.WithWorkers(4),
    logify.WithBufferSize(2048),
    logify.WithErrorHandler(func(e logify.Entry, err error) {
        log.Printf("dropped log %q: %v", e.Message, err)
    }),
)
defer func() {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    client.Close(ctx)
}()

client.Info(context.Background(), "request handled")          // never blocks on I/O
client.TrySend(logify.Entry{Level: logify.LevelInfo, Message: "x"}) // non-blocking, returns ErrBufferFull when full
```

## Client options

| Option | Description |
| --- | --- |
| `WithBaseURL(url)` | Backend base URL (**required**). |
| `WithIngestPath(path)` | Override the ingest path (default `/v1/logs`). |
| `WithAPIKey(key)` | Sent as the `X-API-Key` header. |
| `WithHTTPClient(c)` | Use a custom `*http.Client`. |
| `WithTimeout(d)` | Per-request timeout (default 10s). |
| `WithUserAgent(ua)` | Override the `User-Agent` header. |
| `WithProjectID` / `WithService` / `WithNamespace` / `WithEnvironment` / `WithHostname` / `WithSource` | Defaults applied to every entry. |
| `WithDefaultTags(map)` | Tags merged into every entry (entry tags win). |
| `WithAsync(bool)` | Enable buffered background delivery. |
| `WithWorkers(n)` | Async sender goroutines (default 4). |
| `WithBufferSize(n)` | Async buffer capacity (default 1024). |
| `WithErrorHandler(fn)` | Callback for async delivery failures. |

Defaults fill any field left empty on an `Entry`; the hostname falls back to
`os.Hostname()`, the source to `"golang"`, and the timestamp to `time.Now()`.

## Sending logs

Convenience helpers — `Trace`, `Debug`, `Info`, `Warn`, `Error`, `Fatal` — build
an entry from a message plus per-entry options:

```go
client.Warn(ctx, "high latency",
    logify.WithEntryNamespace("checkout"),
    logify.WithEntryRequestID("req_123"),
    logify.WithEntryUserID("user_987"),
    logify.WithEntryTag("cluster", "eks-prod"),
    logify.WithEntryMetadataValue("latency_ms", 1820),
)
```

Or build the full record yourself and call `Send`:

```go
client.Send(ctx, logify.Entry{
    Level:     logify.LevelError,
    Message:   "payment failed",
    Timestamp: time.Now(),
    TraceID:   "4bf92f...",
    Tags:      map[string]string{"region": "ap-south-1"},
    Metadata:  map[string]any{"http.status_code": 500},
})
```

`Level` is the only required field. The backend accepts any level string;
`LevelTrace`/`LevelDebug`/`LevelInfo`/`LevelWarn`/`LevelError`/`LevelFatal`
cover the common cases.

## Error handling

- Synchronous `Send`/helpers return the delivery error directly. A non-2xx
  response is returned as `*logify.APIError` (with `StatusCode` and `Body`).
- Async mode reports failures through `WithErrorHandler`; `Send` returns once the
  entry is buffered. After `Close`, sends return `logify.ErrClosed`.
- `TrySend` returns `logify.ErrBufferFull` when the async buffer is saturated.

## Example program

A runnable example lives in [`cmd/example`](./cmd/example):

```bash
LOGIFY_URL=http://localhost:8080 go run ./cmd/example
```

## Tests

```bash
go test -race ./...
```
