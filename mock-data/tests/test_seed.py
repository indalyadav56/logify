from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "seed.py"
DEFAULT_ID = "11111111-1111-4111-8111-111111111111"
OTHER_ID = "22222222-2222-4222-8222-222222222222"


class SeedScriptTests(unittest.TestCase):
    def setUp(self):
        self.requests = []
        self.ingest_status = 202
        self.project_status = 200
        self.api_key_headers = []
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass

            def respond(self, status, data):
                body = json.dumps(data).encode()
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_GET(self):
                owner.requests.append(("GET", self.path, self.headers.get("Authorization"), None))
                if self.path == "/v1/projects":
                    if owner.project_status != 200:
                        self.respond(owner.project_status, {"error": "expired token"})
                        return
                    self.respond(200, {"success": True, "data": [
                        {"id": OTHER_ID, "name": "other-project"},
                        {"id": DEFAULT_ID, "name": "default-project"},
                    ]})
                else:
                    self.respond(404, {"error": "not found"})

            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                owner.requests.append(("POST", self.path, self.headers.get("Authorization"), body))
                owner.api_key_headers.append(self.headers.get("X-API-Key"))
                if self.path == "/v1/auth/login":
                    self.respond(200, {"success": True, "data": {"access_token": "fixture-token"}})
                elif self.path == "/v1/logs":
                    self.respond(owner.ingest_status, {"message": "log received"} if owner.ingest_status == 202 else {"error": "simulated Kafka failure"})
                else:
                    self.respond(404, {"error": "unexpected mutation"})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.server.server_port}"
        self.addCleanup(self.stop_server)

    def stop_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)

    def run_script(self, *args, extra_env=None):
        env = {key: value for key, value in os.environ.items() if not key.startswith("LOGIFY_")}
        env.update(extra_env or {})
        return subprocess.run(
            [sys.executable, str(SCRIPT), "--base-url", self.base_url, *args],
            env=env, capture_output=True, text=True, timeout=15,
        )

    def events(self):
        return [body for method, path, auth, body in self.requests if path == "/v1/logs"]

    def test_login_uses_backend_default_project_and_recent_events(self):
        before = datetime.now(timezone.utc)
        result = self.run_script("--email", "demo@example.test", "--count", "8", "--minutes", "10",
                                 extra_env={"LOGIFY_PASSWORD": "fixture-password"})
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("Accepted 8/8", result.stdout)
        self.assertNotIn("fixture-password", result.stdout + result.stderr)
        self.assertNotIn("fixture-token", result.stdout + result.stderr)
        self.assertEqual(1, sum(path == "/v1/auth/login" for _, path, _, _ in self.requests))
        self.assertEqual({"/v1/auth/login", "/v1/projects", "/v1/logs"}, {r[1] for r in self.requests})
        events = self.events()
        self.assertEqual(8, len(events))
        self.assertEqual(8, len({event["request_id"] for event in events}))
        for event in events:
            self.assertEqual(DEFAULT_ID, event["project_id"])
            self.assertEqual("mock-data", event["source"])
            self.assertEqual("true", event["tags"]["mock"])
            self.assertEqual("logify-demo", event["tags"]["dataset"])
            self.assertNotIn("tenant_id", event)
            timestamp = datetime.fromisoformat(event["timestamp"].replace("Z", "+00:00"))
            self.assertGreaterEqual(timestamp, before - timedelta(minutes=10, seconds=1))
            self.assertLessEqual(timestamp, datetime.now(timezone.utc))
        for _, path, auth, _ in self.requests:
            if path != "/v1/auth/login":
                self.assertEqual("Bearer fixture-token", auth)

    def test_token_and_explicit_project_skip_login(self):
        result = self.run_script("--project-id", OTHER_ID, "--count", "4",
                                 extra_env={"LOGIFY_ACCESS_TOKEN": "fixture-token"})
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(4, len(self.events()))
        self.assertTrue(all(event["project_id"] == OTHER_ID for event in self.events()))
        self.assertFalse(any(path == "/v1/auth/login" for _, path, _, _ in self.requests))

    def test_unknown_project_fails_before_writes(self):
        result = self.run_script("--token", "fixture-token", "--project-id", "33333333-3333-4333-8333-333333333333")
        self.assertEqual(1, result.returncode)
        self.assertIn("not found in this account", result.stderr)
        self.assertEqual([], self.events())

    def test_api_key_skips_login_and_project_lookup(self):
        result = self.run_script("--count", "4", extra_env={"LOGIFY_API_KEY": "fixture-api-key"})
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(4, len(self.events()))
        self.assertEqual({"/v1/logs"}, {request[1] for request in self.requests})
        self.assertEqual(["fixture-api-key"] * 4, self.api_key_headers)
        self.assertTrue(all(request[2] is None for request in self.requests))
        self.assertTrue(all("project_id" not in event for event in self.events()))
        self.assertNotIn("fixture-api-key", result.stdout + result.stderr)
        self.assertNotIn("(None)", result.stdout)

    def test_api_key_can_supply_matching_project_for_backend_validation(self):
        result = self.run_script("--api-key", "fixture-api-key", "--project-id", DEFAULT_ID, "--count", "2")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertTrue(all(event["project_id"] == DEFAULT_ID for event in self.events()))
        self.assertEqual({"/v1/logs"}, {request[1] for request in self.requests})

    def test_api_key_preview_omits_project_without_network(self):
        result = self.run_script("--api-key", "fixture-api-key", "--dry-run", "--count", "2")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual([], self.requests)
        self.assertTrue(all("project_id" not in json.loads(line) for line in result.stdout.splitlines()))
        self.assertNotIn("fixture-api-key", result.stdout + result.stderr)

    def test_ambiguous_credentials_fail_before_writes(self):
        result = self.run_script("--api-key", "fixture-api-key", "--token", "fixture-token")
        self.assertEqual(1, result.returncode)
        self.assertIn("not both", result.stderr)
        self.assertEqual([], self.requests)

    def test_rejected_writes_report_failure_without_retries(self):
        self.ingest_status = 503
        result = self.run_script("--token", "fixture-token", "--count", "4")
        self.assertEqual(1, result.returncode)
        self.assertIn("Accepted 0/4", result.stdout)
        self.assertIn("HTTP 503", result.stderr)
        self.assertEqual(4, len(self.events()))

    def test_preview_needs_no_credentials_or_network(self):
        result = self.run_script("--dry-run", "--count", "3")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual([], self.requests)
        events = [json.loads(line) for line in result.stdout.splitlines()]
        self.assertEqual(3, len(events))
        self.assertTrue(all(event["project_id"] == "PROJECT_ID" for event in events))

    def test_invalid_count_is_rejected_before_network(self):
        result = self.run_script("--count", "0", "--token", "fixture-token")
        self.assertEqual(2, result.returncode)
        self.assertIn("must be greater than zero", result.stderr)
        self.assertEqual([], self.requests)

    def test_expired_token_fails_before_writes(self):
        self.project_status = 401
        result = self.run_script("--token", "fixture-token", "--count", "4")
        self.assertEqual(1, result.returncode)
        self.assertIn("Use a fresh access token", result.stderr)
        self.assertNotIn("fixture-token", result.stdout + result.stderr)
        self.assertEqual([], self.events())

    def test_invalid_template_fails_before_authentication(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = Path(directory) / "invalid.json"
            fixture.write_text(json.dumps([{"level": ["info"], "service": "app", "message": "hello"}]))
            result = self.run_script("--file", str(fixture), "--dry-run")
        self.assertEqual(1, result.returncode)
        self.assertIn("invalid level", result.stderr)
        self.assertNotIn("Traceback", result.stderr)
        self.assertEqual([], self.requests)


if __name__ == "__main__":
    unittest.main()
