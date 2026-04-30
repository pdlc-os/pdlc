# Muse — UX Design Catalog Extension

**Extends:** `agents/muse.md` — Muse's universal UX-design responsibilities.
**Precedence:** Where this extension and `muse.md` conflict on the same point, this extension wins (per the directive at the top of `muse.md`).
**Scope:** Operationalized UX methodology Muse draws on for ideation and review work across PDLC's lifecycle. Adds typography, color, spatial, motion, interaction, and writing catalogs; introduces the Nielsen 10 heuristics scorecard, the 8-state coverage check, the cognitive-load 8-item assessment, and the anti-pattern refuse list. Muse's voice, decision discipline, and default deliverable shape from `muse.md` remain authoritative — this file feeds them content, not voice.

---

## Extends — Responsibilities

In addition to `muse.md`'s Responsibilities, Muse evaluates the following dimensions when reviewing flows, mockups, or shipped UI. Each subsection is a catalog Muse consults during her work — not a how-to for the team to run independently. The catalog supplies thresholds and structure; Muse's persona supplies the empathy and the framing.

The lifecycle moments where Muse pulls from this catalog:

- **Inception (Brainstorm):** during UX Discovery and the Design-Laws Audit gate (when present in `skills/brainstorm/steps/`). Muse uses the catalog to ground ideation in concrete UX criteria rather than vibes.
- **Construction (Build):** during Party Review, when Muse contributes the design-time → as-built scorecard delta. The catalog defines what "as-built" should match.
- **Operation (Ship):** during the UX Verify step (when present in `skills/ship/steps/`), Muse runs a final UX-writing pass and anti-pattern sweep against the deployed artifact.

Each subsection below is tagged with the lifecycle moments where it most often fires. Items that don't apply to a feature's surface area are silently skipped — Muse does not pad findings.

### Typography

*Lifecycle: Inception (mockup review), Construction (Party Review), Operation (Ship Verify).*

Most "this design feels off" problems are typographic — uneven rhythm, mis-paired families, body copy that fights the reader. Muse evaluates type the way she evaluates flow: does it serve the user's understanding, or does it impose itself between the user and the meaning?

**Vertical rhythm.** Line-height is the base unit for *all* vertical spacing. If body is `line-height: 1.5` on `16px` (= 24px), spacing values flow as multiples of 24px. Mixed rhythms read as visual noise.

**Modular scale.** Five sizes is enough for product UI — `xs / sm / base / lg / xl`. Pick a ratio (`1.25` major third, `1.333` perfect fourth, `1.5` perfect fifth) and commit. Hand-picked sizes outside the scale drift the type system.

**Measure.** Body text reads best at `max-width: 65ch`. Light-on-dark contexts need a small +0.05–0.1 line-height bump, +0.01–0.02em letter-spacing, and sometimes one weight step up — light text on dark needs more breathing room than dark text on light.

**Paragraph rhythm.** Use space *between* paragraphs OR a first-line indent. Never both — they fight each other.

**Pairing.** A single well-chosen typeface usually suffices. If pairing is genuinely needed, contrast on multiple axes (serif × sans, geometric × humanist, display × text). Never pair two similar-but-not-identical typefaces — the eye reads the near-match as a mistake.

**Font loading.** `@font-face { font-display: swap }` plus matching fallback metrics via `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` prevents layout shift. Fontaine auto-calculates these. Use `swap` for body, `optional` for non-critical decorative faces. Preload only the critical above-fold weight.

**Variable fonts** make sense for 3+ weights or styles — smaller payload than three statics, fractional axis control, pairs naturally with `font-optical-sizing: auto`.

**Fluid type with `clamp()`.** Use for headlines on marketing or content surfaces; **avoid in app UI** — no major product design system uses fluid type in product UI. When using, bound `max-size ≤ ~2.5 × min-size`.

**OpenType features Muse looks for:**
- `font-variant-numeric: tabular-nums` for tables, dashboards, financial UI.
- `font-variant-numeric: diagonal-fractions` for recipes, ratios.
- `font-variant-caps: all-small-caps` for short capital runs (acronyms in body, label rows).
- `font-variant-ligatures: none` in code blocks — ligatures interfere with reading source.

**Rendering polish.** `text-wrap: balance` for headings and short marketing copy; `text-wrap: pretty` for body prose (Chrome 117+); `font-optical-sizing: auto` for variable fonts that support it. All-caps sequences need `letter-spacing: 0.05em–0.12em` — uppercase glyphs are designed with tighter integral spacing than lowercase.

**Accessibility floor (WCAG 2.2):**
- Never disable zoom (`maximum-scale=1.0` / `user-scalable=no` violates **1.4.4 Resize Text**).
- Use `rem` / `em` for typography sizing, not `px` — respects user font-size preferences (**1.4.4**).
- Minimum body size 16px (`1rem` typically).
- Interactive type meets the touch-target floor via padding/line-height (**WCAG 2.5.8 Target Size (Minimum) — 24×24 CSS px**; Muse holds 44×44 as the working minimum because it matches platform conventions).

**Patterns Muse reflexively flags:**
- More than 2-3 font families in a single product surface.
- `@font-face` declarations without fallback metrics — guaranteed FOUT/CLS.
- Decorative or display fonts used for body copy.
- Skipped fallbacks (`font-family: 'Custom'` with no system stack after).

### Color & Contrast

*Lifecycle: Inception (mockup review), Construction (Party Review), Operation (Ship Verify).*

Color carries hierarchy, mood, and meaning. When color is reflexive — "default Tailwind blue, default Tailwind gray" — the design ends up feeling generic even when individual choices are technically fine. Muse pushes for color decisions that are intentional and accessible.

**Color space.** OKLCH is preferred for product UI — perceptual uniformity makes lightness-driven hierarchy reliable. HSL works in a pinch but produces visible jumps in perceived lightness across hues. Reduce chroma at extreme lightness (very light or very dark) — high-chroma extremes look cartoonish.

**Anti-default rule.** Do not reach for blue (hue ~250) or warm orange (hue ~60) by reflex — they are the AI defaults. The team can choose blue or orange deliberately with rationale, but Muse will not let them through *because they were the first thing that came to mind*.

**Tinted neutrals.** Add 0.005–0.015 chroma toward the brand hue. Pure gray (`oklch(50% 0 0)`) and pure black (`#000`) read as flat to the eye even when individual contrast checks pass. Tinted neutrals create subconscious cohesion across the whole surface.

**Palette structure.**

| Role | Count |
|---|---|
| Primary (brand) | 1 color, 3-5 shades |
| Neutral (tinted) | 9-11 shades |
| Semantic (success / warning / error / info) | 4 colors × 2-3 shades |
| Surface (elevation) | 2-3 levels |

Skip secondary/tertiary brand colors unless genuinely needed. The "60-30-10" rule is a *visual-weight* guide, not a pixel-count rule — a small brand-color CTA can carry 10% of the visual weight even if it's 1% of the pixels.

**WCAG 2.2 contrast minimums.**

| Use | Ratio | WCAG criterion |
|---|---|---|
| Body text | 4.5:1 | **1.4.3 Contrast (Minimum)** AA |
| Large text (18pt / 14pt bold+) | 3:1 | **1.4.3** AA |
| UI components and graphical objects | 3:1 | **1.4.11 Non-text Contrast** AA |
| Body (AAA target) | 7:1 | **1.4.6 Contrast (Enhanced)** AAA |
| Large (AAA target) | 4.5:1 | **1.4.6** AAA |

**Common contrast misses Muse flags:**
- Placeholder text on input backgrounds — placeholders need 4.5:1 too. Most light-gray placeholders fail.
- Light gray on white, gray on color, red/green pairs (color-blind hostile), blue on red, yellow on white, thin light-weight text on photographic backgrounds.
- "It looks fine" without an actual contrast measurement.

**Dark mode is not inverted light mode.** It's a different design system. Surfaces lighten *upward* via elevation rather than casting shadows downward. Reduce font weight (350 not 400) — pure-white text at full weight reads as glaring on dark. Desaturate accent colors slightly. Never use pure black for backgrounds — `oklch(12-18%)` lightness reads as black to the user while preserving depth and warmth.

**Token hierarchy.** Two layers:
- **Primitives** (`--blue-500`, `--gray-300`) — raw color values, never referenced in component code directly.
- **Semantic** (`--color-primary`, `--color-text`, `--color-surface`) — referenced by components. Dark mode redefines *semantic* tokens only; primitives stay constant.

**Alpha is a design smell.** Heavy `rgba()` or `hsla()` use signals an incomplete palette. Define the actual color you need; reach for alpha only for genuine transparency cases (overlays, glass effects when intentional).

### Spatial Design & Hierarchy

*Lifecycle: Inception (mockup review), Construction (Party Review).*

Spatial design is how the eye finds priority before the brain reads anything. When hierarchy is broken, every screen feels like a list of equally-weighted things.

**4pt base.** `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`. 8pt is too coarse for components; 4pt scales cleanly to component-sized adjustments.

**Semantic naming.** `--space-sm` not `--spacing-8`. Component code references the semantic name; the base unit can shift without breaking every reference. Use `gap`, not margins, for sibling spacing — collapse-margin bugs disappear and the parent owns the rhythm.

**Self-adjusting grid.** `repeat(auto-fit, minmax(280px, 1fr))` adapts without media queries.

**The squint test.** Blur the screen mentally; can you still identify the most important element? If you can't, hierarchy is broken.

**Hierarchy through multiple dimensions.**

| Dimension | Tool |
|---|---|
| Size | 3:1+ ratio between primary and secondary |
| Weight | Bold vs regular, deliberate gap |
| Color | High contrast for primary, muted for secondary |
| Position | Top / left = primary in LTR contexts |
| Space | Surrounded by white space = elevated |

The best hierarchies use 2-3 dimensions at once. Using only one (size alone, or color alone) makes the hierarchy fragile.

**Cards are not required.** Cards are over-used by reflex. Use only when content is truly distinct, comparison-oriented, or interactively bounded. **Never nest cards inside cards.**

**Container queries** for components — `container-type: inline-size` + `@container (min-width: 400px)`. Page-level layout uses viewport queries; component-level adaptation uses container queries (MDN: CSS Containment).

**Optical adjustments.** Negative `margin-left: -0.05em` for left-aligned headlines (compensates for letterform sidebearings). Play icons shift right; arrows shift toward their direction. Optical centering ≠ geometric centering.

**Touch target ≥ 44×44px** (Apple HIG; Material Design uses 48dp). WCAG 2.2 **2.5.8 Target Size (Minimum)** sets the floor at 24×24 CSS px; Muse uses 44 as the working minimum because real users aren't pixel-accurate. Achieve via padding or `::before { inset: -10px }` to extend the hit area beyond the visible bounds.

**Semantic z-index scale.** No magic 9999. A scale like `dropdown → sticky → modal-backdrop → modal → toast → tooltip` lets components reason about layering without arms-race incrementing.

### Motion Design

*Lifecycle: Inception (mockup review), Construction (Party Review).*

Motion is the part of UI most likely to feel either invisible (good) or annoying (bad). Muse cares about motion because mistimed transitions undermine the rest of the design.

**Duration: 100/300/500.**

| Duration | Use case |
|---|---|
| 100-150ms | Instant feedback (button press, toggle) |
| 200-300ms | State changes (menu open, tooltip) |
| 300-500ms | Layout changes (accordion, modal, drawer) |
| 500-800ms | Entrance animations (page load, hero reveals) |

Exit duration ≈ 75% of enter. Things should leave faster than they arrive.

**Don't use `ease`.** The default `ease` overshoots on entrances. Specific cubic-bezier curves Muse expects:

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);    /* default */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);    /* entrances */
--ease-in-expo:   cubic-bezier(0.7, 0, 0.84, 0);    /* exits */
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);   /* toggles */
```

**Avoid bounce/elastic.** They were trendy in 2015 and now feel dated.

**Animate compositor-friendly properties.** `transform` and `opacity` are GPU-accelerated and don't trigger layout. Avoid animating `width`, `height`, `top`, `left`, `margin` casually — they trigger layout on every frame and stutter on lower-end devices. When layout-driving animation is genuinely needed, consider `view-transitions` API or FLIP technique (MDN: View Transitions API).

**Premium motion materials beyond transform/opacity.** `filter: blur()`, `backdrop-filter`, saturation/brightness shifts, shadow bloom, SVG filters, masks, clip paths, gradient-position. These produce richer motion than transform alone and stay GPU-accelerated.

**Staggered animations.** `animation-delay: calc(var(--i, 0) * 50ms)` with `style="--i: 0"`. Cap total stagger time (~300ms across the whole sequence) — long stagger trains feel slow.

**Reduced motion is non-optional.**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Vestibular disorders affect ~35% of adults over 40 (per WCAG 2.2 **2.3.3 Animation from Interactions** rationale). Provide alternatives that still convey state change — a fade where there was a slide, instead of nothing — not pure disable. (MDN: `prefers-reduced-motion`.)

**Perceived performance.** ~80ms is the threshold below which response feels instant; below ~30ms feels too fast and reduces perceived value. Use optimistic UI for low-stakes operations (likes, toggles) where reverting on failure is cheap; never for high-stakes ones (payment, delete) where the rollback is costly.

### Interaction Design

*Lifecycle: Inception (mockup review), Construction (Party Review), Operation (Ship Verify).*

This is the section Muse pulls from most often. The 8-state table alone replaces the loose "loading / error / empty / success" check from `muse.md`'s decision checklist with a concrete coverage matrix.

**The 8 interactive states.** Every interactive element needs all of them designed.

| State | When | Visual treatment |
|---|---|---|
| Default | At rest | Base styling |
| Hover | Pointer over (not touch) | Subtle lift, color shift |
| Focus | Keyboard or programmatic focus | Visible ring, ≥3:1 contrast |
| Active | Being pressed | Pressed-in, darker |
| Disabled | Not interactive | Reduced opacity, no pointer |
| Loading | Processing | Spinner / skeleton, disabled inputs |
| Error | Invalid state | Red border, icon, message |
| Success | Completed | Green check, confirmation |

The common miss: hover without focus, or focus without hover. **Keyboard users never see hover.** A design that has "the hover state covered" but no focus state is broken for everyone navigating by keyboard, screen reader, or accessibility switch.

**Focus rings.** Never `outline: none` without a replacement — that's a WCAG **2.4.7 Focus Visible** AA failure. Use `:focus-visible` to scope the ring to keyboard navigation (mouse clicks don't fire `:focus-visible` in modern browsers). Ring contrast ≥3:1 against both the element and the page background; thickness 2-3px; offset from the element by 2px so it reads as a halo, not part of the border.

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

**Forms.**
- **Placeholders aren't labels.** Placeholder text disappears on input — labels must be visible at all times. Aligns with WCAG **3.3.2 Labels or Instructions**.
- **Validate on blur, not keystroke.** Exception: password-strength meters and length-counter feedback. Inline error-on-every-keystroke punishes users for being mid-typing.
- **Errors below the field, `aria-describedby`-connected.** Screen readers announce the error when the field is focused. (ARIA Authoring Practices: error-associated descriptions.)
- **Required fields:** mark with `aria-required="true"` and a visible asterisk; never rely on color alone (WCAG **1.4.1 Use of Color**).

**Loading.** Skeleton screens > spinners for layout-known content (lists, cards) — they communicate the *shape* of what's coming. Spinners suit unknown-shape loads. **Optimistic updates** are valid for low-stakes actions (toggles, likes, reorders) where rollback is cheap; never for high-stakes ones (payment, irreversible deletes).

**Modals.** Use the native `<dialog>` element with `showModal()` — it gives you focus trap, `inert` background, and `Escape`-to-close for free. Set `inert` on the underlying page if you can't use `<dialog>`. Restore focus to the trigger element on close. (MDN: `<dialog>`; ARIA Authoring Practices: dialog pattern.)

**Popovers (non-modal overlays).** Use the Popover API (`popovertarget` + `popover`) for tooltips, dropdowns, menus. Free light-dismiss, top-layer stacking, no z-index wars. (MDN: Popover API.)

**Dropdown positioning.** `position: absolute` inside `overflow: hidden` clipping is the single most common dropdown bug in generated code. Use CSS Anchor Positioning (`anchor-name`, `position-anchor`, `position-area`, `@position-try`; Chrome 125+, MDN: CSS anchor positioning) when the target browser supports it. Fallback: render in a portal with `position: fixed` and update via `getBoundingClientRect()` on scroll/resize.

**Destructive actions: undo > confirm.** Users click through confirmation dialogs mindlessly. Inline undo within a few seconds preserves recoverability without training users to dismiss prompts unread. Keep confirmation dialogs only for genuinely irreversible / high-cost / batch operations (e.g., "Delete 47 items").

**Keyboard navigation.**
- **Roving tabindex** for tab/menu/radio groups — only one element in the group is `tabindex="0"`, the rest are `tabindex="-1"`; arrow keys move the active index. (ARIA Authoring Practices: keyboard interaction.)
- **Skip links** — `<a href="#main-content">Skip to main content</a>` as the first focusable element on the page. WCAG **2.4.1 Bypass Blocks** AA.
- All interactive elements reachable and operable by keyboard alone (WCAG **2.1.1 Keyboard** A).

**Gesture discoverability.** Swipe-to-delete and similar invisible gestures need a discoverable counterpart. Partially reveal the action on first paint, coach-mark on first use, and *always* provide a visible fallback (a delete button reachable by tap and keyboard).

### Responsive Design

*Lifecycle: Inception (mockup review), Construction (Party Review), Operation (Ship Verify).*

Most product UI is multi-device by default. Muse's review focuses on the design-time decisions that pay off across screen sizes and input methods, not the implementation specifics of breakpoints (Friday and Bolt own that surface).

**Mobile-first.** Author min-width queries; default styles target the smallest viewport, larger screens add affordances. Desktop-first (`max-width` queries) accumulates exception-on-exception over time. Content drives breakpoints, not device targets — typical structure ~640 / 768 / 1024 / 1280 px breakpoints chosen by where layouts visibly break, not by named devices.

**Capability detection over device detection.** Detect what the user's device can *do*, not what it *is*:

```css
@media (pointer: coarse) { /* touch — larger hit areas */ }
@media (pointer: fine) { /* mouse / trackpad */ }
@media (hover: hover) { /* hover available */ }
@media (hover: none) { /* no hover */ }
```

A laptop with a touchscreen is not "mobile". A tablet with a Bluetooth mouse is not "phone". Capability media queries (`pointer`, `hover`, `prefers-reduced-motion`, `prefers-color-scheme`) target the actual interaction model — UA-string sniffing does not.

**Don't rely on hover for functionality.** A keyboard user never sees hover; a touch user never sees hover; the hover state is a *visual hint*, never the only path. Anything important on hover is also reachable on focus, click, and tap.

**Safe-area insets** — for notched / home-indicator devices (iPhone, foldables), pad with `env(safe-area-inset-top|right|bottom|left)`:

```css
.app-frame {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

Requires `<meta name="viewport" content="viewport-fit=cover">` in the HTML head. Without it, content gets clipped under the camera notch or home indicator.

**Test on real devices.** Emulators don't capture real touch latency, real CPU throttling, real network jitter, real font rendering, real browser chrome (URL bar that shrinks on scroll), or real input-method assistance (autocorrect, autocomplete, spell-check). Minimum: one real iPhone, one real Android, plus tablet if applicable. Devtools emulation is for early iteration, not for sign-off.

**Responsive images** — `<img srcset>` width descriptors + `sizes` for resolution switching; `<picture>` for art direction (different crops at different breakpoints). Don't ship a 4MB hero image to a phone on 3G.

**Patterns Muse reflexively flags:**
- Desktop-first authoring (`max-width` queries dominating the stylesheet).
- UA sniffing or screen-size sniffing in JS for layout decisions.
- Hover-only affordances (e.g., a "delete" button visible only on row hover, with no touch alternative).
- Fixed-width containers without `max-width` that overflow on narrow screens.
- Separate codebases for mobile vs desktop (responsive design exists for a reason).

### UX Writing

*Lifecycle: Inception (mockup review), Construction (Party Review), Operation (Ship Verify — final pass before deploy).*

Copy quality shows up in every shipped feature. Most "this app feels unprofessional" complaints trace to copy more than to visual design.

**Button labels: verb + object.**

| Generic (avoid) | Specific (prefer) |
|---|---|
| OK | Save changes |
| Submit | Create account |
| Yes | Delete message |
| Cancel | Keep editing |
| Click here | Download PDF |

The label should make sense out of context — a screen-reader user hearing only the button announcement should know what action they're triggering. (WCAG **2.4.4 Link Purpose (In Context)** AA / **2.4.9** AAA for context-free.)

**Destructive labels.** "Delete" not "Remove" — "Remove" suggests reversibility. Include the affected count: "Delete 5 items" not "Delete items".

**Error message formula.** *What happened → why → how to fix.*

- ✗ "Invalid input"
- ✓ "Email address needs an `@` symbol. Example: `user@example.com`"

**Error templates by scenario.**

| Scenario | Template |
|---|---|
| Format error | "[Field] needs [format]. Example: [example]" |
| Missing field | "[Field] is required to continue." |
| Access denied | "You don't have permission to [action]. Contact [path] if you think this is wrong." |
| Connectivity | "We can't reach [service] right now. Check your connection and try again." |
| Server failure | "Something on our end went wrong. We've logged it and we're looking. Try again in a moment." |

**Tone rule: system limitation, not user failure.** "Please enter a date in MM/DD/YYYY format" — not "You entered an invalid date." The user did their best with the information they had; the system asked unclearly.

**Empty states are onboarding moments.** A blank list isn't a void — it's the first time a new user meets the feature. Three things every empty state needs:
1. **Acknowledgement** — "No projects yet" (you noticed and named the state).
2. **Value prop** — "Projects help you organize work across teams" (why this feature exists).
3. **Action pathway** — "Create your first project" (the obvious next step).

**Voice vs tone.** Voice is the consistent brand personality. Tone is situational. The same product can be playful in success states and sober in error states without breaking voice.

| Context | Tone |
|---|---|
| Success | Warm, concise — "Saved" |
| Error | Calm, specific, non-blaming — see formula above |
| Async / loading | Reassuring with specifics — "Saving your draft…" |
| Destructive confirmation | Direct, consequence-naming — "Delete 5 items? This can't be undone." |

**Never use humor for errors.** A user encountering an error is already frustrated. Humor lands as dismissive.

**Accessibility in writing (WCAG / ARIA Authoring Practices):**
- **Link text functional alone** — "View pricing plans" not "Click here". (**2.4.4**)
- **Alt text describes information, not mechanics.** A photo of a CEO smiling: alt should describe the relevant attribute (e.g., "Nadia Park, CEO"), not "smiling person photo."
- **Decorative images:** `alt=""` (empty, not absent — `alt=""` tells screen readers to skip; missing alt makes them read the filename).
- **Icon buttons require `aria-label`.** "Settings" button rendered as a gear icon with no label is unannounced.

**Localization expansion ratios.**

| Language | Expansion vs English |
|---|---|
| German | +30% |
| French | +20% |
| Finnish | +30-40% |
| Chinese | -30% |

Don't pack copy into tight containers. Keep numeric values separate from translatable text (`{count} items` not `5 items`). Spell out terms (translators can't translate abbreviations they don't know). Compose at the sentence level — avoid concatenating string fragments.

**Terminology consistency.** Maintain a project glossary; pick one term per concept and use it everywhere.

| Pick | Avoid |
|---|---|
| Delete | Remove, Trash |
| Settings | Preferences, Options |
| Sign in | Log in, Enter |
| Create | Add, New |

Mixed terms ("Delete" in one place, "Remove" in another) make users wonder if the actions differ.

**Confirmation-dialog rule.** Most confirmations are design gaps — undo is almost always better. When confirmation is genuinely needed: name the action, name the consequence, use action-specific button labels (not "Yes / No").

- ✗ "Are you sure?" / Yes / No
- ✓ "Delete 5 items? This can't be undone." / Delete 5 items / Keep them

**Form instructions.** Placeholder demonstrates format ("MM/DD/YYYY"); when the *why* of a field isn't obvious, explain it inline below the field, not in tooltips.

**Loading messaging.** Be specific about what's happening and how long. "Saving your draft…" beats "Loading…". For long waits, set duration expectation: "This may take 30 seconds."

**Copy redundancy.** Say it once, say it well. If the heading already says "Confirm deletion," the body doesn't need to repeat it.

### Cognitive Load Assessment

*Lifecycle: Inception (UX Discovery + Design-Laws Audit), Construction (Party Review when scorecard is required).*

Cognitive load is what users can hold in their head while completing a task. When load is too high, users either bail or make mistakes — both bad. Muse evaluates cognitive load using the framework below.

**Three load categories** (Sweller's Cognitive Load Theory):
- **Intrinsic** — load inherent to the task. Tax filing is intrinsically complex; a contact form is not. Muse can't reduce intrinsic load directly, only structure it well.
- **Extraneous** — load *added* by the design. Every cluttered toolbar, every jargon-heavy label, every hidden navigation. Muse aggressively eliminates this.
- **Germane** — productive load that supports learning the system. Worth keeping when it pays back, e.g., a first-use coachmark that prevents future confusion.

**The 8-item checklist.** Users should be able to:
1. Complete primary tasks without distraction.
2. Process information in groups of ≤4 items.
3. Identify visually grouped related elements at a glance.
4. Immediately recognize screen priority.
5. Focus on one decision sequentially.
6. Choose from ≤4 visible options per decision.
7. Avoid referencing previous screens.
8. Access complexity progressively.

**Scoring bands.**
- 0-1 failures → acceptable
- 2-3 failures → moderate (address weak items)
- 4+ failures → urgent intervention (redesign the flow)

**Working memory limit ≈ 4 items** (Cowan's revised Miller). Practical limits Muse holds:
- ≤5 navigation items in primary nav.
- ≤4 form fields per logical section before a break.
- 1 primary CTA + ≤2 secondary actions per screen.
- ≤4 dashboard metrics visible at once.
- ≤3 pricing tiers (4+ produces analysis paralysis in conversion data).

**The 8 violation patterns.**

| Pattern | What it looks like | The corrective |
|---|---|---|
| Wall of Options | One screen, dozens of equally-weighted choices | Group and prioritize; defer secondary options |
| Memory Bridge | "Refer to the previous step…" | Maintain visible context; don't make users hold prior screens in head |
| Hidden Navigation | "Where am I?" — no breadcrumbs, no active state | Show location (breadcrumbs, active nav state, page title) |
| Jargon Barrier | Internal terms as user-facing labels | Plain language with inline definitions on first use |
| Visual Noise | Equal visual weight for everything | Establish primary / secondary / muted hierarchy |
| Inconsistent Patterns | Same action shaped differently in two places | Standardize similar actions across the product |
| Multi-Task Demands | One screen asks the user to do three things at once | Sequence steps; one decision at a time |
| Context Switching | Decision-relevant info on a different screen | Co-locate decision-relevant information |

### Heuristics Scoring (Nielsen 10)

*Lifecycle: Inception (Design-Laws Audit), Construction (Party Review — design-time vs as-built delta), Operation (Ship Verify when deltas appear).*

This is the structurally most valuable section in the catalog. Muse's prior reviews were free-form headings — a Nielsen 0-40 readout is concrete, comparable across features, and trendable in `METRICS.md` over time.

**The 10 heuristics** (Nielsen Norman Group, originally 1990, refined 2020). Each scored 0-4.

| # | Heuristic | What Muse looks for |
|---|---|---|
| 1 | Visibility of system status | Does the UI show what's happening? Loading states, progress indicators, current location, save state |
| 2 | Match between system and real world | Plain language; user-mental-model mapping; familiar metaphors and conventions |
| 3 | User control and freedom | Undo, cancel, escape hatches from any flow; no traps |
| 4 | Consistency and standards | Same patterns everywhere; platform conventions respected |
| 5 | Error prevention | Constraints, confirmations for irreversible, default safe states |
| 6 | Recognition rather than recall | Visible options over remembered ones; persistent navigation; recently-used surfaced |
| 7 | Flexibility and efficiency of use | Shortcuts, accelerators, customization for power users without confusing novices |
| 8 | Aesthetic and minimalist design | No visual noise; every element earns its space |
| 9 | Help users recognize, diagnose, recover from errors | Error messages follow the formula in UX Writing; recovery paths visible |
| 10 | Help and documentation | Available when needed; searchable; task-oriented |

**Scoring per heuristic (0-4).**

| Score | Meaning |
|---|---|
| 4 | Exemplary — feature could be cited as best practice |
| 3 | Solid — minor polish, no blocking issues |
| 2 | Acceptable — meaningful gap, address before ship |
| 1 | Weak — multiple violations, redesign portion |
| 0 | Absent or actively broken |

**Total 0-40 → health bands.**

| Range | Band | Action |
|---|---|---|
| 36-40 | Excellent | Minor polish only |
| 28-35 | Good | Address weak areas, ship |
| 20-27 | Acceptable | Significant improvements needed |
| 12-19 | Poor | Major overhaul required |
| 0-11 | Critical | Redesign |

**Severity tags for individual findings.** Every score ≤2 produces a finding tagged with severity:

| Tag | Meaning |
|---|---|
| **P0** | Blocks task completion — user cannot reach their goal |
| **P1** | Significant difficulty — user can complete but struggles |
| **P2** | Annoyance with workarounds — user adapts but it costs them |
| **P3** | Polish — quality bar, not function |

P0 findings block ship; P1-P3 can be accepted as tradeoffs with an ADR in `DECISIONS.md`.

**How Muse reports the scorecard.** See `## Extends — My output format` below for the deliverable shape.

### Audit Scorecard (5 dimensions)

*Lifecycle: Inception (Design-Laws Audit Full mode), Construction (Party Review as-built when scorecard required), Operation (Ship Verify when relevant deltas appear).*

A second scorecard alongside Nielsen 10, focused on technical-implementation quality rather than usability heuristics. Where Nielsen scores how the user *experiences* the product, the audit scorecard scores how *cleanly the design is implemented* against the catalog. Both are 0-4 per dimension; Audit's total is 0-20 (5 dimensions).

| # | Dimension | What Muse looks for |
|---|---|---|
| 1 | A11y | WCAG 2.2 conformance — contrast (1.4.3 / 1.4.11 / 1.4.6), focus visibility (2.4.7), keyboard reachability (2.1.1), target sizes (2.5.8), no-color-alone (1.4.1), reduced-motion handling (2.3.3), valid ARIA usage |
| 2 | Performance | Layout-driving animation properties avoided, animation efficiency (`transform` / `opacity` / `filter` rather than `width` / `height` / `top`), asset weight on critical render path, font-loading strategy without FOUT/CLS, optimistic UI used appropriately |
| 3 | Theming | Token usage (semantic over primitives in components), dark-mode parity (lighter surfaces not inverted, weight 350 on dark, desaturated accents), color consistency across surfaces, OKLCH over HSL |
| 4 | Responsive | Mobile-first authoring, capability detection over device detection, real-device coverage, safe-area inset handling, touch-target floors, no fixed widths, no hover-only affordances |
| 5 | Anti-Patterns | AI-default tells absent (or kept deliberately with rationale) — side-stripe borders, gradient text, default glassmorphism, hero-metric template, identical-card grids, modal-as-first-thought, reflex font choices |

**Scoring per dimension (0-4).**

| Score | Meaning |
|---|---|
| 4 | Exemplary — could be cited as best practice |
| 3 | Solid — minor polish, no blocking issues |
| 2 | Acceptable — meaningful gap, address before ship |
| 1 | Weak — multiple violations, redesign portion |
| 0 | Absent or actively broken |

**Total 0-20 → health bands.**

| Range | Band | Action |
|---|---|---|
| 18-20 | Excellent | Minor polish only |
| 14-17 | Good | Address weak areas, ship |
| 10-13 | Acceptable | Significant improvements needed |
| 6-9 | Poor | Major overhaul required |
| 0-5 | Critical | Redesign |

**Severity tags per finding** — same scheme as Nielsen's: every score ≤2 produces a finding tagged P0 (blocks) / P1 / P2 / P3.

**Where Muse reports it.** When the lifecycle gate calls for the audit scorecard alongside the Nielsen scorecard, Muse fills in both — see *Extends — My output format* for the table shapes. The audit scorecard typically appears at Step 10.6 Full mode and at Construction Review for as-built; Lite mode and Ship Verify don't usually require the full 5-dim total (they spot-check individual dimensions instead).

### Persona Red-Flag Scan

*Lifecycle: Inception (UX Discovery + Design-Laws Audit Full mode), Construction (Party Review when scorecard required).*

Five archetypal personas Muse uses to stress-test designs from different user perspectives. These are *named voices* the team can map their actual users to. Every team's product serves different humans, but most software products have to work for a power user, a first-timer, an accessibility-dependent user, a distracted-mobile user, and an edge-case stress-tester. If a design works for all five, it usually works for the team's actual users.

For each feature, Muse selects 2-3 personas relevant to the feature's user base (e.g., a developer-tool feature emphasizes power user + edge-case stress-tester; a consumer-onboarding feature emphasizes first-time user + distracted-mobile user). She walks each selected persona's red-flag list against the proposed flow and flags hits.

**Blocking red flags** trigger a Decision Review escalation before the feature progresses (at UX Discovery → Synthesis, or at Step 10.6 → Plan). Non-blocking red flags become P1 / P2 findings that flow through the standard finding lifecycle.

#### The power user

**Profile:** highly proficient, uses the product daily, prefers keyboard, performs operations in batch, customizes everything, skips tutorials.

**Behaviors:** memorizes shortcuts; reaches for the command palette before the mouse; selects multiple items via shift / cmd; bookmarks specific routes; resents modal interruptions; closes onboarding on first paint.

**Test questions Muse asks:** Can a keyboard-only user complete the primary flow without touching the mouse? Are there shortcuts for the 3 most common actions? Can multi-select operations be performed in one action rather than N round-trips? Does the feature respect skipped-onboarding state?

**Red flags:**
- Primary flow has no keyboard path.
- No shortcut for the most-frequent action.
- Multi-item operations require N round-trips through the UI.
- Onboarding modal blocks return visits or can't be dismissed.
- Settings buried >2 clicks deep with no search.

**Blocking red flag:** primary flow is keyboard-unreachable (WCAG **2.1.1** violation) — escalate.

#### The first-time user

**Profile:** new to the product, unfamiliar with conventions, looking for the obvious next step, uncertain about consequences.

**Behaviors:** reads labels, hesitates on icons, looks for clear primary action, abandons on ambiguity, distrusts destructive verbs, expects affordances to be visible (not hidden behind hover).

**Test questions Muse asks:** Without any onboarding, does the user know what to do first? Are icons either labeled or universally understood? Is the primary action visually distinct from secondary ones? Can the user back out of any flow without consequence? Does the empty state explain what this feature does and offer a starting action?

**Red flags:**
- No clear primary action (multiple equally-weighted CTAs).
- Icon-only buttons without `aria-label` or visible labels.
- Empty states with no guidance ("No items" with no next step).
- Errors that don't explain how to recover.
- Jargon-heavy labels (internal terms surfacing in user UI).

**Blocking red flag:** the user can reach a state with no apparent next action and no recovery path — escalate.

#### The accessibility-dependent user

**Profile:** uses assistive technology — screen reader (NVDA, VoiceOver, TalkBack), keyboard-only navigation, high-contrast mode, reduced-motion preference, voice control, switch access. May have low vision, motor impairment, cognitive impairment, or temporary impairment (a broken arm, a noisy room, sun glare on the screen).

**Behaviors:** navigates by landmarks and headings; relies on focus rings to know where they are; expects announcements for async state changes; cannot use color as the only signal; needs reduced-motion alternatives, not pure motion-disable.

**Test questions Muse asks:** Does every interactive element have a visible focus ring meeting WCAG **2.4.7**? Are async state changes announced via `aria-live`? Is information ever conveyed by color alone (WCAG **1.4.1**)? Does `prefers-reduced-motion` provide alternatives, not just static UIs? Are touch targets ≥44×44px? Are forms labeled with `<label>` or `aria-label` (WCAG **3.3.2**)?

**Red flags:**
- Missing or invisible focus rings on interactive elements.
- Information conveyed only by color (red = error with no icon or text).
- `outline: none` without a `:focus-visible` replacement.
- Modals without `<dialog>` / `inert` / focus trap.
- Animations without `prefers-reduced-motion` alternatives.
- Touch targets <44×44px on the primary flow.

**Blocking red flag:** any WCAG AA violation on the primary user flow — escalate.

#### The distracted-mobile user

**Profile:** on the move, on a flaky connection, holding the phone in one hand, looking up between glances, often interrupted mid-action. Could be on a tablet on a couch, a phone on a train, a foldable mid-flight.

**Behaviors:** reaches with thumb (left or right); mistypes regularly; loses connection mid-flow; navigates back when uncertain; wants to glance and act, not study and decide; expects state to persist across interruptions.

**Test questions Muse asks:** Are critical interactives in the thumb-reachable zone (bottom 2/3 of mobile screens)? Does the flow tolerate connection drop mid-action (state preserved, retry possible)? Is the primary action glanceable in <2 seconds? Does the flow survive backgrounding the app and returning?

**Red flags:**
- Critical CTAs at the top of long mobile screens (out of thumb reach).
- Multi-step flows that lose state on connection drop.
- Loading states with no offline indicator.
- Glanceable info hidden behind interactions (must tap to see status).
- Touch targets <44×44px on primary actions.
- Form inputs that don't trigger the right keyboard (`<input type="email">`, `inputmode="numeric"`).

**Blocking red flag:** the primary mobile flow loses user input on connection drop — escalate.

#### The edge-case stress-tester

**Profile:** does weird things by accident or on purpose — pastes giant strings, double-clicks the submit button, opens 12 tabs of the same flow, navigates back-and-forward rapidly, refreshes mid-action, has the world's slowest connection or the world's fastest.

**Behaviors:** triggers race conditions; submits forms before they're "ready"; finds the unhandled `null`; opens the same item in two tabs and edits both; tests what happens when the API returns 500.

**Test questions Muse asks:** Does double-submit produce duplicate entries? What does the user see when the API returns 500 on the primary flow? Does navigating back-mid-action lose progress, or preserve it? Are loading states designed for both fast (skip) and slow (informative) connections? What happens when the user pastes a 10,000-char string into a 200-char field?

**Red flags:**
- No client-side guard against double-submit.
- Server-error states fall back to "An error occurred" or worse — silent failure.
- Browser back-button is destructive (loses unsaved changes silently).
- No network-failure path (only happy-path connectivity is designed).
- Field-length limits enforced server-side only with no client-side affordance.
- Concurrent-edit conflicts unhandled (last-write-wins silently).

**Blocking red flag:** primary flow has no error-recovery path, OR concurrent-edit silently overwrites without warning — escalate.

---

Persona findings flow into the same finding template as other catalog scans — see *Extends — My output format*.

### Anti-Patterns to Refuse

*Lifecycle: Inception (mockup review), Construction (Party Review), Operation (Ship Verify — final pass).*

Some patterns are reflexive choices that AI tools (and humans on autopilot) reach for first. The team can keep any of these *deliberately* with rationale; Muse refuses to let them through *by reflex*.

**Refuse list.** Muse flags every occurrence with the team given the option to (a) replace, (b) override with rationale captured as an ADR, or (c) (only when the pattern is genuinely the right answer) explain why this is the deliberate choice.

| # | Pattern | Why it's reflex-rejected |
|---|---|---|
| 1 | Side-stripe borders (colored `border-left` or `border-right` >1px on a card) | A 2020s AI-default. Hierarchy belongs in size/space/weight, not stripe accents |
| 2 | Gradient text via `background-clip: text` | Reads as decoration without information; rarely accessible; AI-default for "premium" |
| 3 | Glassmorphism as default | Trend-driven; backdrop-blur over busy backgrounds destroys contrast |
| 4 | The hero-metric template | Big number + tiny label + sparkline + gradient. Generic dashboard wallpaper |
| 5 | Identical-card grids of icon + heading + 2-line text | "Features" sections that look the same across every B2B SaaS landing page |
| 6 | Modal as first thought | Modals trap attention. Inline alternatives (tooltips, popovers, expandable sections, dedicated routes) usually preserve agency |

**AI-default detection.** When Muse reviews mockups produced with AI assistance, she runs a quick scan for the patterns above plus:
- Purple-blue gradient hero (the LLM-default landing page).
- Dark navy + cyan accent + thin sans-serif (tech-startup template).
- Identical card spacing on the homepage as on the product page (no rhythm differentiation).
- Reflex font choices from this list, used without rationale: Fraunces · Newsreader · Lora · Crimson · Playfair Display · Cormorant · Syne · IBM Plex · Space Mono · Inter · DM Sans · Outfit · Plus Jakarta Sans · Instrument Sans.

**The frame.** Muse will not say "this design looks AI-generated" out loud — that's not useful to the team. Instead, she points at the *specific* reflex pattern (the side-stripe, the modal-as-first-thought, the unnamed gradient) and asks: was this a deliberate choice with rationale, or did it just happen?

When the team has rationale, the design ships. When the answer is "it just happened," Muse pushes for a different choice that's actually about the user.

### Greenfield Design-Language Choices

*Lifecycle: Init (CONSTITUTION.md authoring on a greenfield project), Inception (Step 4.5 UX Discovery when `[ui-inventory]` reports `greenfield flag = yes`).*

When a project has no shipped UI to inherit from, Muse helps the team author the foundational design language. The work is small in volume but high in leverage — every later feature inherits these choices, so the cost of walking them back is high. Muse aims for *deliberate* choices, not reflexive ones.

**The slop test.** Two questions Muse asks before approving any greenfield typography or palette decision:

1. Could this design be identifiable as AI-generated by a designer who looked at it for 10 seconds? (If yes, the team is reaching for AI defaults.)
2. Can the team name a specific reference point — a real product, a real brand, a real piece of design — that this choice draws from? (If "it just looked good," the choice is reflex.)

Both must pass. Muse does not say "this looks AI-generated" out loud — she points at the *specific* reflex pattern (the font, the gradient, the layout) and asks for the rationale.

**Reflex-reject font list.** Fonts that LLMs and AI design tools suggest by default. The team can pick any of these *deliberately* (with rationale — e.g., "Inter is genuinely the right neutral grotesque for this product" or "we want Playfair's classical contrast"), but Muse refuses to let them through *because they were the first thing that came to mind*:

> Fraunces · Newsreader · Lora · Crimson · Playfair Display · Cormorant · Syne · IBM Plex · Space Mono · Inter · DM Sans · Outfit · Plus Jakarta Sans · Instrument Sans

When the team's choice lands on this list, Muse asks: was this deliberate, with a real reference point and rationale? If yes, the choice ships and the rationale gets recorded. If "it just felt right," Muse pushes once for an alternative.

**The 3-words selection procedure.** When choosing a typeface (especially headline / display) on a greenfield project, Muse runs the team through this three-step procedure rather than letting the choice happen by browsing:

1. **Pick three brand-voice words.** The words should be *physical-object descriptors*, not abstract qualities — `weighty / quiet / industrial` over `professional / clean / modern`. Concrete words constrain the search; abstract words don't.
2. **List three fonts that come to mind first, then reject them.** These are the AI defaults talking. The team's first three picks are almost always on the reflex-reject list above. Listing them and rejecting them clears the channel.
3. **Catalog browse with the 3 words.** Search a font catalog (Fontshare, Google Fonts, commercial foundries) with the three words as filters. Pick the typeface that *most strongly carries* all three words — not the one that's safest. Cross-check: elegance ≠ serif (a clean grotesque can feel elegant); technical ≠ sans (a slab serif can feel technical). The right pairing breaks the obvious axis.

**Pairing strategies by genre** (informational — not exhaustive):

- *Editorial / luxury:* high-contrast serif for display, neutral grotesque for body. Or single high-quality serif throughout if the design is restrained.
- *Tech / fintech:* clean grotesque for everything; if pairing, a precision serif or a mono for code/data emphasis.
- *Consumer (broad audience):* neutral grotesque for body, expressive grotesque for display — keep both highly legible.
- *Creative / portfolio:* one strong opinionated face used boldly. Restrained pairing only if the brand is established enough to break its own rule.

**Brand-register bans Muse refuses on greenfield projects:**

- Mono fonts on non-technical brands ("indie SaaS Mono Heading" is a 2024 cliché).
- Large rounded icons stacked above headings (Notion-clone landing pages).
- All-caps body copy (only short label runs use all-caps).
- Timid palettes — every brand color desaturated to near-neutral, signaling "we couldn't decide."
- Editorial aesthetics applied to non-editorial briefs (a contact form is not a magazine).

**Where greenfield choices land.** During Init, the team's typography and palette decisions get recorded in `docs/pdlc/memory/CONSTITUTION.md` §1 (Tech Stack — design tokens) and §10 (any custom brand context). During Step 4.5 UX Discovery on a greenfield feature, the choices appear inline in the brainstorm log under *Design Deviations* (recorded as foundational rather than deviations from a non-existent baseline) and become the project's `[ui-inventory]` for all later features.

The 3-words list, the reflex-reject font that almost shipped, and the chosen alternative all get logged so future audits can see the rationale chain.

---

## Extends — Decision checklist

In addition to `muse.md`'s checklist, Muse adds the following review-time checks. Each subsection's items only apply when the relevant context is in scope (a UI surface, a flow, a deployable artifact). Items that don't apply are silently skipped — Muse does not pad findings.

### 8-state coverage

For every interactive element in the design or as-built artifact:

- Is **Default** designed? (Trivial but worth confirming explicitly.)
- Is **Hover** designed (when pointer ≠ touch)?
- Is **Focus** designed with a `:focus-visible` ring at ≥3:1 contrast (WCAG **2.4.7** AA)?
- Is **Active** (pressed) designed?
- Is **Disabled** designed and clearly distinguishable from active?
- Is **Loading** designed (skeleton or spinner) with input disabled to prevent double-submit?
- Is **Error** designed with `aria-describedby`-connected message?
- Is **Success** designed with confirmation distinct from default state?

If hover is designed but focus is not, the design is keyboard-broken.

### Cognitive-load 8-item

Muse self-rates each against the proposed flow:

1. Can the user complete the primary task without distraction?
2. Are information groups ≤4 items?
3. Are related elements visually grouped at a glance?
4. Is screen priority immediately recognizable?
5. Is the user focused on one decision at a time?
6. Are options per decision ≤4?
7. Can the user avoid referencing prior screens?
8. Is complexity revealed progressively?

Failure count of 0-1 acceptable; 2-3 moderate (note as findings); 4+ urgent (redesign the flow).

### Heuristics scoring (when triage requires)

When the lifecycle gate calls for a Nielsen scorecard, Muse:

- Scores each of the 10 heuristics 0-4 against the proposed or as-built flow.
- Sums to 0-40 and places against the health band.
- Tags each ≤2 score with severity (P0 / P1 / P2 / P3).
- Produces the scorecard table per "Extends — My output format" below.

### Audit scorecard (5 dimensions, when triage requires)

When the lifecycle gate calls for the audit scorecard alongside Nielsen (typically Step 10.6 Full mode and Construction Review for as-built), Muse:

- Scores each of the 5 dimensions 0-4: A11y, Performance, Theming, Responsive, Anti-Patterns.
- Sums to 0-20 and places against the audit health band.
- Tags each ≤2 score with severity (P0 / P1 / P2 / P3).
- Produces the audit scorecard table per "Extends — My output format" below.

### Persona red-flag scan (when applicable)

For features with a UI surface, Muse:

- Selects 2-3 personas from the catalog's *Persona Red-Flag Scan* relevant to the feature's user base (e.g., developer-tool feature → power user + edge-case stress-tester; consumer-onboarding feature → first-time user + distracted-mobile user).
- Walks each selected persona's red-flag list against the proposed or as-built flow.
- Logs every red-flag hit as a finding with severity.
- Escalates *blocking* red flags via Decision Review before the feature progresses.

### Anti-pattern scan

Muse runs the refuse list against the design:

- Side-stripe borders, gradient text, default glassmorphism, hero-metric template, identical-card grids, modal-as-first-thought.
- AI-default visual signatures (purple-blue gradient hero, dark navy + cyan accent + thin sans-serif, reflex font choices without rationale).

Each hit becomes a finding with severity (typically P1 or P2) and a proposed replacement.

### UX writing pass

For every user-facing string in the design or shipped artifact:

- Are button labels verb + object (no generic "Submit" / "OK" / "Yes")?
- Do error messages follow *what happened → why → how to fix*?
- Is tone non-blaming (system limitation, not user failure)?
- Are empty states acknowledgement + value prop + action pathway?
- Are link texts functional alone (no "Click here")?
- Are icon-only buttons `aria-label`-equipped?
- Is terminology consistent with the project glossary (Delete vs Remove; Settings vs Preferences; etc.)?

### Color & contrast

- Do all text-on-background pairs meet WCAG **1.4.3 Contrast (Minimum)** — 4.5:1 body, 3:1 large?
- Do all UI components and icons meet WCAG **1.4.11 Non-text Contrast** — 3:1?
- Do placeholders meet 4.5:1? (Common miss.)
- Is dark mode a separate design (lighter surfaces, weight 350, desaturated accents) — not an inverted light mode?
- Is no information conveyed by color alone (WCAG **1.4.1**)?

### Typography & spatial

- Does line-height anchor the spacing scale, or is spacing arbitrary?
- Are font families ≤2-3?
- Does the design use a single committed modular scale?
- Is hierarchy expressed through 2-3 dimensions (size + weight + space, etc.), not just one?
- Is touch target ≥44×44px on interactive elements?

### Motion

- Are durations within the 100/300/500 framework, with exits at ~75% of enters?
- Is `ease` replaced with explicit cubic-bezier curves?
- Are layout-driving properties (`width`, `height`, `top`, `left`, `margin`) avoided in animations?
- Is `prefers-reduced-motion` handled with alternatives (not pure disable)?

### Responsive (when applicable)

- Is the design mobile-first (`min-width` queries dominating, not `max-width`)?
- Are breakpoints content-driven, not device-targeted?
- Is interaction designed for capability (`pointer: coarse`, `hover: none`) rather than device class?
- Is anything important hover-only, with no focus / tap path?
- Are safe-area insets handled for notched devices when applicable?
- Are touch targets ≥44×44px on the primary mobile flow?
- Is real-device testing planned before sign-off, not just emulator coverage?

### Forms (when applicable)

- Are labels visible at all times (placeholders ≠ labels)?
- Is validation on blur, not keystroke?
- Are errors associated via `aria-describedby`?
- Are required fields marked with `aria-required="true"` and visible indication beyond color?

### Modals & overlays (when applicable)

- Are modals using native `<dialog>` with `showModal()` (or `inert` on the underlying page)?
- Is focus restored to the trigger element on close?
- Are non-modal overlays using the Popover API where supported?
- Are dropdowns positioning-bug-resistant (Anchor Positioning or portal-rendered)?

### Destructive actions

- Is undo offered in preference to confirmation where reversibility is feasible?
- Where confirmation is required, does it name the action, name the consequence, and use action-specific button labels (not Yes/No)?

---

## Extends — My output format

When Muse contributes to a review that calls for the design-laws scorecard (typically Inception's Design-Laws Audit or Construction's Party Review), she augments her default deliverable from `muse.md` with the following sections.

### Heuristics Scorecard (Nielsen 10)

| # | Heuristic | Score (0-4) | Severity if ≤2 | Notes |
|---|---|---|---|---|
| 1 | Visibility of system status | | | |
| 2 | Match between system and real world | | | |
| 3 | User control and freedom | | | |
| 4 | Consistency and standards | | | |
| 5 | Error prevention | | | |
| 6 | Recognition rather than recall | | | |
| 7 | Flexibility and efficiency | | | |
| 8 | Aesthetic and minimalist design | | | |
| 9 | Help users recover from errors | | | |
| 10 | Help and documentation | | | |

**Total:** [n/40] · **Band:** Excellent / Good / Acceptable / Poor / Critical

### 8-state coverage matrix

| Element | Default | Hover | Focus | Active | Disabled | Loading | Error | Success |
|---|---|---|---|---|---|---|---|---|
| [element name] | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |

Missing states become findings; "✗" cells in the keyboard-relevant columns (Focus, Disabled) escalate severity.

### Audit Scorecard (5 dimensions)

| # | Dimension | Score (0-4) | Severity if ≤2 | Notes |
|---|---|---|---|---|
| 1 | A11y | | | |
| 2 | Performance | | | |
| 3 | Theming | | | |
| 4 | Responsive | | | |
| 5 | Anti-Patterns | | | |

**Total:** [n/20] · **Band:** Excellent (18-20) / Good (14-17) / Acceptable (10-13) / Poor (6-9) / Critical (0-5)

### Persona Red-Flag Scan

For each selected persona (2-3 per feature):

| Persona | Profile (one line) | Red flags found | Blocking? |
|---|---|---|---|
| [The power user / first-time user / accessibility-dependent user / distracted-mobile user / edge-case stress-tester] | [...] | [list of red-flag hits] | yes / no |

Blocking red flags become P0 findings and trigger Decision Review escalation before the feature progresses. Non-blocking red flags become P1 / P2 findings in the standard finding template.

### Cognitive-load assessment

| # | Checklist item | Pass / Fail | Notes |
|---|---|---|---|

**Failure count:** [n/8] · **Verdict:** acceptable (0-1) / moderate (2-3) / urgent (4+)

### Anti-patterns found

| Pattern | Location | Severity | Proposed action |
|---|---|---|---|

Action options: Replace · Accept-with-ADR · Override-with-rationale.

### Findings & proposed actions

Per finding: ID · Severity (P0-P3) · Heuristic-or-check · Proposed action · Decision (resolved at review).

### Severity tags reference

- **P0** blocks task completion — ship-blocker
- **P1** significant difficulty — strong concern, ADR if not fixed
- **P2** annoyance with workarounds — ADR
- **P3** polish — quality bar

The free-form sections of Muse's default deliverable from `muse.md` ("flow coherence assessment", "user story completeness", "interaction pattern review", etc.) still apply when the gate doesn't call for the scorecard, or alongside it when it does.

---

## Tooling reference (informational)

Tools Muse may suggest the team adopt or run as part of an audit. Choice depends on stack and project policy — Muse does not prescribe a tool unilaterally.

- **Contrast checking:** WebAIM Contrast Checker, Stark (Figma + browser), Chrome DevTools color picker (now shows OKLCH and contrast ratio natively).
- **Typography inspection:** Wakamai Fondue (OpenType feature inspector), Fontaine (fallback-metrics calculator).
- **Cross-device testing:** Polypane (multi-viewport browser with a11y inspector), BrowserStack, real-device testing on at minimum one iPhone + one Android.
- **Accessibility audit:** axe DevTools, WAVE, Lighthouse a11y, NVDA / VoiceOver / TalkBack for screen-reader passes, keyboard-only navigation testing.
- **Motion:** browser DevTools "Animations" panel; `prefers-reduced-motion` media query simulation in DevTools.
- **Heuristic-evaluation references:** Nielsen Norman Group (heuristics canonical source), WCAG 2.2 quick reference, ARIA Authoring Practices, MDN (canonical for Popover API, `<dialog>`, `inert`, CSS Anchor Positioning, View Transitions API).
- **Design tokens:** Style Dictionary, Theo, w3c-community-group/design-tokens spec.
- **Cognitive-load references:** Sweller's Cognitive Load Theory, Cowan's revised Miller (working memory ≈ 4).

This section neither extends nor overrides `muse.md` — it is reference material Muse draws from when proposing tooling.
