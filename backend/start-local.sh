#!/usr/bin/env bash
#
# Run from inside the backend folder:
#   cd backend
#   bash start-local.sh
#
# MySQL: user=root, password=root, database=placement_tracker
#

set -euo pipefail

if [ -z "${BASH_VERSION:-}" ]; then
  echo "Please run with bash: bash $0" >&2
  exit 1
fi

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${BACKEND_DIR}"

DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="placement_tracker"
DB_USER="root"
DB_PASSWORD="root"
SERVER_PORT="8080"

export MYSQL_PWD="${DB_PASSWORD}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

setup_java() {
  if [[ -z "${JAVA_HOME:-}" ]] && [[ "$(uname -s)" == "Darwin" ]] && command -v /usr/libexec/java_home >/dev/null 2>&1; then
    JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home 2>/dev/null || true)"
    export JAVA_HOME
    export PATH="${JAVA_HOME}/bin:${PATH}"
  fi

  if ! command -v java >/dev/null 2>&1; then
    error "Java 17+ not found. Install: brew install openjdk@17"
    exit 1
  fi

  JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
  if [[ -z "${JAVA_VERSION}" ]] || [[ "${JAVA_VERSION}" -lt 17 ]]; then
    error "Java 17+ required. Found: ${JAVA_VERSION:-unknown}"
    exit 1
  fi
  log "Java ${JAVA_VERSION} ready"
}

start_mysql() {
  if mysqladmin ping -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" --silent 2>/dev/null; then
    log "MySQL running (${DB_USER}@${DB_HOST}:${DB_PORT})"
    return
  fi

  warn "MySQL not running. Starting..."
  if command -v brew >/dev/null 2>&1; then
    brew services start mysql 2>/dev/null || brew services start mysql@8.0 2>/dev/null || true
  fi

  for _ in $(seq 1 15); do
    if mysqladmin ping -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" --silent 2>/dev/null; then
      log "MySQL started"
      return
    fi
    sleep 2
  done

  error "Cannot connect to MySQL with user=${DB_USER} password=${DB_PASSWORD}"
  error "Start MySQL: brew services start mysql"
  exit 1
}

create_database() {
  log "Creating database: ${DB_NAME}"
  mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -e \
    "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

  if [[ -f "${BACKEND_DIR}/sql/init.sql" ]]; then
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" "${DB_NAME}" < "${BACKEND_DIR}/sql/init.sql" || true
  fi
  log "Database ready: ${DB_NAME}"
}

build_app() {
  log "Building backend (mvn clean package)..."
  mvn clean package -DskipTests -q
  log "Build done"
}

start_app() {
  log "Starting Spring Boot..."
  log "  Backend API : http://localhost:${SERVER_PORT}/api"
  log "  DB          : ${DB_USER}/${DB_PASSWORD} @ ${DB_HOST}:${DB_PORT}/${DB_NAME}"
  log "  Admin login : admin@placement.com / admin123"
  log "Press Ctrl+C to stop"
  echo "----------------------------------------"

  mvn spring-boot:run
}

main() {
  echo ""
  echo "========================================"
  echo " Placement Tracker Backend (local)"
  echo "========================================"
  echo ""

  require_command mvn
  require_command mysql
  require_command mysqladmin

  setup_java
  start_mysql
  create_database
  build_app
  start_app
}

main "$@"
