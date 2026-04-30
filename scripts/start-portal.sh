#!/usr/bin/env bash
# Start the PDLC visual portal — proxies localhost:7352 to the active backend.
# Usage: start-portal.sh [--port <port>] [--host <bind-host>] [--foreground] [--background]
#
# Default port: 7352 (PDLC on a numeric phone keypad — P=7, D=3, L=5, C=2).
# Override with PDLC_PORTAL_PORT or --port.
#
# Options:
#   --port <port>        Bind on this port (default 7352).
#   --host <host>        Bind interface (default 127.0.0.1).
#   --foreground         Run in current terminal (no backgrounding).
#   --background         Force background mode (overrides Codex auto-foreground).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTAL_DIR="$HOME/.pdlc/portal"
LOG_FILE="$PORTAL_DIR/portal.log"
PID_FILE="$PORTAL_DIR/portal.pid"

# Parse arguments
BIND_PORT="${PDLC_PORTAL_PORT:-7352}"
BIND_HOST="${PDLC_PORTAL_HOST:-127.0.0.1}"
FOREGROUND="false"
FORCE_BACKGROUND="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      BIND_PORT="$2"; shift 2 ;;
    --host)
      BIND_HOST="$2"; shift 2 ;;
    --foreground|--no-daemon)
      FOREGROUND="true"; shift ;;
    --background|--daemon)
      FORCE_BACKGROUND="true"; shift ;;
    *)
      echo "{\"error\": \"Unknown argument: $1\"}"
      exit 1 ;;
  esac
done

# Auto-foreground on platforms that reap detached/background processes.
# Centralised in scripts/lib/platform-detect.sh — sourced by all PDLC launchers.
# shellcheck source=lib/platform-detect.sh
source "$SCRIPT_DIR/lib/platform-detect.sh"
pdlc_detect_foreground_mode

mkdir -p "$PORTAL_DIR"

# If a portal is already running on this port, don't start another.
if [[ -f "$PID_FILE" ]]; then
  existing_pid=$(cat "$PID_FILE" 2>/dev/null || echo '')
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    if curl -sf "http://${BIND_HOST}:${BIND_PORT}/portal/health" >/dev/null 2>&1; then
      echo "{\"type\": \"portal-already-running\", \"pid\": $existing_pid, \"port\": $BIND_PORT, \"url\": \"http://${BIND_HOST}:${BIND_PORT}/\"}"
      exit 0
    fi
    # Stale PID — process exists but not responding on portal health
    kill "$existing_pid" 2>/dev/null
    rm -f "$PID_FILE"
  else
    rm -f "$PID_FILE"
  fi
fi

cd "$SCRIPT_DIR"

# Foreground mode for environments that reap detached/background processes.
if [[ "$FOREGROUND" == "true" ]]; then
  echo "$$" > "$PID_FILE"
  env \
    PDLC_PORTAL_PORT="$BIND_PORT" \
    PDLC_PORTAL_HOST="$BIND_HOST" \
    node portal.cjs
  exit $?
fi

# Background mode — nohup + disown.
nohup env \
  PDLC_PORTAL_PORT="$BIND_PORT" \
  PDLC_PORTAL_HOST="$BIND_HOST" \
  node portal.cjs > "$LOG_FILE" 2>&1 &
PORTAL_PID=$!
disown "$PORTAL_PID" 2>/dev/null
echo "$PORTAL_PID" > "$PID_FILE"

# Wait for portal-started message.
for i in {1..50}; do
  if grep -q "portal-started" "$LOG_FILE" 2>/dev/null; then
    # Verify still alive after a short window.
    sleep 0.3
    if ! kill -0 "$PORTAL_PID" 2>/dev/null; then
      echo "{\"error\": \"Portal started but was killed. Retry with --foreground.\"}"
      exit 1
    fi
    # Health check the portal's own /portal/health endpoint.
    health_ok="false"
    for h in {1..10}; do
      if curl -sf "http://${BIND_HOST}:${BIND_PORT}/portal/health" >/dev/null 2>&1; then
        health_ok="true"
        break
      fi
      sleep 0.2
    done
    if [[ "$health_ok" != "true" ]]; then
      echo "{\"error\": \"Portal process running but /portal/health not responding on port $BIND_PORT\"}"
      exit 1
    fi
    grep "portal-started" "$LOG_FILE" | head -1
    exit 0
  fi
  sleep 0.1
done

echo '{"error": "Portal failed to start within 5 seconds"}'
exit 1
