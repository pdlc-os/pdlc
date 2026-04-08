#!/usr/bin/env bash
# hotfix-merge.sh — Merge hotfix branch to main, tag, and push
# Usage: bash scripts/hotfix-merge.sh <hotfix-name> <version> <description>
# Called by: /pdlc hotfix (Step 6)

set -euo pipefail

hotfix="${1:?Usage: bash scripts/hotfix-merge.sh <hotfix-name> <version> <description>}"
version="${2:?Missing version (e.g. v1.3.1)}"
description="${3:?Missing one-line description}"

# Merge to main
git checkout main
git merge --no-ff "hotfix/${hotfix}" -m "hotfix(${hotfix}): ${description}"

# Tag
git tag "${version}" -m "hotfix: ${hotfix} — ${description}"

# Push branch and tag
git push origin main
git push origin "${version}"

echo '{"status":"shipped","hotfix":"'"$hotfix"'","version":"'"$version"'"}'
