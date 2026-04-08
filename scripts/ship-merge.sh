#!/usr/bin/env bash
# ship-merge.sh — Merge feature branch to main, tag, and push
# Usage: bash scripts/ship-merge.sh <feature-name> <version> <description>
# Called by: /pdlc ship (Steps 4, 7, 8)

set -euo pipefail

feature="${1:?Usage: bash scripts/ship-merge.sh <feature-name> <version> <description>}"
version="${2:?Missing version (e.g. v1.3.0)}"
description="${3:?Missing one-line description}"

# Merge to main
git checkout main
git merge --no-ff "feature/${feature}" -m "feat(${feature}): ${description}"

# Tag
git tag "${version}" -m "${feature} — ${description}"

# Push branch and tag
git push origin main
git push origin "${version}"

echo '{"status":"shipped","feature":"'"$feature"'","version":"'"$version"'"}'
