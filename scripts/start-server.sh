#!/usr/bin/env bash
# Start the PDLC visual companion server and output connection info.
# Usage: start-server.sh [--project-dir <path>] [--feature <name>] [--host <bind-host>] [--url-host <display-host>] [--foreground] [--background]
#
# Starts server on a random high port, outputs JSON with URL.
# Each session gets its own directory under .pdlc/brainstorm/<session-id>/
#
# Options:
#   --project-dir <path>  Store session files under <path>/.pdlc/brainstorm/<feature>-<id>/
#                         instead of /tmp. Files persist after server stops.
#   --feature <name>      Name the session by feature (e.g. user-auth, checkout-flow).
#                         Used as a prefix in the session directory name.
#   --host <bind-host>    Host/interface to bind (default: 127.0.0.1).
#                         Use 0.0.0.0 in remote/containerized environments.
#   --url-host <host>     Hostname shown in returned URL JSON.
#   --foreground          Run server in the current terminal (no backgrounding).
#   --background          Force background mode (overrides Codex auto-foreground).

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Parse arguments
PROJECT_DIR=""
FEATURE_NAME=""
FOREGROUND="false"
FORCE_BACKGROUND="false"
BIND_HOST="127.0.0.1"
URL_HOST=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir)
      PROJECT_DIR="$2"
      shift 2
      ;;
    --feature)
      FEATURE_NAME="$2"
      shift 2
      ;;
    --host)
      BIND_HOST="$2"
      shift 2
      ;;
    --url-host)
      URL_HOST="$2"
      shift 2
      ;;
    --foreground|--no-daemon)
      FOREGROUND="true"
      shift
      ;;
    --background|--daemon)
      FORCE_BACKGROUND="true"
      shift
      ;;
    *)
      echo "{\"error\": \"Unknown argument: $1\"}"
      exit 1
      ;;
  esac
done

if [[ -z "$URL_HOST" ]]; then
  if [[ "$BIND_HOST" == "127.0.0.1" || "$BIND_HOST" == "localhost" ]]; then
    URL_HOST="localhost"
  else
    URL_HOST="$BIND_HOST"
  fi
fi

# Some environments reap detached/background processes. Auto-foreground when detected.
if [[ -n "${CODEX_CI:-}" && "$FOREGROUND" != "true" && "$FORCE_BACKGROUND" != "true" ]]; then
  FOREGROUND="true"
fi

# Windows/Git Bash reaps nohup background processes. Auto-foreground when detected.
if [[ "$FOREGROUND" != "true" && "$FORCE_BACKGROUND" != "true" ]]; then
  case "${OSTYPE:-}" in
    msys*|cygwin*|mingw*) FOREGROUND="true" ;;
  esac
  if [[ -n "${MSYSTEM:-}" ]]; then
    FOREGROUND="true"
  fi
fi

# Generate unique session ID, optionally prefixed with feature name
SESSION_ID="$$-$(date +%s)"
if [[ -n "$FEATURE_NAME" ]]; then
  # Sanitise feature name: lowercase, alphanumeric + hyphens only
  SAFE_FEATURE="$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]-' '-' | sed 's/^-//;s/-$//')"
  SESSION_SLUG="${SAFE_FEATURE}-${SESSION_ID}"
else
  SESSION_SLUG="$SESSION_ID"
fi

if [[ -n "$PROJECT_DIR" ]]; then
  SESSION_DIR="${PROJECT_DIR}/.pdlc/brainstorm/${SESSION_SLUG}"
else
  SESSION_DIR="/tmp/pdlc-brainstorm-${SESSION_SLUG}"
fi

STATE_DIR="${SESSION_DIR}/state"
PID_FILE="${STATE_DIR}/server.pid"
LOG_FILE="${STATE_DIR}/server.log"

# Create fresh session directory with content and state peers
mkdir -p "${SESSION_DIR}/content" "$STATE_DIR"

# Kill any existing server for this session path (should be a fresh session, but be safe)
if [[ -f "$PID_FILE" ]]; then
  old_pid=$(cat "$PID_FILE")
  kill "$old_pid" 2>/dev/null
  rm -f "$PID_FILE"
fi

cd "$SCRIPT_DIR"

# Resolve the harness PID (grandparent of this script).
# $PPID is the ephemeral shell the harness spawned to run us — it dies
# when this script exits. The harness itself is $PPID's parent.
OWNER_PID="$(ps -o ppid= -p "$PPID" 2>/dev/null | tr -d ' ')"
if [[ -z "$OWNER_PID" || "$OWNER_PID" == "1" ]]; then
  OWNER_PID="$PPID"
fi

# Foreground mode for environments that reap detached/background processes.
if [[ "$FOREGROUND" == "true" ]]; then
  echo "$$" > "$PID_FILE"
  env \
    PDLC_BRAINSTORM_DIR="$SESSION_DIR" \
    PDLC_HOST="$BIND_HOST" \
    PDLC_URL_HOST="$URL_HOST" \
    PDLC_OWNER_PID="$OWNER_PID" \
    node server.cjs
  exit $?
fi

# Start server, capturing output to log file.
# Use nohup to survive shell exit; disown to remove from job table.
nohup env \
  PDLC_BRAINSTORM_DIR="$SESSION_DIR" \
  PDLC_HOST="$BIND_HOST" \
  PDLC_URL_HOST="$URL_HOST" \
  PDLC_OWNER_PID="$OWNER_PID" \
  node server.cjs > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null
echo "$SERVER_PID" > "$PID_FILE"

# Wait for server-started message (check log file)
for i in {1..50}; do
  if grep -q "server-started" "$LOG_FILE" 2>/dev/null; then
    # Verify server is still alive after a short window (catches process reapers)
    alive="true"
    for _ in {1..20}; do
      if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        alive="false"
        break
      fi
      sleep 0.1
    done
    if [[ "$alive" != "true" ]]; then
      echo "{\"error\": \"Server started but was killed. Retry in a persistent terminal with: $SCRIPT_DIR/start-server.sh${PROJECT_DIR:+ --project-dir $PROJECT_DIR}${FEATURE_NAME:+ --feature $FEATURE_NAME} --host $BIND_HOST --url-host $URL_HOST --foreground\"}"
      exit 1
    fi

    # Extract port from log and verify with HTTP health check
    SERVER_PORT=$(grep "server-started" "$LOG_FILE" | head -1 | sed 's/.*"port":\([0-9]*\).*/\1/')
    if [[ -n "$SERVER_PORT" ]]; then
      health_ok="false"
      for h in {1..10}; do
        if curl -sf "http://${URL_HOST}:${SERVER_PORT}/health" >/dev/null 2>&1; then
          health_ok="true"
          break
        fi
        sleep 0.2
      done
      if [[ "$health_ok" != "true" ]]; then
        echo "{\"error\": \"Server process is running but /health endpoint is not responding on port $SERVER_PORT\"}"
        exit 1
      fi
    fi

    grep "server-started" "$LOG_FILE" | head -1
    exit 0
  fi
  sleep 0.1
done

# Timeout — server didn't start in 5 seconds
echo '{"error": "Server failed to start within 5 seconds"}'
exit 1
