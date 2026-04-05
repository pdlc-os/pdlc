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

Before each write, check that `$STATE_DIR/server-info` exists. If it doesn't (or `$STATE_DIR/server-stopped` exists), the server has shut down — restart it with `start-server.sh` before continuing. The server auto-exits after 30 minutes of inactivity.

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
- Read `$STATE_DIR/events` if it exists — this contains their browser interactions (clicks, selections) as JSON lines
- Merge with the user's terminal text to get the full picture
- The terminal message is the primary feedback; events provide structured interaction data

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

## CSS Classes Available

### Options (A/B/C choices)

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

**Multi-select:** Add `data-multiselect` to the container to allow multiple selections:

```html
<div class="options" data-multiselect>
  <!-- same option markup -->
</div>
```

### Cards (visual designs)

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- mockup content --></div>
    <div class="card-body">
      <h3>Name</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

### Mockup container

```html
<div class="mockup">
  <div class="mockup-header">Preview: Dashboard Layout</div>
  <div class="mockup-body"><!-- your mockup HTML --></div>
</div>
```

### Split view (side-by-side comparison)

```html
<div class="split">
  <div class="mockup"><!-- left option --></div>
  <div class="mockup"><!-- right option --></div>
</div>
```

### Pros/Cons

```html
<div class="pros-cons">
  <div class="pros"><h4>Pros</h4><ul><li>Benefit</li></ul></div>
  <div class="cons"><h4>Cons</h4><ul><li>Drawback</li></ul></div>
</div>
```

### Mock elements (wireframe building blocks)

```html
<div class="mock-nav">Logo | Home | About | Contact</div>
<div style="display:flex;">
  <div class="mock-sidebar">Navigation</div>
  <div class="mock-content">Main content area</div>
</div>
<button class="mock-button">Action Button</button>
<input class="mock-input" placeholder="Input field">
<div class="placeholder">Image or content placeholder</div>
```

### Mermaid diagrams

The frame template loads Mermaid from CDN. Write diagrams directly in content fragments:

```html
<h2>Data Flow</h2>
<p class="subtitle">How data moves through the system for this feature</p>

<div class="mockup">
  <div class="mockup-header">Architecture Diagram</div>
  <div class="mockup-body">
    <pre class="mermaid">
      flowchart LR
        A[User] --> B[API Gateway]
        B --> C[Auth Service]
        B --> D[Feature Service]
        D --> E[(Database)]
    </pre>
  </div>
</div>
```

### Typography and layout

- `h2` — page title
- `h3` — section heading
- `.subtitle` — secondary text below title
- `.section` — content block with bottom margin
- `.label` — small uppercase label text
- `.badge-inception`, `.badge-design`, `.badge-build`, `.badge-review` — phase status badges

---

## Browser Events Format

When the user clicks options, interactions are recorded to `$STATE_DIR/events` (one JSON object per line). The file is cleared automatically when you push a new screen.

```jsonl
{"type":"click","choice":"a","text":"Option A - Top Navigation","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Bottom Tab Bar","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Left Sidebar","timestamp":1706000115}
```

The full event stream shows the user's exploration — they may click multiple options before settling. The last `choice` event is typically the final selection, but the pattern of clicks can reveal hesitation worth asking about.

If `$STATE_DIR/events` doesn't exist, the user didn't interact with the browser — use only their terminal text.

---

## Design Tips

- **Scale fidelity to the question** — wireframes for layout questions, prose for conceptual questions
- **Explain the question on each page** — "Which layout feels more professional?" not just "Pick one"
- **2–4 options max per screen** — more than 4 overwhelms; split into rounds if needed
- **Iterate before advancing** — if feedback changes the current screen, write a new version first
- **Use real content when it matters** — for a data-heavy feature, show realistic data in tables, not "Lorem ipsum"
- **Keep mockups focused** — structure and layout matter most; pixel-perfect design comes later

---

## Stopping the Server

```bash
bash scripts/stop-server.sh
```

Mockup files persist in `.pdlc/brainstorm/` for later reference (they were created with `--project-dir`).

---

## Reference

- Frame template (CSS reference): `scripts/frame-template.html`
- Helper script (client-side interactions): `scripts/helper.js`
- Start script: `scripts/start-server.sh`
- Stop script: `scripts/stop-server.sh`
