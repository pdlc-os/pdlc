#!/usr/bin/env bash
# Ensures .gitignore exists with PDLC-required entries.
# Appends missing entries without duplicating existing ones.
# Pass additional paths as arguments: ./setup-gitignore.sh "tmp/" "dist/"

set -euo pipefail

GITIGNORE=".gitignore"

required_entries=(
  "node_modules/"
  ".claude/"
  ".env"
  ".env.*"
  ".DS_Store"
  "*.log"
)

# Add any extra paths passed as arguments
for arg in "$@"; do
  required_entries+=("$arg")
done

touch "$GITIGNORE"

added=0
for entry in "${required_entries[@]}"; do
  if ! grep -qxF "$entry" "$GITIGNORE"; then
    echo "$entry" >> "$GITIGNORE"
    ((added++))
  fi
done

echo "{\"type\":\"gitignore-updated\",\"added\":$added,\"total_required\":${#required_entries[@]}}"
