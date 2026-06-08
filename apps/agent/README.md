# logify-agent

A log shipping agent for the Logify platform. It tails files, follows the
systemd journal, or reads stdin, parses each record (JSON or plain text, with
severity detection), and forwards it to the Logify ingest API.

It is a **single static binary with zero runtime dependencies** — the same
deployment model as the AWS CloudWatch Agent, New Relic Infra agent, Datadog
Agent, Elastic Filebeat, Grafana Promtail/Alloy and Fluent Bit. Drop the binary
on a host and run it; there is no Python, Node, or JVM to install.

Supported targets: Linux (amd64/arm64) and macOS (amd64/arm64).

## Features

- **Inputs**: file tailing (globs, rotation/truncation aware, offset resume),
  `stdin` (pipe), and `journald` (systemd).
- **Parsing**: detects severity from plain text; extracts `level`/`message`/
  `timestamp` from JSON lines and routes the rest into structured metadata.
- **Reliable delivery**: async buffered shipping with retry-friendly error
  reporting; file offsets are checkpointed so restarts don't duplicate or drop.
- **Multiline**: joins stack traces / multi-line records into one event.
- **Service install**: `systemd` on Linux, `launchd` on macOS.

---

## Installation

Pick **one** of the methods below, then jump to [Configure](#2-configure) and
[Run as a service](#3-run-as-a-service).

### Method A — Prebuilt binary (recommended)

The agent ships as one self-contained file. Nothing else to install.

**Ubuntu / Linux**

```bash
# 1. Detect your architecture (amd64 for most servers, arm64 for Graviton/Pi)
ARCH=$(dpkg --print-architecture)            # -> amd64 or arm64
VERSION=v0.1.0

# 2. Download and install
curl -fsSL -o logify-agent \
  "https://github.com/indalyadav56/logify/releases/download/${VERSION}/logify-agent-linux-${ARCH}"
sudo install -m 0755 logify-agent /usr/local/bin/logify-agent

# 3. Verify
logify-agent version
```

**macOS**

```bash
# Apple Silicon -> arm64, Intel -> amd64
ARCH=$([ "$(uname -m)" = "arm64" ] && echo arm64 || echo amd64)
VERSION=v0.1.0

curl -fsSL -o logify-agent \
  "https://github.com/indalyadav56/logify/releases/download/${VERSION}/logify-agent-darwin-${ARCH}"
sudo install -m 0755 logify-agent /usr/local/bin/logify-agent

# Gatekeeper may quarantine downloaded binaries; clear it if needed:
sudo xattr -d com.apple.quarantine /usr/local/bin/logify-agent 2>/dev/null || true

logify-agent version
```

> Release artifacts are produced by `make dist` (see [Build from source](#method-b--build-from-source)).
> Until a tagged release exists, use Method B.

### Method B — Build from source

Requires Go 1.26+ on the build machine only — the resulting binary needs nothing.

```bash
git clone https://github.com/indalyadav56/logify.git
cd logify/apps/agent

# Build for the current machine
CGO_ENABLED=0 go build -ldflags "-s -w" -o logify-agent .
sudo install -m 0755 logify-agent /usr/local/bin/logify-agent
```

`CGO_ENABLED=0` yields a fully static binary (`ldd ./logify-agent` prints
"not a dynamic executable").

**Cross-compile for other hosts from one machine:**

```bash
GOOS=linux  GOARCH=amd64 CGO_ENABLED=0 go build -o dist/logify-agent-linux-amd64 .
GOOS=linux  GOARCH=arm64 CGO_ENABLED=0 go build -o dist/logify-agent-linux-arm64 .
GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -o dist/logify-agent-darwin-amd64 .
GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -o dist/logify-agent-darwin-arm64 .
```

---

### 2. Configure

```bash
sudo mkdir -p /etc/logify
sudo cp config.example.yaml /etc/logify/agent.yaml     # macOS: /usr/local/etc/logify/agent.yaml
sudo vi /etc/logify/agent.yaml                         # set backend.url, api_key, inputs

# Sanity-check before starting:
logify-agent validate --config /etc/logify/agent.yaml
```

The agent also needs a writable state dir for file-tail offsets (created
automatically, but you can pre-create it):

```bash
sudo mkdir -p /var/lib/logify-agent                    # macOS: /usr/local/var/lib/logify-agent
```

See [`config.example.yaml`](./config.example.yaml) for every option.

### 3. Run as a service

Installs and starts a managed background service — `systemd` on Linux,
`launchd` on macOS — that restarts on failure and at boot.

```bash
sudo logify-agent service install     # uses /etc/logify/agent.yaml by default
sudo logify-agent service status
sudo logify-agent service uninstall   # stop + remove
```

`service install` writes:
- Linux: `/etc/systemd/system/logify-agent.service`, then `systemctl enable --now`
- macOS: `/Library/LaunchDaemons/com.logify.agent.plist`, then `launchctl load -w`

Check it's flowing:

```bash
# Linux
journalctl -u logify-agent -f
# macOS
tail -f /usr/local/var/log/logify-agent.log
```

### Uninstall completely

```bash
sudo logify-agent service uninstall
sudo rm -f /usr/local/bin/logify-agent
sudo rm -rf /etc/logify /var/lib/logify-agent
```

---

## Quick start (no install / no config)

For piping or one-off sends you don't need a config file or the service:

```bash
# Pipe any program's output straight to Logify:
myapp 2>&1 | logify-agent run --url http://localhost:8080 --service myapp

# Send a one-off log from a script:
logify-agent send --url http://localhost:8080 --level error --message "deploy failed" \
  --service ci --tag pipeline=build --meta commit=abc123

# Pipe many lines, one log each:
journalctl -u nginx --no-pager | logify-agent send --level info --service nginx
```

## Commands

| Command | Purpose |
| --- | --- |
| `run` | Run the agent in the foreground (reads the config, or stdin if none). |
| `send` | Send one log (`--message`) or one-per-line from stdin, then exit. |
| `service install\|uninstall\|status` | Manage the background service. |
| `validate` | Check a config file. |
| `version` | Print the version. |

`run` flags (`--url`, `--api-key`, `--service`, `--env`, `--source`,
`--log-level`, `--stdin`) override the config file. `LOGIFY_API_KEY` is also
honored.

## Configuration

See [`config.example.yaml`](./config.example.yaml). Default config path:
`/etc/logify/agent.yaml` (Linux), `/usr/local/etc/logify/agent.yaml` (macOS).

Each log is POSTed to `POST {url}{ingest_path}` (default `/v1/logs`) matching the
backend's `CreateLogRequest` schema. The agent reuses the official Go SDK
(`sdks/go`) for delivery.
