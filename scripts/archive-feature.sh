#!/usr/bin/env bash
# archive-feature.sh — Archive a shipped feature's artifacts and clean up Beads
# Usage: bash scripts/archive-feature.sh <feature-name>
# Called by: /pdlc ship (Step 16e) and /pdlc abandon (Step 6)

set -euo pipefail

feature="${1:?Usage: bash scripts/archive-feature.sh <feature-name>}"

echo '{"status":"archiving","feature":"'"$feature"'"}'

# PRD
mkdir -p docs/pdlc/archive/prds
mv docs/pdlc/prds/PRD_${feature}_*.md docs/pdlc/archive/prds/ 2>/dev/null || true
mv docs/pdlc/prds/plans/plan_${feature}_*.md docs/pdlc/archive/prds/ 2>/dev/null || true

# Design docs
mkdir -p docs/pdlc/archive/design/${feature}
mv docs/pdlc/design/${feature}/* docs/pdlc/archive/design/${feature}/ 2>/dev/null || true
rmdir docs/pdlc/design/${feature} 2>/dev/null || true

# Review files
mkdir -p docs/pdlc/archive/reviews
mv docs/pdlc/reviews/REVIEW_${feature}_*.md docs/pdlc/archive/reviews/ 2>/dev/null || true

# Brainstorm log
mkdir -p docs/pdlc/archive/brainstorm
mv docs/pdlc/brainstorm/brainstorm_${feature}_*.md docs/pdlc/archive/brainstorm/ 2>/dev/null || true

# MOM files
mkdir -p docs/pdlc/archive/mom
mv docs/pdlc/mom/${feature}_*.md docs/pdlc/archive/mom/ 2>/dev/null || true
mv docs/pdlc/mom/MOM_decision_*_${feature}_*.md docs/pdlc/archive/mom/ 2>/dev/null || true
mv docs/pdlc/mom/MOM_whatif_*_${feature}_*.md docs/pdlc/archive/mom/ 2>/dev/null || true

# Clean up Beads
bd purge 2>/dev/null || true
bd admin compact --stats 2>/dev/null || true

echo '{"status":"archived","feature":"'"$feature"'"}'
