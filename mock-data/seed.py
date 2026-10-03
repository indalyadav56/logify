#!/usr/bin/env python3
"""Send sample logs through Logify's authenticated ingest API (standard library only)."""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
import getpass
import json
import os
from pathlib import Path
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from uuid import UUID, uuid4


class SeedError(Exception):
    pass


class API:
    def __init__(self, base_url, token="", api_key=""):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.api_key = api_key

    def request(self, method, path, body=None, expected=200):
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        elif self.token:
            headers["Authorization"] = "Bearer " + self.token
        payload = json.dumps(body).encode() if body is not None else None
        request = Request(self.base_url + path, data=payload, headers=headers, method=method)
        try:
            with urlopen(request, timeout=15) as response:
                if response.status != expected:
                    raise SeedError(f"{path}: expected HTTP {expected}, received {response.status}")
                data = json.load(response)
                if not isinstance(data, dict):
                    raise SeedError(f"{path}: expected a JSON object response")
                return data
        except HTTPError as error:
            if error.code == 401:
                detail = "Authentication failed. Use a fresh access token, a valid API key, or sign in again."
            else:
                try:
                    data = json.loads(error.read(4096))
                    detail = data.get("error", data.get("message", error.reason))
                    if isinstance(detail, dict):
                        detail = detail.get("message", error.reason)
                except (ValueError, AttributeError):
                    detail = error.reason
            raise SeedError(f"{path}: HTTP {error.code}: {detail}") from error
        except (URLError, TimeoutError, OSError) as error:
            raise SeedError(f"Cannot reach {self.base_url}. Start the backend and log processor: {error}") from error
        except (ValueError, TypeError) as error:
            raise SeedError(f"{path}: invalid JSON response") from error


def positive_int(value):
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("must be greater than zero")
    return number


def load_templates(path):
    try:
        templates = json.loads(path.read_text())
    except (OSError, ValueError) as error:
        raise SeedError(f"Cannot read sample logs from {path}: {error}") from error
    if not isinstance(templates, list) or not templates:
        raise SeedError("The sample file must contain a non-empty JSON array.")
    for index, entry in enumerate(templates, start=1):
        if not isinstance(entry, dict):
            raise SeedError(f"Sample {index} must be a JSON object.")
        if not isinstance(entry.get("level"), str) or entry["level"] not in {"trace", "debug", "info", "warn", "error", "fatal"}:
            raise SeedError(f"Sample {index} has an invalid level.")
        for field in ("service", "message"):
            if not isinstance(entry.get(field), str) or not entry[field].strip():
                raise SeedError(f"Sample {index} requires a non-empty {field}.")
        tags = entry.get("tags", {})
        if not isinstance(tags, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in tags.items()):
            raise SeedError(f"Sample {index} tags must map strings to strings.")
    return templates


def build_events(templates, count, minutes, project_id):
    end = datetime.now(timezone.utc)
    for index in range(count):
        event = dict(templates[index % len(templates)])
        event.pop("tenant_id", None)  # The backend derives the tenant from authentication.
        event.update(
            project_id=project_id,
            timestamp=(end - timedelta(minutes=minutes * (count - index - 1) / count)).isoformat(timespec="seconds").replace("+00:00", "Z"),
            environment="development",
            hostname="demo-host-01",
            source="mock-data",
            request_id=str(uuid4()),
            tags={**event.get("tags", {}), "mock": "true", "dataset": "logify-demo"},
        )
        if project_id is None:
            event.pop("project_id", None)  # API keys select their project on the server.
        yield event


def authenticate(api, args):
    if api.token or api.api_key:
        return
    email = args.email
    if not email and sys.stdin.isatty():
        email = input("Logify email: ").strip()
    password = os.getenv("LOGIFY_PASSWORD")
    if not password and email and sys.stdin.isatty():
        password = getpass.getpass("Logify password: ")
    if not email or not password:
        raise SeedError("Provide --api-key / LOGIFY_API_KEY, --token / LOGIFY_ACCESS_TOKEN, or --email / LOGIFY_EMAIL and LOGIFY_PASSWORD. In an interactive terminal, email and password are prompted.")
    result = api.request("POST", "/v1/auth/login", {"email": email, "password": password})
    data = result.get("data")
    token = data.get("access_token") if isinstance(data, dict) else None
    if not isinstance(token, str) or not token:
        raise SeedError("Sign-in did not return an access token.")
    api.token = token


def select_project(api, project_id):
    result = api.request("GET", "/v1/projects")
    projects = result.get("data", [])
    if not isinstance(projects, list) or not projects:
        raise SeedError("No projects found. Register an account to get its backend-created default project, or create a project in the app.")
    if not all(isinstance(p, dict) and p.get("id") and p.get("name") for p in projects):
        raise SeedError("The API returned an invalid project list.")
    if project_id:
        project = next((p for p in projects if p.get("id") == project_id), None)
        if not project:
            raise SeedError("The requested project was not found in this account.")
    else:
        project = next((p for p in projects if p.get("name") == "default-project"), projects[0])
    return project


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=os.getenv("LOGIFY_API_BASE_URL", "http://localhost:8081"), help="API URL (default: LOGIFY_API_BASE_URL or http://localhost:8081)")
    parser.add_argument("--token", default=os.getenv("LOGIFY_ACCESS_TOKEN", ""), help="Access token (prefer LOGIFY_ACCESS_TOKEN)")
    parser.add_argument("--api-key", default=os.getenv("LOGIFY_API_KEY", ""), help="Project API key (prefer LOGIFY_API_KEY); selects its project automatically")
    parser.add_argument("--email", default=os.getenv("LOGIFY_EMAIL"), help="Existing account email; password is prompted or read from LOGIFY_PASSWORD")
    parser.add_argument("--project-id", default=os.getenv("LOGIFY_PROJECT_ID"), help="Project UUID; defaults to this account's default-project or first project")
    parser.add_argument("--count", type=positive_int, default=100, help="Number of logs (default: 100)")
    parser.add_argument("--minutes", type=positive_int, default=15, help="Spread timestamps over the last N minutes (default: 15)")
    parser.add_argument("--file", type=Path, default=Path(__file__).with_name("logs.json"), help="JSON array of log templates")
    parser.add_argument("--dry-run", action="store_true", help="Print JSON lines without signing in or sending logs")
    args = parser.parse_args(argv)
    try:
        try:
            url = urlsplit(args.base_url)
        except ValueError as error:
            raise SeedError("--base-url must be a valid HTTP(S) API URL.") from error
        if url.scheme not in {"http", "https"} or not url.netloc or url.query or url.fragment:
            raise SeedError("--base-url must be an HTTP(S) API URL without a query or fragment.")
        if args.project_id:
            try:
                args.project_id = str(UUID(args.project_id))
            except ValueError as error:
                raise SeedError("--project-id must be a valid UUID.") from error
        templates = load_templates(args.file)
        if args.dry_run:
            preview_project = args.project_id or (None if args.api_key else "PROJECT_ID")
            for event in build_events(templates, args.count, args.minutes, preview_project):
                print(json.dumps(event))
            return 0

        if args.api_key and args.token:
            raise SeedError("Use either an API key or an access token, not both.")
        api = API(args.base_url, args.token, args.api_key)
        authenticate(api, args)
        project = ({"id": args.project_id, "name": "API key's project"}
                   if api.api_key else select_project(api, args.project_id))
        project_label = project["name"] + (f" ({project['id']})" if project["id"] else "")
        print(f"Sending {args.count} demo logs to {project_label} at {api.base_url}…", flush=True)
        accepted = 0
        errors = []
        executor = ThreadPoolExecutor(max_workers=4)
        try:
            futures = [executor.submit(api.request, "POST", "/v1/logs", event, 202)
                       for event in build_events(templates, args.count, args.minutes, project["id"])]
            for future in as_completed(futures):
                try:
                    future.result()
                    accepted += 1
                except SeedError as error:
                    errors.append(str(error))
        finally:
            executor.shutdown(wait=True, cancel_futures=True)
        print(f"Accepted {accepted}/{args.count} logs.")
        if errors:
            raise SeedError(f"{len(errors)} logs failed. {errors[0]} Successfully accepted logs are already queued; rerunning adds another batch.")
        print(f"Refresh Logs in the app and choose a time range covering the last {args.minutes} minutes. Kafka ingestion is asynchronous.")
        return 0
    except (SeedError, KeyboardInterrupt) as error:
        print(f"Error: {error or 'cancelled'}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
