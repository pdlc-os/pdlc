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

The frame includes a light/dark toggle button in the header. The user's preference is persisted in `localStorage`. The default theme is dark. Do not write theme-specific CSS in content fragments — use the `var(--md-*)` CSS variables and the theme system handles both modes automatically.

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

## Reference

- Frame template (CSS reference): `scripts/frame-template.html`
- Helper script (client-side interactions): `scripts/helper.js`
- Start script: `scripts/start-server.sh`
- Stop script: `scripts/stop-server.sh`
