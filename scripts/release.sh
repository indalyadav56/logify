#!/usr/bin/env bash
# =============================================================================
# scripts/release.sh — Tag and release all Logify SDKs & services
# Usage: ./scripts/release.sh <version>  (e.g. ./scripts/release.sh 1.2.0)
# =============================================================================

set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ---------- Version argument ----------
VERSION="${1:-}"
[[ -z "$VERSION" ]] && error "Usage: $0 <version>  (e.g. 1.2.0)"

# Validate semver format
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || error "Version must be semver: MAJOR.MINOR.PATCH"

TAG="v${VERSION}"

info "Releasing Logify $TAG"

# ---------- Ensure clean working tree ----------
if [[ -n "$(git status --porcelain)" ]]; then
  error "Working tree is dirty. Commit or stash changes before releasing."
fi

# ---------- Update Node SDK version ----------
if [ -f sdks/node/package.json ]; then
  info "Bumping Node SDK to $VERSION..."
  (cd sdks/node && npm version "$VERSION" --no-git-tag-version)
  git add sdks/node/package.json sdks/node/package-lock.json 2>/dev/null || true
fi

# ---------- Update Python SDK version ----------
if [ -f sdks/python/pyproject.toml ]; then
  info "Bumping Python SDK to $VERSION..."
  sed -i.bak "s/^version = \".*\"/version = \"$VERSION\"/" sdks/python/pyproject.toml
  rm -f sdks/python/pyproject.toml.bak
  git add sdks/python/pyproject.toml
fi

# ---------- Update Go SDK version (go.mod comment / tag) ----------
if [ -f sdks/go/go.mod ]; then
  info "Go SDK will be released via git tag (sdks/go/$TAG)."
fi

# ---------- Commit & tag ----------
git commit -m "chore: release $TAG" || warn "Nothing to commit — version files may already be up to date."
git tag -a "$TAG" -m "Release $TAG"

info "Pushing tag $TAG to origin..."
git push origin HEAD
git push origin "$TAG"

ok "Release $TAG complete!"
info "Next steps:"
info "  • Publish Node SDK  : cd sdks/node && npm publish"
info "  • Publish Python SDK: cd sdks/python && python -m build && twine upload dist/*"
info "  • Go SDK is available via: go get github.com/your-org/logify/sdks/go@$TAG"
