# scripts/lib/platform-detect.sh
#
# Sourceable shell helper for PDLC orchestrator scripts (start-server.sh,
# start-portal.sh, future start-live-server.sh). Centralises platform-aware
# foreground/background mode detection so the same logic doesn't drift
# across launchers.
#
# Usage (in a launcher):
#   SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
#   source "$SCRIPT_DIR/lib/platform-detect.sh"
#   pdlc_detect_foreground_mode
#   # FOREGROUND is now "true" on Codex CI / Windows Git Bash / MSYS / Cygwin,
#   # otherwise unchanged.
#
# Honours:
#   $FOREGROUND="true"        — explicit user request, no-op
#   $FORCE_BACKGROUND="true"  — explicit user request, no-op
#
# Environments that reap detached/background processes (auto-foreground):
#   Codex CI       — $CODEX_CI is set
#   Windows MSYS   — $OSTYPE matches msys*/cygwin*/mingw* OR $MSYSTEM is set
#
# This script does not exit, fail, or print anything. It is purely a setter
# function for $FOREGROUND.

pdlc_detect_foreground_mode() {
  # Already explicitly set — respect user choice
  if [[ "${FOREGROUND:-}" == "true" || "${FORCE_BACKGROUND:-}" == "true" ]]; then
    return 0
  fi

  # Codex CI: backgrounded processes get reaped
  if [[ -n "${CODEX_CI:-}" ]]; then
    FOREGROUND="true"
    return 0
  fi

  # Windows Git Bash / MSYS / Cygwin: nohup-detached processes get reaped
  case "${OSTYPE:-}" in
    msys*|cygwin*|mingw*)
      FOREGROUND="true"
      return 0
      ;;
  esac
  if [[ -n "${MSYSTEM:-}" ]]; then
    FOREGROUND="true"
    return 0
  fi

  # Default: leave $FOREGROUND unchanged (typically "" or "false")
  return 0
}
