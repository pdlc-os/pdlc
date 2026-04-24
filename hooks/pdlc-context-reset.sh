#!/usr/bin/env bash
# pdlc-context-reset.sh — PDLC PostCompact hook for Claude Code.
# After /compact (manual or auto) the real context window shrinks sharply,
# but the PostToolUse bridge file at /tmp/pdlc-ctx-<session>.json still holds
# the pre-compact accumulated token estimate. Wipe all bridge files so the
# next PostToolUse hook starts counting from zero and the statusline bar
# reflects the compacted state.
#
# PostCompact has no decision control — exit 0 is all that matters.

rm -f /tmp/pdlc-ctx-*.json 2>/dev/null || true
exit 0
