#!/usr/bin/env bash
#
# Placement Tracker - Local Frontend Setup
#
# Usage (use bash, not sh):
#   ./scripts/start-frontend.sh
#   bash scripts/start-frontend.sh
#

set -euo pipefail

if [ -z "${BASH_VERSION:-}" ]; then
  echo "Please run with bash: bash $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

API_URL="${API_URL:-http://localhost:8080/api}"
FRONTEND_PORT="${FRONTEND_PORT:-4200}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()   { printf "${GREEN}[INFO]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$*" >&2; }

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Required command not found: $1"
    exit 1
  fi
}

check_backend() {
  local health_url="${API_URL%/api}/actuator/health"
  if curl -sf "${health_url}" >/dev/null 2>&1; then
    log "Backend is reachable at ${API_URL%/api}"
    return
  fi

  if curl -sf "${API_URL%/api}" >/dev/null 2>&1; then
    log "Backend appears to be running at ${API_URL%/api}"
    return
  fi

  warn "Backend may not be running yet at ${API_URL%/api}"
  warn "Start it first with: ./scripts/start-backend.sh"
}

main() {
  echo ""
  echo "========================================"
  echo " Placement Tracker - Frontend Setup"
  echo "========================================"
  echo ""

  require_command npm
  check_backend

  cd "${FRONTEND_DIR}"

  if [[ ! -d node_modules ]]; then
    log "Installing npm dependencies..."
    npm install
  else
    log "npm dependencies already installed"
  fi

  log "Starting Angular dev server..."
  log "Frontend URL: http://localhost:${FRONTEND_PORT}"
  log "Backend API:  ${API_URL}"
  log ""
  log "Press Ctrl+C to stop the server"
  log "----------------------------------------"

  ng serve --port "${FRONTEND_PORT}" --host 0.0.0.0 2>/dev/null || npx ng serve --port "${FRONTEND_PORT}" --host 0.0.0.0
}

main "$@"
