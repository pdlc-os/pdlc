# Step 4.5 — UX Discovery (Muse leads)

This step is **conditional** and **visual-first**. It runs only when the feature has UI/UX elements **and** the visual companion is available. Muse leads — the questions are voiced in Muse's persona and grounded in the project's existing UI inventory so new features inherit the design language already established, rather than introducing disjointed look-and-feel.

Read `skills/interaction-mode.md` and apply the active `[interaction-mode]`. Cadence differs (Sketch batches, Socratic asks one at a time), but every question in this step is **visual-first** — the user always picks among rendered options in the visual companion, never from a text-only list.

---

## When to run

Run this step only if **all** of the following are true at the moment Step 4 (Edge Case Analysis) completes:

1. **The feature has UI/UX elements.** Determined at Step 1 (Visual Companion offer) — if the agent assessed the feature as "non-visual" and skipped the offer, skip this step too.
2. **The visual companion is available** — either already running, or the user is willing to start it now (re-offer protocol below). Text-only mode is a hard skip for this step; do not run UX Discovery without the visual companion.

If the user typed any termination command (`skip`, `done`, `generate`, `draft`, `create`) at any prior point, also skip this step.

## When the visual companion is not running

The visual companion may not be active because:

- **The user declined it at Step 1.** Re-offer once with explicit framing:

  > **Muse (UX Designer):** "Before I ask about the UI, I'd like to start the visual companion — I'll show you 2–3 layout, flow, and state options for each question rather than describing them in text. Want me to start it now? (yes / skip UX questions)"

  If yes: run `bash scripts/start-server.sh --project-dir $(pwd) --feature [feature-name]` per Step 1's protocol. If the server starts, proceed. If 3 attempts fail, skip this step (see below).

  If the user declines again: skip this step. Log in the brainstorm log: `UX Discovery skipped — user declined visual companion`.

- **The visual companion failed at Step 1 and the session is locked into text-only mode.** Skip this step. Log: `UX Discovery skipped — visual companion unavailable (text-only mode)`. Do not retry the server here.

The brainstorm log entry for a skipped UX Discovery section is required (so downstream steps and future audits know why the round was missing). See "Brainstorm log update" below.

---

## Grounding — build the existing UI inventory first

Before drafting any question, read the project's shipped-UI context and assemble `[ui-inventory]`. This is the load-bearing part of this step — the questions must reference existing components and patterns by name so the user's choice is anchored in what already exists, not generated from scratch.

Read in this order (most files are small; whitelisted files have `## Distilled Digest` sections — read those, not the full body):

1. **`docs/pdlc/memory/OVERVIEW.md`** — shipped features and the UX patterns each established.
2. **`docs/pdlc/memory/episodes/index.md`** — list of episode titles to surface UX-relevant prior work.
3. **The 1–2 most recent episode files** under `docs/pdlc/memory/episodes/` — recent UI/UX decisions and component additions.
4. **`docs/pdlc/memory/DECISIONS.md`** — search for design-system, UX, accessibility, or interaction-pattern decisions.
5. **`CLAUDE.md`** at the project root — if the file has the `<!-- pdlc-expanded: true -->` marker (post-first-ship), scan **Key Files** and **Architecture** sections for component locations and frontend conventions.
6. **Existing design docs** — list and read up to 2 recent `docs/pdlc/design/*/` design docs that contain UI specs or wireframe links.
7. **Component inventory in the repo (best-effort scan).** Try these common paths in order; stop at the first that exists and produces results:

   ```bash
   for path in src/components app/components components web/src/components ui design-system packages/ui/src/components; do
     [ -d "$path" ] && find "$path" -maxdepth 2 -type d | head -50 && break
   done
   ```

   Capture component names only (directory or filename), not source. If no path matches, note `[ui-inventory]: no existing component library found — greenfield UI`.

8. **Design tokens / theme files**, if present: `tailwind.config.*`, `theme.*`, `tokens.json`, `design-tokens/`, CSS variables in a global stylesheet. Capture the set of named tokens (color names, spacing scale, typography scale) — do not paste values.

Synthesize the inventory as a single block in working context:

```
[ui-inventory]

Established UX patterns (from OVERVIEW + episodes):
- [pattern 1 — e.g., "Modal-based confirmation for destructive actions, used in /settings/danger-zone and /admin/delete-account"]
- [pattern 2]

Component library (from repo scan):
- Layout: [PageShell, Sidebar, TopBar, ...]
- Inputs: [TextField, Select, DatePicker, ...]
- Feedback: [Toast, Banner, InlineError, ...]
- States: [Skeleton, EmptyState, ErrorState, ...]
- Overlays: [Modal, Drawer, Popover, ...]
- (or "no existing component library found — greenfield UI" if nothing matched)

Design tokens (from theme/tokens):
- Colors: [primary, secondary, surface, ...]
- Spacing scale: [4, 8, 12, 16, 24, 32]
- Typography: [display, heading, body, caption]

Recent UX decisions (from DECISIONS.md):
- [decision — short title and what it locked in]

Greenfield flag: [yes | no]
```

If `greenfield flag = yes`, the questioning shifts: this feature is establishing the design language. Note this in the user-facing intro and record every choice as a foundational pattern in the brainstorm log so the next feature inherits it. When typography, palette, or other design-token choices come up, draw on `agents/extensions/muse-ux-design.md` → *Greenfield Design-Language Choices* — specifically the slop test (could this design be identifiable as AI-generated, and can the team name a real reference point?), the reflex-reject font list (14 fonts AI tools default to — accept only with deliberate rationale), and the 3-words selection procedure (concrete physical-object descriptors → reject the first three reflex picks → catalog browse with the three words). Log the rationale chain (3-words list, reflex-reject font that almost shipped, chosen alternative) so future audits can trace it.

---

## Round design — 3 questions, visual-first, every option grounded

Maximum **3 questions** — consistent with the brainstorm phase's tight question budget. Each question:

- Renders 2–3 options in the visual companion (per `skills/brainstorm/visual-companion.md`).
- **Each option is grounded in `[ui-inventory]`** — it explicitly composes existing components or extends established patterns. At most one option per question may be a "new pattern" alternative, and only when no existing pattern fits.
- Asks the user to pick or describe a deviation. Deviations trigger the rationale capture below.

Skip any question whose answer is fully determined by what's already in `[ui-inventory]` and the discovery answers so far (e.g., if Edge Case Analysis already locked in specific state behaviour and the existing component library has matching state components, Q3 may be redundant — skip it).

### Q1 — Look and feel: layout and information hierarchy

Mockup 2–3 layout options for the feature's primary screen. Each option:

- Composes existing layout components (`PageShell`, `Sidebar`, `TopBar`, etc.) where possible.
- Reuses the established information-hierarchy pattern from a comparable shipped feature, cited by name.
- Uses the project's design tokens (color, spacing, typography scale).

Frame the question through Muse:

> **Muse (UX Designer):** "I've drafted [N] layout options for [feature-name]. Each one composes existing components from your design system — I've cited the shipped feature whose pattern each one follows. Open the visual companion to see them side-by-side. Which feels right, or would you like to describe a different direction?"

The visual companion fragment must label each option with the existing components it reuses, e.g. `Option A: PageShell + Sidebar + Card grid (same pattern as /dashboard)`.

### Q2 — Flow: user journey across screens

Mockup 2–3 flow options as a connected sequence of screens. Each option:

- Reuses an established multi-step flow pattern from a shipped feature, cited by name (e.g. "same wizard pattern as `/onboarding`").
- Uses existing transition and navigation components.
- Shows entry, primary path, branch points, and exit.

Frame:

> **Muse (UX Designer):** "Here are [N] ways the user can move through this feature. Option A mirrors the [shipped flow] you already have. Option B reuses [other shipped flow]'s pattern. [Option C is a new flow — only if needed.] Pick the one that matches what you have in mind, or sketch out a different journey."

If the feature is a single-screen interaction with no flow (e.g. a search bar, a settings toggle), skip this question — note in the brainstorm log: `Q2 skipped — single-screen feature, no flow`.

### Q3 — State coverage: empty, loading, error, success

Mockup the four canonical UI states for the feature's primary screen as a state grid. Each state's option:

- Reuses existing state components (`EmptyState`, `Skeleton`, `ErrorState`, `Toast`, `Banner`, etc.).
- Follows the same state-handling rules as a comparable shipped feature, cited by name.
- Includes a one-line description of what the state communicates and what action (if any) the user can take.

Frame:

> **Muse (UX Designer):** "Every screen has four states the user can land in: empty (no data), loading, error, success. Here's the state grid for [feature-name] using your existing state components. Anything missing or wrong? In particular: the empty state is the user's first impression when they have no data — does this read right?"

If the feature genuinely has only one or two relevant states (e.g., a confirmation dialog has only success/error), narrow the question to those — do not pad to four states for the sake of consistency.

---

## Deviations from existing patterns

If the user picks a deviation from `[ui-inventory]` patterns, **ask once for rationale**:

> **Muse (UX Designer):** "You're going with a different [layout / flow / state pattern] than the one we already have in [shipped feature]. Briefly: what's the reason? I'll capture it as a design decision so the team can see why this feature diverged."

Capture the rationale verbatim in the brainstorm log under "Design Deviations." If the deviation is **substantive** — introduces a new interaction pattern, a new component family, a new visual treatment, or breaks a previously-locked decision in DECISIONS.md — flag it for a potential DECISIONS.md entry. Do not write the entry here; just flag it for the design-doc author.

Per Muse's persona (`agents/muse.md`): convention is a gift to the user — they don't have to relearn the UI. Deviations need an explicit reason, not just preference. If the user cannot articulate a reason, gently push back once and offer to use the existing pattern; if the user still wants to deviate, capture "user preference, no specific rationale" verbatim and move on.

---

## Accessibility floor (always, no separate question)

Each option in Q1, Q2, and Q3 must already include accessibility specs as part of the option, not as a separate question. For each option, the visual companion fragment includes:

- Minimum touch target size (per existing tokens or 44×44pt default)
- Keyboard interaction model (tab order, focus indicators, escape behaviour)
- Screen reader announcement for the primary action
- Color-contrast verification against the design tokens

If an option fails the accessibility floor, do not show it. Replace it with a compliant alternative before presenting.

---

## Quality pass — cognitive load + persona red-flag scan

After the user has made their selections at Q1, Q2, Q3, Muse runs two quick quality-pass checks against the selected options before completing the step. These are not new questions for the user — they are Muse's internal evaluations against the catalog, with results logged to the brainstorm log as discovery findings.

### Cognitive-load 8-item self-assessment

Muse rates each of the 8 cognitive-load items (per `agents/extensions/muse-ux-design.md` → *Cognitive Load Assessment*) against the selected layout, flow, and state options:

1. Can the user complete primary tasks without distraction?
2. Are information groups ≤4 items?
3. Are related elements visually grouped at a glance?
4. Is screen priority immediately recognizable?
5. Is the user focused on one decision sequentially?
6. Are options per decision ≤4?
7. Can the user avoid referencing previous screens?
8. Is complexity revealed progressively?

Failure count of 0-1 is acceptable (no log entry beyond a one-liner in the Quality Pass section). 2-3 failures are *moderate* — log each failure as a discovery finding. ≥4 failures are *urgent* — log each failure AND raise a Decision Review trigger before progressing to Synthesis.

### Persona red-flag pre-scan

Muse selects 2-3 PDLC personas (per `agents/extensions/muse-ux-design.md` → *Persona Red-Flag Scan*) relevant to this feature's user base. Common pairings:

- Developer-tool feature → power user + edge-case stress-tester.
- Consumer-onboarding feature → first-time user + distracted-mobile user.
- Admin / settings feature → power user + accessibility-dependent user.
- Public-facing landing → first-time user + distracted-mobile user + accessibility-dependent user.
- Internal B2B feature → power user + edge-case stress-tester.

For each selected persona, Muse walks their red-flag list against the selected options and logs every hit as a discovery finding. Blocking red flags trigger a Decision Review escalation before progressing.

### Decision Review trigger (inline)

If either of the following is true, Muse pauses progression to Synthesis (Steps 5-6) and presents the finding **inline** to the human as a decision they resolve right here — no separate `/pdlc decide` invocation; Muse handles the decision-review pattern herself within this step:

- Cognitive-load failure count ≥4 against the selected options, OR
- Any persona red-flag is *blocking* (per the catalog's blocking-red-flag definitions — e.g., primary flow keyboard-unreachable, dead-end state with no recovery, primary mobile flow loses input on connection drop).

When triggered, Muse presents:

- **The finding(s)** — what failed and why it matters to the user (cite the specific cognitive-load item or persona red-flag).
- **The catalog reference** — `agents/extensions/muse-ux-design.md` → *Cognitive Load Assessment* or *Persona Red-Flag Scan*, so the human can cross-check.
- **Three resolution paths**, asking the human to pick one:
  - **(a) Revise** — Muse adjusts the selected option to address the failure (e.g., regroups information into ≤4-item chunks, adds a recovery path, restructures the flow). Re-runs the Quality Pass on the revised selection.
  - **(b) Accept-as-tradeoff** — keep the current selection. Muse drafts an ADR entry for `docs/pdlc/memory/DECISIONS.md` capturing the failure, the tradeoff rationale, and the re-evaluation trigger. The user confirms the ADR text before it's written.
  - **(c) Bounce back to a prior question** — re-open Q1 (Look and feel), Q2 (Flow), or Q3 (State coverage) with the failure context as input. The visual companion presents fresh options narrowed by the constraint.

Wait for the human's pick. After resolution, log the outcome in the brainstorm log under *Quality Pass* and proceed to Synthesis (Steps 5-6).

If neither condition is true, log the findings (if any) to the brainstorm log under *Quality Pass* and proceed to Synthesis without prompting.

---

## Brainstorm log update

When UX Discovery completes (or when skipped), append to `[brainstorm-log]` a new section. Use the appropriate template based on outcome:

### If completed:

````markdown
## UX Discovery

**Completed:** [ISO 8601 timestamp]
**Lead:** Muse (UX Designer)
**Visual companion:** active — fragments at `[screen_dir]`

### UI inventory (grounding)

[Paste the [ui-inventory] block built during grounding.]

### Q1 — Look and feel
**Options presented:**
- Option A: [composition + cited shipped pattern]
- Option B: [composition + cited shipped pattern]
- Option C: [if new pattern — what and why offered]

**Selected:** [Option X]
**Visual companion fragment:** `[screen_dir]/q1-layout.html`

### Q2 — Flow
**Options presented:** [as above; or "skipped — single-screen feature"]
**Selected:** [Option X]
**Visual companion fragment:** `[screen_dir]/q2-flow.html`

### Q3 — State coverage
**Options presented:** [as above]
**Selected:** [Option X]
**Visual companion fragment:** `[screen_dir]/q3-states.html`

### Quality Pass
**Cognitive-load assessment:** [n/8 failures — 0-1 acceptable / 2-3 moderate / ≥4 urgent]
- [If failures > 0: list each failed item and a one-line reason]

**Personas selected:** [e.g., power user + first-time user]
**Persona red-flag findings:**
- [Persona name]: [red-flag hit, severity P0/P1/P2/P3, blocking? yes/no]

**Decision Review triggered:** yes / no
- [If yes: which condition triggered (cognitive-load ≥4 OR blocking persona red-flag); the human's pick (revise / accept-as-tradeoff / bounce-back); the resolution outcome — e.g., "revised Q3 state-grid to add explicit error-recovery path" or "accepted-as-tradeoff with ADR-NNN in DECISIONS.md"]

### Design Deviations
[For each deviation from existing patterns:]
- **Deviation:** [what changed vs. the existing pattern]
- **Established pattern:** [name + shipped feature]
- **Rationale:** [user's reason, verbatim]
- **DECISIONS.md candidate:** [yes/no — substantive enough to record]

[Or: "No deviations — every selection composes existing components and patterns."]
````

### If skipped:

````markdown
## UX Discovery

**Skipped:** [ISO 8601 timestamp]
**Reason:** [user declined re-offer | visual companion unavailable | feature has no UI/UX elements | user typed termination command at prior step]
````

Update `last-updated` in the frontmatter to now.

**Do not stop or wait for user input.** Return to `01-discover.md` and immediately proceed to Steps 5–6 (Synthesis). The selections from this step feed directly into the discovery summary, the PRD's User Experience section, and Neo's Bloom's Taxonomy Round 1 (Mechanics) — the user journey from Q2 becomes the basis for Bloom's "walk me through the data flow" question rather than re-asking it.
