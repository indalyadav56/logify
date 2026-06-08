"""The Logify :class:`Client` — sends logs to a Logify backend."""

from __future__ import annotations

import json
import queue
import socket
import threading
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Callable, Dict, Mapping, Optional

from .entry import (
    DEBUG,
    ERROR,
    FATAL,
    INFO,
    TRACE,
    WARN,
    Entry,
)
from .errors import APIError, BufferFullError, ClientClosedError

__all__ = ["Client"]

DEFAULT_INGEST_PATH = "/v1/logs"
DEFAULT_SOURCE = "python"
DEFAULT_TIMEOUT = 10.0
DEFAULT_BUFFER_SIZE = 1024
DEFAULT_WORKERS = 4
DEFAULT_USER_AGENT = "logify-python"

# Sentinel pushed onto the queue to signal workers to stop.
_SHUTDOWN = object()


class Client:
    """Sends logs to a Logify backend. Safe for concurrent use.

    Construct one with :class:`Client`, reuse it for the lifetime of your
    application, and call :meth:`close` on shutdown (required when ``async_`` is
    enabled). The client is also a context manager::

        with logify.Client(base_url="http://localhost:8080") as log:
            log.info("service started")

    Args:
        base_url: Backend base URL, e.g. ``"http://localhost:8080"`` (required).
        api_key: Sent in the ``X-API-Key`` header on every request.
        ingest_path: Ingest path (default ``"/v1/logs"``).
        timeout: Per-request timeout in seconds (default ``10``).
        user_agent: Overrides the ``User-Agent`` header.
        project_id, service, namespace, environment, hostname, source:
            Defaults applied to entries that leave the field unset. ``hostname``
            falls back to :func:`socket.gethostname`; ``source`` to ``"python"``.
        tags: Tags merged into every entry (entry tags take precedence).
        async_: Enable background, buffered delivery via a worker thread pool.
        buffer_size: Async buffer capacity (default ``1024``).
        workers: Number of async sender threads (default ``4``).
        on_error: Callback ``(entry, exc)`` invoked when an async send fails.
            Without it, async errors are dropped silently.
    """

    def __init__(
        self,
        base_url: str,
        *,
        api_key: Optional[str] = None,
        ingest_path: str = DEFAULT_INGEST_PATH,
        timeout: float = DEFAULT_TIMEOUT,
        user_agent: str = DEFAULT_USER_AGENT,
        project_id: Optional[str] = None,
        service: Optional[str] = None,
        namespace: Optional[str] = None,
        environment: Optional[str] = None,
        hostname: Optional[str] = None,
        source: str = DEFAULT_SOURCE,
        tags: Optional[Mapping[str, str]] = None,
        async_: bool = False,
        buffer_size: int = DEFAULT_BUFFER_SIZE,
        workers: int = DEFAULT_WORKERS,
        on_error: Optional[Callable[[Entry, Exception], None]] = None,
    ) -> None:
        if not base_url or not base_url.strip():
            raise ValueError("logify: base_url is required")

        self._api_key = api_key
        self._timeout = timeout
        self._user_agent = user_agent
        self._on_error = on_error

        if hostname is None:
            try:
                hostname = socket.gethostname()
            except OSError:
                hostname = None

        self._defaults = Entry(
            level="",
            project_id=project_id,
            service=service,
            namespace=namespace,
            environment=environment,
            hostname=hostname,
            source=source,
            tags=dict(tags) if tags else {},
        )

        self._endpoint = (
            base_url.rstrip("/") + "/" + ingest_path.lstrip("/")
        )

        self._async = async_
        self._closed = False
        self._workers: list[threading.Thread] = []
        self._queue: "queue.Queue[Any]" = queue.Queue(
            maxsize=max(1, buffer_size) if async_ else 0
        )

        if async_:
            n = workers if workers > 0 else DEFAULT_WORKERS
            for i in range(n):
                t = threading.Thread(
                    target=self._worker,
                    name=f"logify-worker-{i}",
                    daemon=True,
                )
                t.start()
                self._workers.append(t)

    # -- public API ---------------------------------------------------------

    def send(self, entry: Entry) -> None:
        """Deliver a single entry.

        In synchronous mode this performs the HTTP request and raises on error.
        In async mode it enqueues the entry (blocking only if the buffer is
        full) and returns; delivery happens in the background.
        """
        entry = self._apply_defaults(entry)
        if not entry.level:
            raise ValueError("logify: entry level is required")

        if not self._async:
            self._send(entry)
            return

        if self._closed:
            raise ClientClosedError()
        self._queue.put(entry)

    def try_send(self, entry: Entry) -> None:
        """Buffer an entry without blocking (async mode only).

        Raises :class:`BufferFullError` if there is no free slot, or
        :class:`ClientClosedError` if the client is closed. In synchronous mode
        it behaves like :meth:`send`.
        """
        entry = self._apply_defaults(entry)
        if not entry.level:
            raise ValueError("logify: entry level is required")

        if not self._async:
            self._send(entry)
            return

        if self._closed:
            raise ClientClosedError()
        try:
            self._queue.put_nowait(entry)
        except queue.Full:
            raise BufferFullError() from None

    def log(self, level: str, message: str, **fields: Any) -> None:
        """Build an entry from ``level``, ``message`` and field kwargs, then send.

        Recognised keyword fields mirror :class:`Entry`: ``project_id``,
        ``timestamp``, ``service``, ``namespace``, ``hostname``,
        ``environment``, ``trace_id``, ``span_id``, ``request_id``,
        ``user_id``, ``source``, ``tags`` and ``metadata``.
        """
        self.send(_build_entry(level, message, fields))

    def trace(self, message: str, **fields: Any) -> None:
        """Log at ``TRACE`` level."""
        self.log(TRACE, message, **fields)

    def debug(self, message: str, **fields: Any) -> None:
        """Log at ``DEBUG`` level."""
        self.log(DEBUG, message, **fields)

    def info(self, message: str, **fields: Any) -> None:
        """Log at ``INFO`` level."""
        self.log(INFO, message, **fields)

    def warn(self, message: str, **fields: Any) -> None:
        """Log at ``WARN`` level."""
        self.log(WARN, message, **fields)

    warning = warn

    def error(self, message: str, **fields: Any) -> None:
        """Log at ``ERROR`` level."""
        self.log(ERROR, message, **fields)

    def fatal(self, message: str, **fields: Any) -> None:
        """Log at ``FATAL`` level."""
        self.log(FATAL, message, **fields)

    def close(self, timeout: Optional[float] = None) -> None:
        """Stop async workers and drain buffered logs.

        Returns when the buffer is empty or ``timeout`` seconds elapse. Safe to
        call multiple times; a no-op in synchronous mode.
        """
        if not self._async or self._closed:
            return
        self._closed = True
        for _ in self._workers:
            self._queue.put(_SHUTDOWN)
        deadline = None
        if timeout is not None:
            deadline = _monotonic() + timeout
        for t in self._workers:
            remaining = None
            if deadline is not None:
                remaining = max(0.0, deadline - _monotonic())
            t.join(remaining)

    def __enter__(self) -> "Client":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()

    # -- internals ----------------------------------------------------------

    def _apply_defaults(self, e: Entry) -> Entry:
        d = self._defaults
        if e.project_id is None:
            e.project_id = d.project_id
        if e.service is None:
            e.service = d.service
        if e.namespace is None:
            e.namespace = d.namespace
        if e.environment is None:
            e.environment = d.environment
        if e.hostname is None:
            e.hostname = d.hostname
        if e.source is None:
            e.source = d.source
        if e.timestamp is None:
            e.timestamp = datetime.now(timezone.utc)
        if d.tags:
            merged = dict(d.tags)
            merged.update(e.tags)  # entry tags win
            e.tags = merged
        return e

    def _worker(self) -> None:
        while True:
            item = self._queue.get()
            try:
                if item is _SHUTDOWN:
                    return
                try:
                    self._send(item)
                except Exception as exc:  # noqa: BLE001 - reported via callback
                    if self._on_error is not None:
                        try:
                            self._on_error(item, exc)
                        except Exception:  # noqa: BLE001 - never let it escape
                            pass
            finally:
                self._queue.task_done()

    def _send(self, entry: Entry) -> None:
        body = json.dumps(entry.to_wire()).encode("utf-8")
        req = urllib.request.Request(self._endpoint, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json")
        if self._user_agent:
            req.add_header("User-Agent", self._user_agent)
        if self._api_key:
            req.add_header("X-API-Key", self._api_key)

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                resp.read()  # drain so the connection can be reused
        except urllib.error.HTTPError as exc:
            snippet = ""
            try:
                snippet = exc.read(4096).decode("utf-8", "replace").strip()
            except Exception:  # noqa: BLE001
                pass
            raise APIError(exc.code, snippet) from None
        except urllib.error.URLError as exc:
            raise APIError(0, str(exc.reason)) from exc


_ENTRY_FIELDS = {
    "project_id",
    "timestamp",
    "service",
    "namespace",
    "hostname",
    "environment",
    "trace_id",
    "span_id",
    "request_id",
    "user_id",
    "source",
    "tags",
    "metadata",
}


def _build_entry(level: str, message: str, fields: Dict[str, Any]) -> Entry:
    unknown = set(fields) - _ENTRY_FIELDS
    if unknown:
        raise TypeError(
            "logify: unknown log field(s): " + ", ".join(sorted(unknown))
        )
    return Entry(level=level, message=message, **fields)


def _monotonic() -> float:
    import time

    return time.monotonic()
