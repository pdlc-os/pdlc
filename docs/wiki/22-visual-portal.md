# Visual Portal — `http://localhost:7352/`

A bookmarkable proxy URL that multiplexes traffic across PDLC's visual backends. The user opens it once, never copies a URL again, and the portal follows whichever backend is currently active — brainstorm visual companion (mockup voting), future craft live-server (variant generation), or the idle page when nothing is running.

The port `7352` is **PDLC** on a numeric phone keypad — `P=7 · D=3 · L=5 · C=2`. Typeable from memory.

## Why a separate portal exists

PDLC's existing visual companion (`scripts/server.cjs`) and any future craft-class server are deliberately kept as **separate** processes — different runtime audiences, different data shapes, different lifecycle models, different phase ownership. The architectural decision is documented in the integration plan §10.1.

Without a portal, every backend would have its own random high port. Across a feature's life cycle, the user could be asked to copy-paste two different URLs at different phases. The portal solves that seam: **one stable URL, content updates as backends come and go**.

## URL contract

| Property | Value |
|---|---|
| Default URL | `http://localhost:7352/` |
| Port stability | Stable across PDLC upgrades. **Will not change without a major version bump.** |
| Override | Set `PDLC_PORTAL_PORT` to bind elsewhere if 7352 is occupied |
| Bind host | `127.0.0.1` (loopback only) |
| Override bind | Set `PDLC_PORTAL_HOST` |

You can bookmark it. You can teach a teammate to bookmark it. The URL is a contract.

## Reserved namespace

`/portal/*` is reserved for portal-internal routes. The portal never proxies these to backends:

| Path | Purpose |
|---|---|
| `/portal/events` | SSE stream — broadcasts `{type:"backend-changed",to:"<kind>"}` when active backend swaps |
| `/portal/auto-reload.js` | The auto-reload script as an external `<script src>` (CSP fallback when inline injection is blocked) |
| `/portal/manifest` | Read-only JSON of the current manifest — useful for debugging |
| `/portal/health` | Portal's own health endpoint — status, active backend kind, SSE client count |

Backends should never serve URLs starting with `/portal/`. The portal will refuse to proxy them.

## How it picks the active backend

The portal reads `~/.pdlc/portal/manifest.json` to determine which backend to proxy to. The schema:

```json
{
  "version": 1,
  "active": {
    "id": "brainstorm-12345-1714477200000",
    "kind": "brainstorm",
    "port": 52341,
    "host": "127.0.0.1",
    "url": "http://localhost:52341",
    "project": "/path/to/project",
    "feature": "feature-name",
    "started_at": "2026-04-30T12:00:00Z",
    "owner_pid": 12345,
    "backend_pid": 67890
  },
  "secondary": [
    /* previous active backends, most-recent first */
  ]
}
```

Each backend writes its entry to the manifest on startup and clears it on graceful shutdown. The portal `fs.watch`es the manifest and broadcasts a `backend-changed` SSE event when `active.id` changes, prompting open browsers to reload.

If the active backend's `/health` endpoint doesn't respond within 1 second, the portal serves the idle page with a hint message. This is the safety net for ungraceful shutdowns (SIGKILL, crashes) where the manifest entry is stale.

## Auto-reload via injected SSE script

The portal injects a small script before `</body>` in every HTML response it proxies. The script opens an EventSource on `/portal/events` and listens for `backend-changed` events. When one fires, the script shows a **5-second cancellable banner** ("PDLC backend switched to **craft**. Reloading in 5s. [Reload now] [Cancel]") before calling `location.reload()`.

The banner is mandatory from day one — input loss (a half-typed comment, a mid-flow form) is a worse failure mode than a small UI element. The Cancel button preserves the user's in-flight work; the Reload now button skips the timer.

If a backend's HTML carries a strict CSP that blocks the inline script, the portal also serves it at `/portal/auto-reload.js` as a fallback — most CSPs that allow `script-src 'self'` will accept this since the portal serves it from its own origin (`localhost:7352`). If the CSP forbids it entirely, the user has to reload manually on backend swap.

## Backend lifecycle and coexistence

Multiple backends can run simultaneously. The portal does not enforce uniqueness — it just multiplexes. Default flow:

1. **Brainstorm only.** Visual companion on a random high port (e.g. 52341). Manifest's `active` is the brainstorm entry; `secondary` is empty.
2. **Brainstorm + craft (future).** When `/pdlc craft` triggers automatically (post-Wave-0), the craft server starts on its own port. Visual companion stays alive. Manifest's `active` becomes craft; brainstorm moves to `secondary`. Portal broadcasts `backend-changed`. Open browser tabs reload to the craft view.
3. **Brainstorm idle-out.** The visual companion's existing 30-min idle auto-exit handles cleanup. When it exits, it removes itself from the manifest. If it was the only backend, the portal shows the idle page.

## Multi-project handling

If two PDLC projects are open in two terminals, both spawn backends that register with the **same** user-level manifest. The portal becomes a project-multiplexer:

- **One project active at a time** (most common case): the bookmark contract holds — `localhost:7352` shows whichever project's backend is current.
- **Two projects with simultaneous backends**: the portal's idle page (and chooser overlay, when implemented) lists both. The user picks which to view.

This is option (a) from the integration plan §10.6 Q2 — one portal per machine, multi-project support layered on. Preserves the bookmark for the common case.

## Starting and stopping

```bash
# Start the portal (auto-detects foreground/background per platform)
bash scripts/start-portal.sh

# Or via the CLI (also opens the URL in your default browser)
pdlc livemode

# Stop manually (when the brainstorm session doesn't auto-clean)
kill $(cat ~/.pdlc/portal/portal.pid)
```

**From inside a Claude Code session:** type `! pdlc livemode` at the prompt — the `!` prefix runs the command in the session itself, so the portal startup output and URL land directly in the conversation, no need to drop to a separate terminal. This is the smoothest path when an agent (e.g. Muse during brainstorm) wants to point you at the portal mid-flow.

The portal does not have a built-in idle timeout — it stays running until killed or the machine reboots. Cost is low (idle Node process, a few MB RAM). Future enhancement: auto-exit when no backend has been active for an hour.

## Direct URLs still work

The underlying backend's URL (e.g. `http://localhost:52341/` for the visual companion) remains valid for the lifetime of that backend. Power users can bookmark direct URLs for debugging. The portal does not intercept or hide direct backend access.

## Files involved

| File | Role |
|---|---|
| `scripts/portal.cjs` | The proxy server (vanilla Node HTTP + WebSocket) |
| `scripts/start-portal.sh` | Orchestrator (foreground/background mode, health check loop) |
| `scripts/lib/platform-detect.sh` | Platform-aware foreground-mode detection (shared with `start-server.sh`) |
| `bin/pdlc.js` (`pdlc livemode`) | CLI command — starts the portal if needed, opens URL in browser. Backend-agnostic: works whether the brainstorm visual companion or a future craft live-server is rendering. |
| `~/.pdlc/portal/manifest.json` | The shared manifest backends register with |
| `~/.pdlc/portal/portal-info.json` | The portal's own start info (PID, port, started_at) |
| `~/.pdlc/portal/portal.pid` | Background-mode PID file |
| `~/.pdlc/portal/portal.log` | Background-mode log |

## When does this matter

The portal pays off when there are **two or more backend types**. With only the visual companion (current default), the portal is a small UX win — one stable URL across brainstorm sessions. The bigger payoff arrives when craft (or any future visual backend) ships — the URL stays the same; only the content updates.

---

[← Previous: Agent & Skill Extensions](21-agent-extensions.md) | [Back to README](../../README.md)
