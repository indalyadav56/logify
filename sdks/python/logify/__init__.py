"""Logify — Python client for sending logs to a Logify backend.

Quick start::

    import logify

    with logify.Client(base_url="http://localhost:8080", api_key="...") as log:
        log.info("user signed in", user_id="u_42", tags={"plan": "pro"})
        log.error("payment failed", metadata={"amount": 19.99})

See :class:`Client` for configuration and :class:`LogifyHandler` to bridge the
standard library :mod:`logging` module.
"""

from __future__ import annotations

from .client import Client
from .entry import (
    DEBUG,
    ERROR,
    FATAL,
    INFO,
    TRACE,
    WARN,
    Entry,
    Level,
)
from .errors import (
    APIError,
    BufferFullError,
    ClientClosedError,
    LogifyError,
)
from .handler import LogifyHandler

__version__ = "0.1.0"

__all__ = [
    "Client",
    "Entry",
    "Level",
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL",
    "LogifyHandler",
    "LogifyError",
    "APIError",
    "BufferFullError",
    "ClientClosedError",
    "__version__",
]
