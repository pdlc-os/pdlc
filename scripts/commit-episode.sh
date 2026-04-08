#!/usr/bin/env bash
# commit-episode.sh — Stage and commit all episode + memory files, then push
# Usage: bash scripts/commit-episode.sh <episode-id> <feature-name> <date>
# Called by: /pdlc ship (Step 16d)

set -euo pipefail

episode_id="${1:?Usage: bash scripts/commit-episode.sh <episode-id> <feature-name> <date>}"
feature="${2:?Missing feature-name}"
date="${3:?Missing date (YYYY-MM-DD)}"

episode_file="docs/pdlc/memory/episodes/${episode_id}_${feature}_${date}.md"

# Stage all episode and memory files
git add "$episode_file"
git add docs/pdlc/memory/episodes/index.md
git add docs/pdlc/memory/OVERVIEW.md
git add docs/pdlc/memory/CHANGELOG.md
git add docs/pdlc/memory/ROADMAP.md
git add docs/pdlc/memory/METRICS.md 2>/dev/null || true

# Commit and push
git commit -m "docs(pdlc): add episode ${episode_id} — ${feature}"
git push origin main

echo '{"status":"committed","episode":"'"$episode_id"'","feature":"'"$feature"'"}'
