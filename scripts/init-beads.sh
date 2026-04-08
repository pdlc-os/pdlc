#!/usr/bin/env bash
# Initializes Beads with Dolt embedded mode.
# Idempotent — verifies database health even if .beads/ already exists.

set -euo pipefail

if ! command -v bd &>/dev/null; then
  echo '{"type":"beads-init","status":"error","message":"bd not found on PATH"}' >&2
  exit 1
fi

if ! command -v dolt &>/dev/null; then
  echo '{"type":"beads-init","status":"error","message":"dolt not found on PATH"}' >&2
  exit 1
fi

# If .beads/ exists, verify the database is healthy
if [ -d ".beads" ]; then
  # Quick health check — bd doctor exits non-zero if database is broken
  if bd doctor --json --quiet 2>/dev/null | grep -q '"status":"pass"' 2>/dev/null; then
    echo '{"type":"beads-init","status":"already-exists","healthy":true}'
    exit 0
  fi

  # Database exists but is unhealthy — try to repair
  repair_output=$(bd doctor --fix --yes 2>&1) || true

  # Re-check after repair
  if bd doctor --json --quiet 2>/dev/null | grep -q '"status":"pass"' 2>/dev/null; then
    echo '{"type":"beads-init","status":"repaired","message":"Database repaired by bd doctor --fix"}'
    exit 0
  fi

  # Repair failed — re-initialize with --force
  reinit_output=$(bd init --force 2>&1) || {
    echo "{\"type\":\"beads-init\",\"status\":\"error\",\"message\":\"Re-init failed after repair attempt\"}" >&2
    exit 1
  }
  echo '{"type":"beads-init","status":"reinitialized","message":"Database was unhealthy, re-initialized with --force"}'
  exit 0
fi

# No .beads/ directory — fresh initialization
output=$(bd init 2>&1) || {
  echo "{\"type\":\"beads-init\",\"status\":\"error\",\"message\":$(echo "$output" | head -5 | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))' 2>/dev/null || echo '"bd init failed"')}" >&2
  exit 1
}

# Verify the new database is healthy
if bd doctor --json --quiet 2>/dev/null | grep -q '"status":"pass"' 2>/dev/null; then
  echo '{"type":"beads-init","status":"created","healthy":true}'
else
  # Init succeeded but doctor reports issues — not fatal, warn
  echo '{"type":"beads-init","status":"created","healthy":false,"message":"bd doctor reports warnings — run bd doctor for details"}'
fi
