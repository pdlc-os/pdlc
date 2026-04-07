#!/usr/bin/env bash
# Creates the PDLC directory structure.
# Called during /pdlc init. Idempotent — safe to run multiple times.

set -euo pipefail

PROJECT_DIR="${1:-.}"

dirs=(
  docs/pdlc/memory/episodes
  docs/pdlc/prds/plans
  docs/pdlc/design
  docs/pdlc/reviews
  docs/pdlc/brainstorm
  docs/pdlc/mom
  docs/pdlc/archive/prds
  docs/pdlc/archive/design
  docs/pdlc/archive/reviews
  docs/pdlc/archive/brainstorm
  docs/pdlc/archive/mom
)

created=0
for d in "${dirs[@]}"; do
  target="$PROJECT_DIR/$d"
  if [ ! -d "$target" ]; then
    mkdir -p "$target"
    ((created++))
  fi
done

echo "{\"type\":\"dirs-created\",\"total\":${#dirs[@]},\"new\":$created}"
