# Visual Companion

During Inception (`/pdlc brainstorm`), PDLC can optionally run a local Node.js + WebSocket server and give you a `localhost` URL to open in your browser.

**Consent-based:** Claude asks in a standalone message whether you want visual support. You can decline and work entirely in the terminal.

**Per-question, not per-session:** Even after accepting, Claude decides each question: browser for visual content (mockups, layout comparisons, Mermaid diagrams), terminal for text (requirements, tradeoffs, scope decisions).

**What appears in the browser:**
- UI wireframes and layout comparisons (click to select your preference)
- Mermaid architecture diagrams and data flow charts
- Side-by-side design options with pros/cons
- The Beads task dependency graph at the end of Plan

The server shuts down automatically when Inception ends. Mockup files persist in `.pdlc/brainstorm/` for reference.

**Error handling:**
- **Port conflicts:** If the random port is occupied, the server automatically retries up to 5 different ports
- **Health endpoint:** `GET /health` returns server status, uptime, screen count, and connected clients — used by the brainstorm flow to verify the server is alive before each write
- **Crash recovery:** Uncaught exceptions are caught and written to `$STATE_DIR/server-stopped` with the reason. The brainstorm flow detects this, informs you, and auto-restarts
- **Startup validation:** The start script verifies the server responds to `/health` after startup, not just that the process is running
- **Graceful fallback:** If the server fails to start after 3 attempts (or crashes mid-session and can't restart), brainstorm switches to text-only mode — mockups become structured text, diagrams become Mermaid code blocks, and comparisons become numbered lists. The workflow is never blocked by a server failure.


---

[← Previous: Status Bar](15-status-bar.md) | [Back to README](../../README.md) | [Next: Design Decisions →](17-design-decisions.md)
