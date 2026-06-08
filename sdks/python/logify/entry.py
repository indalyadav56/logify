"""The :class:`Entry` log record and severity levels."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

__all__ = [
    "Level",
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL",
    "Entry",
]


class Level(str):
    """Severity of a log entry.

    The backend stores the value verbatim, so any string is accepted; the
    constants below cover the common cases. ``Level`` subclasses ``str`` so it
    can be used anywhere a plain string is expected.
    """


TRACE = Level("TRACE")
DEBUG = Level("DEBUG")
INFO = Level("INFO")
WARN = Level("WARN")
ERROR = Level("ERROR")
FATAL = Level("FATAL")


@dataclass
class Entry:
    """A single log record to be ingested.

    ``level`` is the only field the backend requires. Fields left at their
    default (``None`` / empty) are filled in from the client's defaults when the
    entry is sent. If ``timestamp`` is ``None`` the current time is used.
    """

    level: str
    message: str = ""
    project_id: Optional[str] = None
    timestamp: Optional[datetime] = None
    service: Optional[str] = None
    #: Logical grouping within a service (wire field: ``service_namespace``).
    namespace: Optional[str] = None
    hostname: Optional[str] = None
    environment: Optional[str] = None
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    request_id: Optional[str] = None
    user_id: Optional[str] = None
    #: Identifies the log producer, e.g. ``"python"``.
    source: Optional[str] = None
    #: Low-cardinality string labels.
    tags: Dict[str, str] = field(default_factory=dict)
    #: Arbitrary structured context.
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_wire(self) -> Dict[str, Any]:
        """Render the entry as the JSON dict expected by ``POST /v1/logs``.

        Empty optional fields are omitted to mirror the Go SDK's ``omitempty``.
        """
        wire: Dict[str, Any] = {"level": str(self.level)}

        def put(key: str, value: Any) -> None:
            if value:
                wire[key] = value

        put("project_id", self.project_id)
        put("service", self.service)
        put("service_namespace", self.namespace)
        put("hostname", self.hostname)
        put("environment", self.environment)
        put("message", self.message)
        put("trace_id", self.trace_id)
        put("span_id", self.span_id)
        put("request_id", self.request_id)
        put("user_id", self.user_id)
        put("source", self.source)
        put("tags", self.tags)
        put("metadata", self.metadata)

        if self.timestamp is not None:
            ts = self.timestamp
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            wire["timestamp"] = (
                ts.astimezone(timezone.utc)
                .isoformat()
                .replace("+00:00", "Z")
            )
        return wire
