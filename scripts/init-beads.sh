#!/usr/bin/env bash
# Initializes Beads with Dolt server mode.
# Idempotent — skips if .beads/ already exists.

set -euo pipefail

if [ -d ".beads" ]; then
  echo '{"type":"beads-init","status":"already-exists"}'
  exit 0
fi

if ! command -v bd &>/dev/null; then
  echo '{"type":"beads-init","status":"error","message":"bd not found on PATH"}' >&2
  exit 1
fi

if ! command -v dolt &>/dev/null; then
  echo '{"type":"beads-init","status":"error","message":"dolt not found on PATH"}' >&2
  exit 1
fi

output=$(bd init --server 2>&1) || {
  echo "{\"type\":\"beads-init\",\"status\":\"error\",\"message\":$(echo "$output" | head -5 | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))')}" >&2
  exit 1
}

echo '{"type":"beads-init","status":"created"}'
