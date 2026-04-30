# UX Verify

**Topic slug:** `ux-verify`
**Trigger:** Ship Step 11.5 — runs inside `/pdlc ship` Verify, after smoke tests (Step 11) and before the smoke-test approval gate (Step 12). Conditional on the feature having a `ux-review.md` from Step 10.6.
**Lead:** **Muse** (UX authority for this step). Pulse hands lead off briefly to Muse, who returns it after the verify pass completes.
**Purpose:** Final pre-deploy UX pass against the *as-deployed* artifact — UX-writing drift catch, anti-pattern sweep, 8-state spot-check on top-level interactive elements. ~5 minutes of focused work. P0 findings (verbatim copy violations, anti-patterns that snuck in, accessibility regressions) block the ship; P1+ findings get an ADR.

The catalog content Muse uses lives in `agents/extensions/muse-ux-design.md` and is loaded automatically per her persona directive. The audit trail extends `docs/pdlc/design/[feature-name]/ux-review.md` — the same file from Step 10.6 (Design-Laws Audit) and Construction Review (As-Built Audit). One file per feature, three lifecycle moments captured.

---

## Triage gate (always runs first)

Muse reads `docs/pdlc/design/[feature-name]/ux-review.md` and decides:

| Condition | Tier | Treatment |
|---|---|---|
| `ux-review.md` does not exist, OR triage outcome at Step 10.6 was **Skip** | **Skip** | No UX scorecard exists to verify against. Step is silently skipped — no log entry beyond a one-line note in the episode file at Reflect. Hand back to Pulse immediately. |
| `ux-review.md` triage was **Lite** or **Full** at Step 10.6 | **Lite** | Run the verify pass below (~5 minutes). Append findings to the *Ship Verify* section of `ux-review.md`. |

There is no Full mode at Ship Verify — by ship time the design has already gone through Step 10.6 (full audit) and Construction Review (full as-built audit). Ship Verify is a focused drift-catch, not a redo.

---

## Phase A — Pulse → Muse handoff (when triage = Lite)

Output an **Agent Handoff** block (per `skills/formatting.md`) before the verify pass runs:

> **Pulse (DevOps):** "Muse — smoke tests pass and the deployment is responding. Before we get human sign-off at the gate, run a final UX pass against the as-deployed artifact. The design and as-built scorecards are in `docs/pdlc/design/[feature-name]/ux-review.md`; check for drift between as-built and as-deployed. Flag P0 issues that should block ship. I'll be back at the gate."
>
> **Muse (UX Designer):** "On it. Five-minute pass — UX writing drift, anti-patterns that snuck in, 8-state spot-check on top-level interactives, accessibility regressions. P0 findings block ship; P1+ get an ADR. The findings append to the *Ship Verify* section of `ux-review.md`."

---

## Phase B — Lite verify procedure

Five focused checks. Each runs against the **as-deployed** artifact (the live UI at `[deploy-url]`), not the local code or the design docs.

### Check 1 — UX-writing drift

Walk the user-visible copy on the deployed UI and compare against the catalog's *UX Writing* checklist:

- Button labels: verb + object (no generic "Submit" / "OK" / "Yes").
- Error messages: *what happened → why → how to fix* formula. **Verbatim ban-list** (these block ship as P0):
  - "An error occurred"
  - "Something went wrong"
  - "Invalid input"
  - "Error: undefined"
  - Any string starting with "Error 500" or "500 Internal Server Error" rendered to end users
- Empty states: acknowledgement + value prop + action pathway.
- Tone: system-limitation, not user-failure ("Please enter…" not "You entered an invalid…").
- Terminology consistency vs project glossary.
- Link text functional alone (no "Click here").
- Icon-only buttons have `aria-label`.

The verbatim ban-list uses **string-equality matching**, not fuzzy. A button that says "We hit a snag, try again" is not on the ban-list and is not a P0 (Muse may still flag as P1/P2 if the formula isn't followed). The tight P0 trigger prevents false positives blocking valid ships.

### Check 2 — Anti-pattern sweep

Walk the deployed UI for catalog anti-patterns that may have snuck in post-design:

- Side-stripe borders (colored `border-left` / `border-right` >1px).
- Gradient text via `background-clip: text`.
- Glassmorphism as default (backdrop-blur over busy backgrounds destroying contrast).
- Hero-metric template (big number + label + sparkline + gradient).
- Identical-card grids (icon + heading + 2-line text repeating).
- Modal that wasn't in the design.

Each hit is a finding with severity (typically P1 or P2). Modal-as-first-thought introduced post-design where the design committed to inline alternatives is a P1.

### Check 3 — 8-state spot-check on top-level interactives

Identify the 3-5 most prominent interactive elements on the as-deployed UI (primary CTA, top nav items, primary form's submit, dashboard's main filter, modal close). For each:

- Does it have a visible **focus** ring (`:focus-visible`, ≥3:1 contrast)?
- Is **disabled** state visually distinguishable from active?
- Does **error** state render an `aria-describedby`-connected message?

Missing focus on a primary interactive is **P0** (keyboard-broken). Missing disabled distinguishability or error association is P1.

This is a spot-check, not a full matrix — the full matrix was run at Step 10.6 (design-time) and Construction Review (as-built). Ship Verify catches whatever broke in the deploy pipeline (e.g., a CSS minifier dropped `:focus-visible` rules, a CDN serving a stale stylesheet).

### Check 4 — Accessibility regression

Run a quick a11y read against the deployed UI:

- All text contrast ≥4.5:1 (body) / 3:1 (large text and UI components) per WCAG **1.4.3** / **1.4.11**.
- No information conveyed by color alone (WCAG **1.4.1**).
- All interactive elements reachable by keyboard (WCAG **2.1.1**).
- Touch targets ≥44×44px on the primary interactive flow.

Tools to draw from (per `agents/extensions/muse-ux-design.md` → *Tooling reference*): WebAIM Contrast Checker for ratios, axe DevTools or Lighthouse a11y for an automated sweep against the deployed URL, manual keyboard walk for traversal.

Any regression vs the as-built scorecard is a finding — escalate severity if the design-time scorecard committed to a higher band than the deployed reality.

### Check 5 — Console errors and visible runtime issues

Open the deployed UI and check the browser console:

- Any uncaught exceptions on the primary user journey?
- 404s on critical assets (fonts, scripts, images)?
- Mixed-content warnings?
- Console errors that look user-facing (e.g., a missing translation key rendered as `[object Object]` to end users)?

This is a courtesy check, not a deep-dive — the design-laws audit doesn't usually catch runtime issues, but ship-time is the right moment to flag them as UX surface even if they'll route to engineering for fix.

---

## Phase C — Findings and Ship Verify section

After the five checks, Muse appends the *Ship Verify* section content to `docs/pdlc/design/[feature-name]/ux-review.md` per the template at `templates/ux-review.md` → *Ship Verify (filled at `/pdlc ship` Verify step)*. Fill in:

- The verify date and `[deploy-url]` checked.
- UX-writing drift table (any hits from Check 1).
- Anti-patterns introduced post-design table (Check 2).
- 8-state spot-check delta table (Check 3).
- Accessibility regression notes (Check 4).
- Console / runtime issues (Check 5).
- Findings list with severity tags (P0 blocks ship, P1+ get ADR).

Also update `templates/METRICS.md`'s *UX Scorecard Trend* section with the ship-verify numbers (final Nielsen total, finding counts, cognitive-load delta) so the trend signal carries forward.

---

## Phase D — Muse → Pulse handoff back

Output an **Agent Handoff** block at the close of the verify pass:

**If 0 P0 findings:**

> **Muse (UX Designer):** "Pulse — UX verify complete. [N] findings total: [N1] P1, [N2] P2, [N3] P3. No P0 issues — deployment is UX-clean from my end. The findings are appended to `docs/pdlc/design/[feature-name]/ux-review.md` → Ship Verify section, and the trend numbers are in `METRICS.md`. Back to you for the smoke-test approval gate."
>
> **Pulse (DevOps):** "Got it, Muse. Taking the gate from here."

**If ≥1 P0 finding:**

> **Muse (UX Designer):** "Pulse — UX verify surfaced **[N] P0 finding(s)** that block ship: [list each: source / location / verbatim violation]. These are non-negotiable per the catalog's P0 rule. Recommended path: fix forward (revert the deploy, patch the issue, re-deploy, re-verify) or invoke `/pdlc override` if the team has rationale. The full Ship Verify section is appended to `ux-review.md`."
>
> **Pulse (DevOps):** "Acknowledged — pausing the approval gate. Surfacing the P0 findings to the user before any sign-off."

Pulse then surfaces the P0 findings to the user at the Step 12 gate per the gate's existing flow, with the explicit prompt: *"P0 UX findings block ship until resolved or `/pdlc override` is invoked."*

---

## Key rules

1. **String-equality on the verbatim ban-list** — no fuzzy matching. P0 thresholds are tight on purpose to prevent false positives blocking valid ships.
2. **Spot-check, not full audit** — 3-5 top-level interactives, not every component. The full coverage matrix already ran at Step 10.6 and Construction Review.
3. **As-deployed, not as-built** — Muse checks the live URL, not the local code. Ship Verify catches what broke between as-built and as-deployed.
4. **P0 blocks; P1+ get ADR** — same severity model as Step 10.6 and Construction Review. Consistent across the lifecycle.
5. **Skip silently when no scorecard exists** — features that didn't run Step 10.6 (or skipped at triage) don't need Ship Verify; do not pad the ship flow with no-op steps.
6. **Append, never overwrite** — the Ship Verify section is additive. Earlier sections of `ux-review.md` (Step 10.6 audit, As-Built Audit) stay untouched.
7. **METRICS update is part of the step** — the trend signal only works if every ship verify writes its numbers to `METRICS.md`. Do not skip the metrics write.
