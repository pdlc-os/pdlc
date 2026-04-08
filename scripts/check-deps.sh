#!/usr/bin/env bash
# Checks install status of Homebrew, Dolt, and Beads.
# Also checks Beads database health if .beads/ exists.
# Outputs JSON with version info or "missing" for each.

set -euo pipefail

brew_version="missing"
dolt_version="missing"
bd_version="missing"
beads_db="none"

if command -v brew &>/dev/null; then
  brew_version=$(brew --version 2>/dev/null | head -1)
fi

if command -v dolt &>/dev/null; then
  dolt_version=$(dolt version 2>/dev/null | head -1)
fi

if command -v bd &>/dev/null; then
  bd_version=$(bd --version 2>/dev/null | head -1)

  # Check Beads database health if .beads/ exists
  if [ -d ".beads" ]; then
    if bd doctor --json --quiet 2>/dev/null | grep -q '"status":"pass"' 2>/dev/null; then
      beads_db="healthy"
    else
      beads_db="unhealthy"
    fi
  else
    beads_db="not-initialized"
  fi
fi

cat <<EOF
{"brew":"$brew_version","dolt":"$dolt_version","bd":"$bd_version","beads_db":"$beads_db"}
EOF
