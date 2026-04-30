# Visual Companion Guide

Browser-based visual brainstorming companion for showing mockups, diagrams, and options during Inception.

## When to Use

Decide per-question, not per-session. The test: **would the user understand this better by seeing it than reading it?**

**Use the browser** when the content itself is visual:

- **UI mockups** — wireframes, layouts, navigation structures, component designs
- **Architecture diagrams** — system components, data flow, relationship maps
- **Side-by-side visual comparisons** — comparing two layouts, two color schemes, two design directions
- **Design polish** — when the question is about look and feel, spacing, visual hierarchy
- **Spatial relationships** — state machines, flowcharts, entity relationships rendered as diagrams

**Use the terminal** when the content is text or tabular:

- **Requirements and scope questions** — "what does X mean?", "which features are in scope?"
- **Conceptual A/B/C choices** — picking between approaches described in words
- **Tradeoff lists** — pros/cons, comparison tables
- **Technical decisions** — API design, data modeling, architectural approach selection
- **Clarifying questions** — anything where the answer is words, not a visual preference

A question *about* a UI topic is not automatically a visual question. "What kind of onboarding flow do you want?" is conceptual — use the terminal. "Which of these onboarding screen layouts feels right?" is visual — use the browser.

---

## Starting a Session

```bash
bash scripts/start-server.sh --project-dir $(pwd) --feature [feature-name]
```

The script returns JSON:
```json
{
  "type": "server-started",
  "port": 52341,
  "url": "http://localhost:52341",
  "screen_dir": "/path/to/project/.pdlc/brainstorm/[feature]-[id]/content",
  "state_dir": "/path/to/project/.pdlc/brainstorm/[feature]-[id]/state"
}
```

**Save `screen_dir` and `state_dir` from the response.** Tell the user the URL and to open it in their browser.

**Stable portal URL alternative:** PDLC also ships a bookmarkable proxy at `http://localhost:7352/` that follows whichever visual backend is active. If the user has run `pdlc livemode` previously (or is comfortable bookmarking once), they can keep that tab open across features and the content will update automatically when a new brainstorm session starts. Either URL works — random-port URL for one-shot, portal URL for users who keep the tab around. See `docs/wiki/22-visual-portal.md`.

**From inside a Claude Code session:** the user can run the portal launcher without dropping to a separate terminal — tell them to type `! pdlc livemode` at the prompt. The `!` prefix runs the command in the same session, starts the portal if it isn't running, opens the URL in their default browser, and the startup output (including the URL) lands directly in the conversation. Mention this when first surfacing the URL on a session — it's the smoothest path for users who'd rather stay in Claude Code.

**Tell the user about the annotation toolbar (first time per session).** The visual companion's top-right toolbar lets the user mark up the rendered screen with strokes, drop numbered comment pins, capture a screenshot, and save everything back to PDLC. Surface this when they first open the URL — example phrasing:

> "The annotation toolbar in the top-right lets you mark up what you see: ✏️ draw strokes on a region, 💬 drop a numbered comment pin (with a textbox for your note), 📷 capture a screenshot to send along, 💾 save everything to me, ❓ open the in-browser help. The help card auto-shows the first time you open the visual companion. Use the toolbar when text feedback in the terminal isn't enough — for example when 'this header feels too heavy' is more useful pinned right on the header. Otherwise just click options and reply in the terminal as usual."

The toolbar is unobtrusive — features that don't need annotation (simple A/B click votes) work fine without touching it. The help button is always available; users can re-open the help card any time.

**Finding connection info if you missed stdout:** The server writes its startup JSON to `$STATE_DIR/server-info`. Read that file if you need the URL and paths.

**Note:** Pass `--project-dir $(pwd)` so mockups persist in `.pdlc/brainstorm/` and survive server restarts. Without it, files go to `/tmp` and are cleaned up on stop.

### Platform notes

**macOS / Linux (default):** The script backgrounds the server automatically — no extra flags needed.

**Windows (Git Bash):** Windows auto-detects and uses foreground mode, which blocks the tool call. When calling via the Bash tool, set `run_in_background: true`. Then read `$STATE_DIR/server-info` on the next turn to get the URL.

**Remote / containerized:** If the URL is unreachable from the browser, bind a non-loopback host:
```bash
scripts/start-server.sh --project-dir $(pwd) --feature [feature-name] --host 0.0.0.0 --url-host localhost
```

---

## The Loop

### 1 — Check server is alive, then write HTML

Before each write, verify the server is running:

1. Check that `$STATE_DIR/server-info` exists. If it doesn't (or `$STATE_DIR/server-stopped` exists), the server has shut down.
2. If `server-info` exists, call the health endpoint to verify it's actually responding:
   ```bash
   curl -sf "http://[url]/health"
   ```
   The health endpoint returns `{"status":"ok","uptime":"...","screens":N,"clients":N}`.
3. If the health check fails or the server has stopped, restart it with `start-server.sh` before continuing. The server auto-exits after 30 minutes of inactivity.

**If the server crashed** (check `$STATE_DIR/server-stopped` for the reason), attempt one restart:
> "The visual companion server stopped unexpectedly: [reason]. Restarting..."

The server handles port conflicts automatically (retries up to 5 ports). If the restart fails, switch to text-only mode for the rest of the session:
> "Couldn't restart the visual companion. Switching to text-only mode."

**Text-only fallback:** When the server is unavailable, use terminal descriptions instead:
- Layout/UI questions → structured text with ASCII sketches or markdown tables
- Architecture diagrams → Mermaid code blocks in the terminal
- A/B comparisons → numbered lists with pros/cons
- Design choices → same questions, no "open your browser" instruction

The brainstorm workflow is never blocked by a server failure.

Write your HTML content to a new file in `screen_dir`:
- Use semantic filenames: `navigation.html`, `dashboard-layout.html`, `data-model.html`
- **Never reuse filenames** — each screen gets a fresh file
- Use the **Write tool** — never `cat`/heredoc (dumps noise into the terminal)
- The server automatically serves the newest file

**Content fragments vs full documents:** Write just the content that goes inside the page — no `<html>`, no `<head>`, no CSS. The server wraps your fragment in the frame template automatically (header, PDLC theme, selection indicator, Mermaid CDN, all interactive infrastructure). Only write a full document starting with `<!DOCTYPE` when you need complete control over the page.

### 2 — Tell the user what's on screen, then end your turn

- Remind them of the URL (every step, not just the first)
- Give a brief text summary: "Showing 3 layout options for the dashboard"
- Ask them to respond in the terminal: "Take a look and let me know what you think. Click to select an option if you'd like."

### 3 — On your next turn, read events + terminal

After the user responds:
- Read `$STATE_DIR/events` if it exists — this contains their browser interactions (clicks, selections, **annotations**) as JSON lines
- Merge with the user's terminal text to get the full picture
- The terminal message is the primary feedback; events provide structured interaction data
- **Annotations** (strokes + comment pins drawn via the in-browser toolbar) appear as `{"type":"annotation",...}` summary lines pointing to the full payload at `$STATE_DIR/annotations/annotation-<timestamp>.json`. When the user has annotated a screen, read the full annotation file — it has stroke geometry (so you can describe *what* they marked), comment text per pin, and the screen URL annotated. Treat the comments verbatim like the user typed them in the terminal; treat strokes as positional emphasis on the screen they were drawn over.

### 4 — Iterate or advance

If feedback changes the current screen, write a new file (e.g., `layout-v2.html`). Only move to the next question when the current step is validated.

### 5 — Unload when returning to terminal

When the next step doesn't need the browser (e.g., a clarifying requirements question), push a waiting screen to clear the stale content:

```html
<!-- filename: waiting.html (or waiting-2.html, etc.) -->
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">Continuing in terminal...</p>
</div>
```

This prevents the user from staring at a resolved choice while the conversation has moved on. When the next visual question comes up, push a new content file as usual.

---

## Writing Content Fragments

Write just the content. The server wraps it in the frame template automatically.

**Minimal example — A/B choice:**

```html
<h2>Which navigation pattern works better?</h2>
<p class="subtitle">Consider discoverability and screen real estate</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Top Navigation Bar</h3>
      <p>Horizontal links, always visible, familiar pattern</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>Left Sidebar</h3>
      <p>Vertical nav, collapsible, scales to many items</p>
    </div>
  </div>
</div>
```

No `<html>`, no CSS, no `<script>` tags — the server provides all of that.

---

## CSS Classes, Events, and Design Tips

Read `skills/brainstorm/visual-companion-reference.md` for the full CSS class reference (options, cards, mockups, split views, pros/cons, mock elements, Mermaid diagrams, typography), browser events format, and design tips.

---

## Stopping the Server

```bash
bash scripts/stop-server.sh
```

Mockup files persist in `.pdlc/brainstorm/` for later reference (they were created with `--project-dir`).
