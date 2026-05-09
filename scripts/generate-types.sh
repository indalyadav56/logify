#!/usr/bin/env bash
# =============================================================================
# scripts/generate-types.sh — Generate TypeScript types from OpenAPI spec
# Usage: ./scripts/generate-types.sh [--spec <path>] [--out <dir>]
# =============================================================================

set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; NC='\033[0m'
info() { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()   { echo -e "${GREEN}[OK]${NC}    $*"; }

# ---------- Defaults ----------
SPEC="${SPEC:-apps/backend/docs/openapi.yaml}"
OUT_DIR="${OUT_DIR:-sdks/node/src/generated}"

# ---------- Arg parsing ----------
while [[ $# -gt 0 ]]; do
  case $1 in
    --spec) SPEC="$2"; shift 2 ;;
    --out)  OUT_DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

info "OpenAPI spec : $SPEC"
info "Output dir   : $OUT_DIR"

# ---------- Ensure generator is available ----------
if ! command -v openapi-typescript &>/dev/null; then
  info "openapi-typescript not found — installing globally..."
  npm install -g openapi-typescript
fi

mkdir -p "$OUT_DIR"

# ---------- Generate ----------
info "Generating TypeScript types..."
openapi-typescript "$SPEC" --output "$OUT_DIR/api.d.ts"

ok "Types written to $OUT_DIR/api.d.ts"
