# Visual Companion Reference
## CSS classes, browser events, and design tips

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
- `.elevation-1` through `.elevation-8` — Material Design shadow levels
- `.ripple` — add to any interactive element for Material ripple effect on click

### Theme toggle

The frame includes a light/dark toggle button in the header. The user's preference is persisted in `localStorage`. The default theme is light (Flexy Admin design system). Do not write theme-specific CSS in content fragments — use the `var(--md-*)` CSS variables and the theme system handles both modes automatically.

Additional Flexy variables available beyond the base set: `--md-primary-light`, `--md-secondary-light`, `--md-error-light`, `--md-success-light`, `--md-warning-light`, `--md-info`, `--md-info-light` — use these for tinted backgrounds (e.g., badge fills, status indicators, alert backgrounds).

---

## Browser Events Format

When the user clicks options or saves annotations, interactions are recorded to `$STATE_DIR/events` (one JSON object per line). The file is cleared automatically when you push a new screen.

### Click events (option/card selection)

```jsonl
{"type":"click","choice":"a","text":"Option A - Top Navigation","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Bottom Tab Bar","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Left Sidebar","timestamp":1706000115}
```

The full event stream shows the user's exploration — they may click multiple options before settling. The last `choice` event is typically the final selection, but the pattern of clicks can reveal hesitation worth asking about.

### Annotation events (strokes + comment pins)

The in-browser overlay toolbar (top-right of the visual companion) lets the user draw strokes and place numbered comment pins. When they hit Save, an `annotation` summary line is appended to `$STATE_DIR/events`:

```jsonl
{"type":"annotation","timestamp":1706000200,"screen_url":"/","stroke_count":3,"comment_count":2,"has_screenshot":false,"annotation_file":"annotations/annotation-1706000200.json"}
```

The full payload lives at `$STATE_DIR/<annotation_file>` and follows this schema:

```json
{
  "timestamp": 1706000200,
  "screen_url": "/",
  "screen_size": {"width": 1440, "height": 900},
  "scroll_top": 0,
  "strokes": [
    {"points": [{"x": 120, "y": 80}, {"x": 130, "y": 85}, ...], "color": "var(--md-error)", "width": 3}
  ],
  "comments": [
    {"x": 200, "y": 150, "number": 1, "text": "this header feels too heavy"},
    {"x": 380, "y": 240, "number": 2, "text": "spacing here is off"}
  ]
}
```

**How to read annotations as the agent:** treat each comment's `text` verbatim like the user typed it in the terminal — it's their feedback. Strokes are positional emphasis ("the user marked this region") and rarely need decoding pixel-by-pixel; the *fact that they drew over a region* is the signal, the geometry is auxiliary. If `has_screenshot` is true, the payload's `screenshot` field carries a base64 PNG data URL of the rendered `.main` element captured via html2canvas (vendored at `scripts/html2canvas.umd.js`, MIT-licensed, served at `/html2canvas.umd.js`). Screenshots are opt-in per annotation — the user explicitly clicks the camera button to stage one before saving.

**Toolbar buttons (top-right of the rendered screen):**

| Button | Action |
|---|---|
| ✏️ Draw | Toggle draw mode; click+drag on screen to add an SVG stroke |
| 💬 Pin | Toggle pin mode; click on screen to drop a numbered comment with a textbox |
| 🗑 Clear | Remove all strokes, pins, and any staged screenshot |
| 📷 Screenshot | Capture the rendered state as PNG, stage for next save (button shows green dot when staged) |
| 💾 Save | POST everything to `/annotation` |
| ❓ Help | Toggle the in-browser help card explaining all five tools |

The help card auto-shows on first visit (persisted via `localStorage` key `pdlc-annotation-help-seen`); users can re-open it any time via the ❓ button.

`POST /annotation` is the endpoint the browser hits — the agent doesn't call it directly. The full payload is preserved for audit; the JSONL line is the lightweight summary for the agent's loop.

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

## Reference

- Frame template (CSS reference): `scripts/frame-template.html`
- Helper script (client-side interactions): `scripts/helper.js`
- Start script: `scripts/start-server.sh`
- Stop script: `scripts/stop-server.sh`
