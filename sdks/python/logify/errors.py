"""Exceptions raised by the Logify client."""

from __future__ import annotations

__all__ = ["LogifyError", "ClientClosedError", "BufferFullError", "APIError"]


class LogifyError(Exception):
    """Base class for all errors raised by this package."""


class ClientClosedError(LogifyError):
    """Raised when sending on a client that has been closed."""

    def __init__(self, message: str = "logify: client is closed") -> None:
        super().__init__(message)


class BufferFullError(LogifyError):
    """Raised by :meth:`Client.try_send` when the async buffer has no free slot."""

    def __init__(self, message: str = "logify: async buffer is full") -> None:
        super().__init__(message)


class APIError(LogifyError):
    """A non-2xx response from the ingest endpoint.

    Attributes:
        status_code: The HTTP status returned by the backend.
        body: The raw response body (truncated by the client).
    """

    def __init__(self, status_code: int, body: str = "") -> None:
        self.status_code = status_code
        self.body = body
        super().__init__(
            f"logify: ingest failed with status {status_code}: {body}".rstrip(": ")
        )
