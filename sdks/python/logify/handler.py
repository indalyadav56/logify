"""Bridge from the standard library :mod:`logging` to a Logify :class:`Client`.

Attach :class:`LogifyHandler` to any stdlib logger to ship its records to a
Logify backend::

    import logging, logify

    client = logify.Client(base_url="http://localhost:8080", async_=True)
    logging.getLogger().addHandler(logify.LogifyHandler(client))
    logging.getLogger().setLevel(logging.INFO)

    logging.info("hello from stdlib logging")
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from .client import Client
from .entry import DEBUG, ERROR, FATAL, INFO, TRACE, WARN, Entry

__all__ = ["LogifyHandler"]


def _map_level(levelno: int) -> str:
    if levelno >= logging.CRITICAL:
        return FATAL
    if levelno >= logging.ERROR:
        return ERROR
    if levelno >= logging.WARNING:
        return WARN
    if levelno >= logging.INFO:
        return INFO
    if levelno >= logging.DEBUG:
        return DEBUG
    return TRACE


class LogifyHandler(logging.Handler):
    """A :class:`logging.Handler` that forwards records to a Logify client.

    Args:
        client: The :class:`Client` to send through.
        level: Minimum stdlib level to handle (default ``logging.NOTSET``).
        use_try_send: When the client is async, enqueue with
            :meth:`Client.try_send` so logging never blocks; records are dropped
            (and reported via :meth:`handleError`) if the buffer is full.
    """

    def __init__(
        self,
        client: Client,
        level: int = logging.NOTSET,
        *,
        use_try_send: bool = False,
    ) -> None:
        super().__init__(level)
        self._client = client
        self._use_try_send = use_try_send

    def emit(self, record: logging.LogRecord) -> None:
        try:
            entry = self._to_entry(record)
            if self._use_try_send:
                self._client.try_send(entry)
            else:
                self._client.send(entry)
        except Exception:  # noqa: BLE001 - standard Handler error path
            self.handleError(record)

    def _to_entry(self, record: logging.LogRecord) -> Entry:
        metadata = {
            "logger": record.name,
            "module": record.module,
            "func": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            metadata["exception"] = self.formatException(record.exc_info)

        # Promote common LogRecord 'extra' attributes to first-class fields.
        request_id = _get(record, "request_id")
        trace_id = _get(record, "trace_id")
        span_id = _get(record, "span_id")
        user_id = _get(record, "user_id")
        service = _get(record, "service")
        tags = _get(record, "tags") or {}

        return Entry(
            level=_map_level(record.levelno),
            message=record.getMessage(),
            timestamp=datetime.fromtimestamp(record.created, tz=timezone.utc),
            service=service,
            request_id=request_id,
            trace_id=trace_id,
            span_id=span_id,
            user_id=user_id,
            tags=dict(tags) if isinstance(tags, dict) else {},
            metadata=metadata,
        )


def _get(record: logging.LogRecord, attr: str) -> Optional[object]:
    return getattr(record, attr, None)
