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
  emit_json "📦 PDLC is installed but not initialized for this project.

Run \`/pdlc init\` to set up PDLC — Oracle will walk you through project setup, scaffolding, and roadmap planning."
  exit 0
fi

# STATE.md exists — read it and inject into the session
state_content="$(cat "$state_file")"

# ── Read ROADMAP.md for progress overview ────────────────────────────────────
roadmap_file="${project_dir}/docs/pdlc/memory/ROADMAP.md"
roadmap_summary=""
if [[ -f "$roadmap_file" ]]; then
  # Extract the Feature Backlog table (lines between "## Feature Backlog" and the next "---" or "## ")
  # Show features sorted by priority so the user sees where they are
  roadmap_table=""
  if command -v python3 &>/dev/null; then
    roadmap_table="$(python3 -c '
import sys, re

content = open(sys.argv[1]).read()

# Find the table section
match = re.search(r"\| ID.*\|.*\n\|[-| ]+\n((?:\|.*\n)*)", content)
if not match:
    sys.exit(0)

rows = match.group(1).strip().split("\n")
features = []
shipped = 0
in_progress = 0
planned = 0

for row in rows:
    cols = [c.strip() for c in row.split("|")[1:-1]]
    if len(cols) < 5 or cols[0] == "—":
        continue
    fid, name, desc, pri, status = cols[0], cols[1], cols[2], cols[3], cols[4]
    features.append((int(pri) if pri.isdigit() else 999, fid, name, status))
    if "Shipped" in status:
        shipped += 1
    elif "In Progress" in status:
        in_progress += 1
    elif "Planned" in status:
        planned += 1

features.sort()
total = len(features)

lines = []
lines.append(f"## Roadmap Progress ({shipped}/{total} shipped)\n")
for pri, fid, name, status in features:
    if "Shipped" in status:
        lines.append(f"  ✓ {fid}  {name:<24} Shipped")
    elif "In Progress" in status:
        lines.append(f"  ▶ {fid}  {name:<24} In Progress  ◀ current")
    elif "Deferred" in status:
        lines.append(f"  ◌ {fid}  {name:<24} Deferred")
    elif "Dropped" in status:
        lines.append(f"  ✗ {fid}  {name:<24} Dropped")
    else:
        lines.append(f"  ○ {fid}  {name:<24} Planned")

print("\n".join(lines))
' "$roadmap_file" 2>/dev/null)" || true
  fi

  if [[ -n "$roadmap_table" ]]; then
    roadmap_summary="

${roadmap_table}"
  fi
fi

# ── Check for interrupted work and state conflicts ──────────────────────────
pending_notice=""
conflict_count=0

# Count pending files
pending_decision="${project_dir}/docs/pdlc/memory/.pending-decision.json"
pending_party="${project_dir}/docs/pdlc/memory/.pending-party.json"
has_pending_decision=false
has_pending_party=false

if [[ -f "$pending_decision" ]]; then
  has_pending_decision=true
  conflict_count=$((conflict_count + 1))
fi

if [[ -f "$pending_party" ]]; then
  has_pending_party=true
  conflict_count=$((conflict_count + 1))
fi

# Build pending notices (innermost first: party → decision → phase)
if $has_pending_party && $has_pending_decision; then
  meeting_type=""
  if command -v jq &>/dev/null; then
    meeting_type="$(jq -r '.meetingType // "unknown"' "$pending_party" 2>/dev/null)"
  fi
  pending_notice="${pending_notice}

⚠️ **Multiple interrupted operations detected:**
  1. Interrupted party meeting (${meeting_type:-unknown})
  2. Interrupted decision

These will be resolved in order (meeting first, then decision). Run \`/pdlc decision\` to start recovery, or resume the active workflow.

Read \`skills/state-reconciliation.md\` for the full reconciliation protocol."
elif $has_pending_party; then
  meeting_type=""
  if command -v jq &>/dev/null; then
    meeting_type="$(jq -r '.meetingType // "unknown"' "$pending_party" 2>/dev/null)"
  fi
  pending_notice="${pending_notice}

⚠️ **Interrupted party meeting detected** (${meeting_type:-unknown}). Resume the active workflow to recover — the meeting will be picked up automatically."
elif $has_pending_decision; then
  pending_notice="${pending_notice}

⚠️ **Interrupted decision detected.** Run \`/pdlc decision\` to resume or discard the pending decision."
fi

# Check for ROADMAP.md inconsistency with STATE.md
if [[ -f "$roadmap_file" ]] && command -v python3 &>/dev/null; then
  roadmap_conflict="$(python3 -c '
import sys, re

state = open(sys.argv[1]).read()
roadmap = open(sys.argv[2]).read()

# Extract active feature from STATE.md
feat_match = re.search(r"\*\*Current Feature\*\*:\s*`?([^`\n]+)`?", state)
active_feature = feat_match.group(1).strip() if feat_match else "none"

# Extract phase from STATE.md
phase_match = re.search(r"\*\*Current Phase\*\*:\s*`?([^`\n]+)`?", state)
phase = phase_match.group(1).strip() if phase_match else ""

# Find features marked In Progress in ROADMAP
in_progress = re.findall(r"\|\s*(F-\d+)\s*\|\s*(\S+)\s*\|[^|]+\|\s*\d+\s*\|\s*In Progress", roadmap)

if not in_progress:
    sys.exit(0)

for fid, fname in in_progress:
    if "Idle" in phase and active_feature == "none":
        print(f"ROADMAP shows {fid} ({fname}) as In Progress but STATE.md is Idle")
    elif active_feature != "none" and fname != active_feature:
        print(f"ROADMAP shows {fid} ({fname}) as In Progress but STATE.md active feature is {active_feature}")
' "$state_file" "$roadmap_file" 2>/dev/null)" || true

  if [[ -n "$roadmap_conflict" ]]; then
    conflict_count=$((conflict_count + 1))
    pending_notice="${pending_notice}

⚠️ **State conflict:** ${roadmap_conflict}. This will be reconciled when the workflow resumes."
  fi
fi

# ── Build the session message ────────────────────────────────────────────────
message="$(printf '%s\n\n%s\n\n%s%s%s' \
  "📋 PDLC Active — resuming from STATE.md" \
  "## Current State
${state_content}" \
  "${roadmap_summary}" \
  "${pending_notice}" \
  "

See CLAUDE.md for the full PDLC flow.")"

emit_json "$message"
exit 0
