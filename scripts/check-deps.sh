#!/usr/bin/env bash
# Checks install status of Homebrew, Dolt, and Beads.
# Outputs JSON with version info or "missing" for each.

set -euo pipefail

brew_version="missing"
dolt_version="missing"
bd_version="missing"

if command -v brew &>/dev/null; then
  brew_version=$(brew --version 2>/dev/null | head -1)
fi

if command -v dolt &>/dev/null; then
  dolt_version=$(dolt version 2>/dev/null | head -1)
fi

if command -v bd &>/dev/null; then
  bd_version=$(bd --version 2>/dev/null | head -1)
fi

cat <<EOF
{"brew":"$brew_version","dolt":"$dolt_version","bd":"$bd_version"}
EOF
