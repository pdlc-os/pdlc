# Visual Companion

During Inception (`/pdlc brainstorm`), PDLC can optionally run a local Node.js + WebSocket server and give you a `localhost` URL to open in your browser.

**Consent-based:** Claude asks in a standalone message whether you want visual support. You can decline and work entirely in the terminal.

**Per-question, not per-session:** Even after accepting, Claude decides each question: browser for visual content (mockups, layout comparisons, Mermaid diagrams), terminal for text (requirements, tradeoffs, scope decisions).

**What appears in the browser:**
- UI wireframes and layout comparisons (click to select your preference)
- Mermaid architecture diagrams and data flow charts
- Side-by-side design options with pros/cons
- The Beads task dependency graph at the end of Plan

**Annotation overlay (Wave 7 + 7b):** the top-right toolbar lets you draw freehand strokes over the rendered screen, drop numbered comment pins anywhere on the content, and (Wave 7b) optionally capture a screenshot of the rendered state. Hit Save and everything POSTs to `/annotation`; a summary line is appended to `$STATE_DIR/events` and the full payload (stroke geometry + comment text + base64 PNG when staged + screen URL) lands at `$STATE_DIR/annotations/annotation-<timestamp>.json`. The agent reads the comment text verbatim like terminal feedback and treats stroke positions as emphasis on the marked region. Useful when a long mockup deserves location-specific feedback ("this header feels too heavy" pinned right on the header) rather than generic terminal commentary.

The toolbar has six buttons: ✏️ Draw, 💬 Pin, 🗑 Clear, 📷 Screenshot, 💾 Save, ❓ Help. The help card auto-shows the first time you open a visual companion session and persists dismissal via `localStorage`. Screenshot capture uses html2canvas (MIT, vendored at `scripts/html2canvas.umd.js`, served at `/html2canvas.umd.js`) and is opt-in per annotation — click the camera button to stage a screenshot before saving; the button gets a green dot to indicate it's queued.

**Portal URL (Wave 0):** the visual companion runs on a random high port, but you don't have to bookmark that. PDLC ships a stable proxy at `http://localhost:7352/` that auto-follows whichever backend is currently active — see [Visual Portal](22-visual-portal.md). Run `pdlc livemode` to launch it in your default browser; it'll start the proxy if needed. Inside a Claude Code session, type `! pdlc livemode` instead — the `!` prefix runs the command in the session itself, so you stay in the conversation and the URL lands inline.

The server shuts down automatically when Inception ends. Mockup files persist in `.pdlc/brainstorm/` for reference.

**Error handling:**
- **Port conflicts:** If the random port is occupied, the server automatically retries up to 5 different ports
- **Health endpoint:** `GET /health` returns server status, uptime, screen count, and connected clients — used by the brainstorm flow to verify the server is alive before each write
- **Crash recovery:** Uncaught exceptions are caught and written to `$STATE_DIR/server-stopped` with the reason. The brainstorm flow detects this, informs you, and auto-restarts
- **Startup validation:** The start script verifies the server responds to `/health` after startup, not just that the process is running
- **Graceful fallback:** If the server fails to start after 3 attempts (or crashes mid-session and can't restart), brainstorm switches to text-only mode — mockups become structured text, diagrams become Mermaid code blocks, and comparisons become numbered lists. The workflow is never blocked by a server failure.


---

[← Previous: Status Bar](15-status-bar.md) | [Back to README](../../README.md) | [Next: Design Decisions →](17-design-decisions.md)
