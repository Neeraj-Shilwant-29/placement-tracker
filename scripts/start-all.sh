#!/usr/bin/env bash
#
# Placement Tracker - Full Local Setup
#
# Usage (use bash, not sh):
#   ./scripts/start-all.sh
#   bash scripts/start-all.sh
#

set -euo pipefail

if [ -z "${BASH_VERSION:-}" ]; then
  echo "Please run with bash: bash $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/.logs"
BACKEND_LOG="${LOG_DIR}/backend.log"
FRONTEND_LOG="${LOG_DIR}/frontend.log"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-placement_tracker}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-root}"
SERVER_PORT="${SERVER_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-4200}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  log "Shutting down..."
  [[ -n "${FRONTEND_PID}" ]] && kill "${FRONTEND_PID}" 2>/dev/null || true
  [[ -n "${BACKEND_PID}" ]] && kill "${BACKEND_PID}" 2>/dev/null || true
  wait 2>/dev/null || true
  log "Stopped."
}

trap cleanup EXIT INT TERM

wait_for_backend() {
  local url="http://localhost:${SERVER_PORT}/api/auth/login"
  log "Waiting for backend to start..."
  for i in {1..60}; do
    if curl -sf "http://localhost:${SERVER_PORT}" >/dev/null 2>&1; then
      log "Backend is up at http://localhost:${SERVER_PORT}"
      return
    fi
    sleep 2
  done
  warn "Backend did not respond in time. Check ${BACKEND_LOG}"
}

main() {
  echo ""
  echo "========================================"
  echo " Placement Tracker - Full Local Setup"
  echo "========================================"
  echo ""

  mkdir -p "${LOG_DIR}"

  export DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD SERVER_PORT

  log "Step 1/3: Setting up and starting backend..."
  bash "${SCRIPT_DIR}/start-backend.sh" > "${BACKEND_LOG}" 2>&1 &
  BACKEND_PID=$!

  wait_for_backend

  log "Step 2/3: Installing frontend dependencies (if needed)..."
  cd "${PROJECT_ROOT}/frontend"
  if [[ ! -d node_modules ]]; then
    npm install
  fi

  log "Step 3/3: Starting frontend..."
  npx ng serve --port "${FRONTEND_PORT}" --host 0.0.0.0 > "${FRONTEND_LOG}" 2>&1 &
  FRONTEND_PID=$!

  echo ""
  log "Application is running!"
  log "  Frontend: http://localhost:${FRONTEND_PORT}"
  log "  Backend:  http://localhost:${SERVER_PORT}/api"
  log "  Admin:    admin@placement.com / admin123"
  log ""
  log "Logs:"
  log "  Backend:  ${BACKEND_LOG}"
  log "  Frontend: ${FRONTEND_LOG}"
  log ""
  log "Press Ctrl+C to stop both servers"

  wait
}

main "$@"
