"""Tests for the Logify Python client.

These spin up a real ``http.server`` on localhost to capture requests, so no
network access or mocking library is required.
"""

from __future__ import annotations

import json
import logging
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

import logify


class _Capture(BaseHTTPRequestHandler):
    received: list[dict] = []
    headers_seen: list[dict] = []
    status = 202

    def do_POST(self):  # noqa: N802 - required name
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        type(self).received.append(json.loads(body))
        type(self).headers_seen.append(dict(self.headers))
        self.send_response(type(self).status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"message":"log received"}')

    def log_message(self, *args):  # silence server logging
        pass


@pytest.fixture
def server():
    _Capture.received = []
    _Capture.headers_seen = []
    _Capture.status = 202
    httpd = HTTPServer(("127.0.0.1", 0), _Capture)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    host, port = httpd.server_address
    yield f"http://{host}:{port}", _Capture
    httpd.shutdown()


def test_sync_send_shapes_wire_payload(server):
    base_url, cap = server
    client = logify.Client(
        base_url=base_url,
        api_key="secret",
        service="checkout",
        environment="production",
        source="python",
        tags={"team": "payments"},
    )
    client.info(
        "user signed in",
        user_id="u_42",
        namespace="auth",
        tags={"plan": "pro"},
        metadata={"amount": 19.99},
    )

    assert len(cap.received) == 1
    body = cap.received[0]
    assert body["level"] == "INFO"
    assert body["message"] == "user signed in"
    assert body["service"] == "checkout"
    assert body["environment"] == "production"
    assert body["service_namespace"] == "auth"
    assert body["user_id"] == "u_42"
    assert body["source"] == "python"
    # default tags merged, entry tags win / coexist
    assert body["tags"] == {"team": "payments", "plan": "pro"}
    assert body["metadata"] == {"amount": 19.99}
    assert "timestamp" in body
    assert cap.headers_seen[0]["X-API-Key"] == "secret"


def test_level_helpers(server):
    base_url, cap = server
    client = logify.Client(base_url=base_url)
    client.trace("t")
    client.debug("d")
    client.warn("w")
    client.error("e")
    client.fatal("f")
    levels = [r["level"] for r in cap.received]
    assert levels == ["TRACE", "DEBUG", "WARN", "ERROR", "FATAL"]


def test_explicit_timestamp_is_rfc3339_utc(server):
    base_url, cap = server
    client = logify.Client(base_url=base_url)
    ts = datetime(2026, 6, 8, 12, 30, 0, tzinfo=timezone.utc)
    client.info("hi", timestamp=ts)
    assert cap.received[0]["timestamp"] == "2026-06-08T12:30:00Z"


def test_api_error_raised_on_non_2xx(server):
    base_url, cap = server
    cap.status = 400
    client = logify.Client(base_url=base_url)
    with pytest.raises(logify.APIError) as exc:
        client.info("boom")
    assert exc.value.status_code == 400


def test_unknown_field_rejected(server):
    base_url, _ = server
    client = logify.Client(base_url=base_url)
    with pytest.raises(TypeError):
        client.info("x", not_a_field=1)


def test_base_url_required():
    with pytest.raises(ValueError):
        logify.Client(base_url="")


def test_async_delivery_drains_on_close(server):
    base_url, cap = server
    client = logify.Client(base_url=base_url, async_=True, workers=2)
    for i in range(20):
        client.info("msg", metadata={"i": i})
    client.close(timeout=5)
    assert len(cap.received) == 20


def test_try_send_raises_when_buffer_full():
    # Point at an unroutable address so sends hang and the buffer fills.
    client = logify.Client(
        base_url="http://127.0.0.1:9",
        async_=True,
        workers=1,
        buffer_size=1,
        timeout=5,
    )
    raised = False
    for _ in range(100):
        try:
            client.try_send(logify.Entry(level="INFO", message="x"))
        except logify.BufferFullError:
            raised = True
            break
    assert raised
    client.close(timeout=0.1)


def test_logging_handler_bridge(server):
    base_url, cap = server
    client = logify.Client(base_url=base_url)
    logger = logging.getLogger("test.bridge")
    logger.setLevel(logging.DEBUG)
    handler = logify.LogifyHandler(client)
    logger.addHandler(handler)
    try:
        logger.warning("disk almost full", extra={"request_id": "req-1"})
    finally:
        logger.removeHandler(handler)

    assert len(cap.received) == 1
    body = cap.received[0]
    assert body["level"] == "WARN"
    assert body["message"] == "disk almost full"
    assert body["request_id"] == "req-1"
    assert body["metadata"]["logger"] == "test.bridge"
