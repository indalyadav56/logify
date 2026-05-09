#!/usr/bin/env bash
# =============================================================================
# scripts/setup.sh — One-command setup for new Logify developers
# Usage: ./scripts/setup.sh
# =============================================================================

set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

info "Starting Logify dev environment setup..."

# ---------- Prerequisites check ----------
check_cmd() { command -v "$1" &>/dev/null || error "$1 is required but not installed."; }
check_cmd docker
check_cmd docker-compose
check_cmd go
check_cmd node
check_cmd npm
check_cmd python3
ok "All prerequisites found."

# ---------- Environment files ----------
if [ ! -f .env ]; then
  cp .env.example .env
  info "Created .env from .env.example — please update values as needed."
fi

# ---------- Go dependencies ----------
info "Tidying Go modules (apps/backend)..."
(cd apps/backend && go mod tidy)
ok "Go modules ready."

# ---------- Node dependencies ----------
if [ -d apps/frontend ]; then
  info "Installing frontend Node dependencies..."
  (cd apps/frontend && npm ci)
  ok "Frontend deps installed."
fi

if [ -d sdks/node ]; then
  info "Installing Node SDK dependencies..."
  (cd sdks/node && npm ci)
  ok "Node SDK deps installed."
fi

# ---------- Python SDK ----------
if [ -d sdks/python ]; then
  info "Installing Python SDK in editable mode..."
  (cd sdks/python && pip install -e ".[dev]" --quiet)
  ok "Python SDK installed."
fi

# ---------- Docker infra ----------
info "Starting infrastructure services (Kafka, ClickHouse, Postgres)..."
docker-compose up -d

ok "Setup complete! Run 'docker-compose logs -f' to watch service logs."
