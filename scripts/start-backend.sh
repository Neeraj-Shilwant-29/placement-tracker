#!/usr/bin/env bash
# Wrapper script - runs backend/start-local.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${SCRIPT_DIR}/../backend/start-local.sh" "$@"
