#!/usr/bin/env bash
# commit-archive.sh — Stage archived artifacts and commit
# Usage: bash scripts/commit-archive.sh <feature-name>
# Called by: /pdlc ship (Step 16e) and /pdlc abandon (Step 6)

set -euo pipefail

feature="${1:?Usage: bash scripts/commit-archive.sh <feature-name>}"

git add docs/pdlc/archive/
git add docs/pdlc/prds/ docs/pdlc/design/ docs/pdlc/reviews/ docs/pdlc/brainstorm/ docs/pdlc/mom/ 2>/dev/null || true
git commit -m "chore(pdlc): archive ${feature} artifacts + compact beads"
git push origin main

echo '{"status":"committed","feature":"'"$feature"'"}'
