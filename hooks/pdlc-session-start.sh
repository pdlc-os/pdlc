#!/usr/bin/env bash
# pdlc-session-start.sh — PDLC SessionStart hook for Claude Code
# Injects PDLC context (STATE.md contents) into the session on startup.
# Registered as a `SessionStart` hook in Claude Code settings.

set -euo pipefail

# ── Resolve project directory ─────────────────────────────────────────────────
project_dir="${CLAUDE_PROJECT_DIR:-${PWD}}"
state_file="${project_dir}/docs/pdlc/memory/STATE.md"

# ── JSON string escaping ──────────────────────────────────────────────────────
# Escapes a string for safe embedding in a JSON double-quoted value.
# Handles backslashes, double-quotes, and control characters (tab, newline, CR).
json_escape() {
  local input="$1"
  # Use printf + python if available for robust encoding; fall back to sed chain
  if command -v python3 &>/dev/null; then
    printf '%s' "$input" | python3 -c '
import sys, json
data = sys.stdin.read()
# json.dumps adds surrounding quotes — strip them
print(json.dumps(data)[1:-1], end="")
'
  elif command -v python &>/dev/null; then
    printf '%s' "$input" | python -c '
import sys, json
data = sys.stdin.read()
print(json.dumps(data)[1:-1], end="")
'
  else
    # Pure bash/sed fallback: escape backslashes, double-quotes, tabs, newlines
    printf '%s' "$input" \
      | sed 's/\\/\\\\/g' \
      | sed 's/"/\\"/g' \
      | sed 's/\t/\\t/g' \
      | awk '{printf "%s\\n", $0}' \
      | sed '$ s/\\n$//'
  fi
}

# ── Build and emit the systemMessage JSON ────────────────────────────────────
emit_json() {
  local message="$1"

  # Prefer jq for robust JSON serialisation
  if command -v jq &>/dev/null; then
    jq -cn --arg msg "$message" '{"systemMessage": $msg}'
  else
    local escaped
    escaped="$(json_escape "$message")"
    printf '{"systemMessage": "%s"}\n' "$escaped"
  fi
}

# ── Main logic ────────────────────────────────────────────────────────────────
if [[ ! -f "$state_file" ]]; then
  # PDLC not yet initialized for this project
  emit_json "PDLC is installed but not initialized for this project. Run /pdlc init to set up PDLC for this project."
  exit 0
fi

# STATE.md exists — read it and inject into the session
state_content="$(cat "$state_file")"

# Check for interrupted work
pending_notice=""

pending_decision="${project_dir}/docs/pdlc/memory/.pending-decision.json"
if [[ -f "$pending_decision" ]]; then
  pending_notice="${pending_notice}

⚠️ **Interrupted decision detected.** Run \`/pdlc decision\` to resume or discard the pending decision."
fi

pending_party="${project_dir}/docs/pdlc/memory/.pending-party.json"
if [[ -f "$pending_party" ]]; then
  meeting_type=""
  if command -v jq &>/dev/null; then
    meeting_type="$(jq -r '.meetingType // "unknown"' "$pending_party" 2>/dev/null)"
  fi
  pending_notice="${pending_notice}

⚠️ **Interrupted party meeting detected** (${meeting_type:-unknown}). Resume the active workflow to recover — the meeting will be picked up automatically."
fi

message="$(printf '%s\n\n%s\n\n%s%s' \
  "📋 PDLC Active — resuming from STATE.md" \
  "## Current State
${state_content}" \
  "See CLAUDE.md for the full PDLC flow." \
  "${pending_notice}")"

emit_json "$message"
exit 0
