# Logify Python SDK

A small, dependency-free Python client for sending logs to a [Logify](../../) backend.
It posts to the backend's `POST /v1/logs` ingest endpoint and mirrors the
[Go SDK](../go) field-for-field.

- **Zero runtime dependencies** — uses only the standard library.
- **Sync or async** delivery (background worker-thread pool).
- **Per-client defaults** (service, environment, tags, …) applied to every entry.
- **`logging` bridge** — ship records from the stdlib `logging` module.

## Install

```bash
pip install logify-sdk
# or, from a checkout:
pip install ./sdks/python
```

Requires Python 3.8+.

## Quick start

```python
import logify

with logify.Client(
    base_url="http://localhost:8080",
    api_key="your-api-key",          # sent as the X-API-Key header
    service="checkout",
    environment="production",
    tags={"team": "payments"},        # merged into every entry
) as log:
    log.info("user signed in", user_id="u_42", tags={"plan": "pro"})
    log.error("payment failed", metadata={"amount": 19.99, "currency": "USD"})
```

`base_url` is the only required argument. The client fills `hostname`
(via `socket.gethostname()`), `source` (`"python"`), and `timestamp` (now, UTC)
automatically when you don't set them.

## Logging levels

Convenience methods cover the standard levels:

```python
log.trace("entering handler")
log.debug("cache miss", tags={"key": "user:42"})
log.info("request handled")
log.warn("retrying upstream")     # warning() is an alias
log.error("unhandled exception")
log.fatal("shutting down")
```

Or send a fully-built entry:

```python
from logify import Entry, INFO

log.send(Entry(level=INFO, message="hello", trace_id="abc", span_id="123"))
```

## Entry fields

`log.<level>(message, **fields)` accepts these keyword fields (all optional):

| field          | wire JSON            | notes                                   |
| -------------- | -------------------- | --------------------------------------- |
| `project_id`   | `project_id`         |                                         |
| `timestamp`    | `timestamp`          | `datetime`; serialized as RFC 3339 UTC  |
| `service`      | `service`            | overrides the client default            |
| `namespace`    | `service_namespace`  | logical grouping within a service       |
| `hostname`     | `hostname`           |                                         |
| `environment`  | `environment`        |                                         |
| `trace_id`     | `trace_id`           |                                         |
| `span_id`      | `span_id`            |                                         |
| `request_id`   | `request_id`         |                                         |
| `user_id`      | `user_id`            |                                         |
| `source`       | `source`             | defaults to `"python"`                  |
| `tags`         | `tags`               | `dict[str, str]`; merged over defaults  |
| `metadata`     | `metadata`           | arbitrary JSON-serializable `dict`      |

## Async delivery

Enable background, buffered delivery so logging never blocks on the network.
Call `close()` on shutdown to drain the buffer (the context manager does this
for you):

```python
client = logify.Client(
    base_url="http://localhost:8080",
    async_=True,
    workers=4,          # sender threads
    buffer_size=1024,   # queued entries
    on_error=lambda entry, exc: print("logify drop:", exc),
)

client.info("background log")
client.try_send(logify.Entry(level="INFO", message="non-blocking"))  # raises BufferFullError if full
client.close(timeout=5)
```

## Bridge the standard `logging` module

Attach `LogifyHandler` to any stdlib logger to forward its records:

```python
import logging, logify

client = logify.Client(base_url="http://localhost:8080", async_=True)
logging.getLogger().addHandler(logify.LogifyHandler(client, use_try_send=True))
logging.getLogger().setLevel(logging.INFO)

logging.info("hello from stdlib logging", extra={"request_id": "req-1"})
```

Python levels map to Logify levels (`CRITICAL→FATAL`, `ERROR→ERROR`,
`WARNING→WARN`, `INFO→INFO`, `DEBUG→DEBUG`, below→`TRACE`). The record's
logger name, module, function, and line land in `metadata`; `request_id`,
`trace_id`, `span_id`, `user_id`, `service`, and `tags` passed via `extra=`
are promoted to first-class fields.

## Errors

- `logify.APIError` — non-2xx response (`.status_code`, `.body`); network
  failures surface as `APIError` with `status_code == 0`.
- `logify.BufferFullError` — `try_send` when the async buffer is full.
- `logify.ClientClosedError` — sending after `close()`.

All inherit from `logify.LogifyError`. In async mode send failures don't raise;
register `on_error` to observe them.

## Development

```bash
pip install -e ".[dev]"
pytest
```
