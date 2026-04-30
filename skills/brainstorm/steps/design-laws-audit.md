# Design-Laws Audit

**Topic slug:** `design-laws-audit`
**Trigger:** Brainstorm Design Step 10.6 — after Step 10.5 threat-modeling completes (the four design artifacts `ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`, `threat-model.md` are in place), **before** PRD design-doc link updates (Step 11) and the design approval gate (Step 12).
**Lead:** **Muse** (UX authority for this step). Neo hands lead off at the start of Step 10.6 and receives lead back at the end. Both handoffs are explicit (banner blocks below).
**Purpose:** Pressure-test the just-generated design against operationalized UX criteria — Nielsen 10 heuristics, the 8-state coverage matrix, cognitive-load assessment, anti-pattern refuse list, UX-writing pass — and propose **fix now / mitigate later / accept-as-tradeoff** for each finding. The UX review goes through the human approval gate at Step 12 alongside the other design artifacts; it is not a separate gate.

The Nielsen scorecard, severity tags, 8-state matrix, cognitive-load checklist, and anti-pattern refuse list referenced in this skill all live in `agents/extensions/muse-ux-design.md` (the Muse UX Design Catalog). Muse loads that catalog as part of her standard invocation; this step *uses* it.

---

## Triage gate (always runs first)

Muse reads the four design documents (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`, `threat-model.md`) and the PRD's user-flow descriptions, then answers three questions to decide the depth of treatment:

1. Does this feature add or modify any **user-facing UI surface**? (new screen, new modal, new dashboard section, new form, new navigation element, new email/SMS template the user sees)
2. Does this feature introduce a **new flow, page, or significant interaction pattern**? (new multi-step flow, new component-of-the-product, new gesture, new keyboard shortcut surface, new async-state design)
3. Does this feature touch **first-experience pathways**? (onboarding, first-time empty state, signup, install, first-time feature discovery)

Each "yes" maps to a depth tier:

| Yeses | Tier | Treatment |
|---|---|---|
| 0 / 3 | **Skip** | Pure backend or no-UI feature. Muse records a one-line note in `ux-review.md`: *"No user-facing UI surface — design-laws audit skipped per Muse's triage."* No party convened. Hand back to Neo immediately. |
| 1 / 3 *(only Q1 yes)* | **Lite** | Muse drafts `ux-review.md` solo — anti-pattern scan + UX-writing pass + 8-state spot-check on top-level interactive elements. No party convened. Output goes through the human approval gate at Step 12 alongside the other design artifacts. |
| 2 / 3 or 3 / 3 | **Full** | Convene the **Design-Laws Roundtable** described below. Heuristics scorecard + cognitive-load assessment + 8-state coverage matrix + anti-pattern scan + UX-writing pass, all in one party. |

Record the triage outcome in the brainstorm log:
```
## Design-Laws Audit Triage
- UI surface: yes/no — [where]
- New flow / pattern: yes/no — [what]
- First-experience pathway: yes/no — [which]
- Triage tier: Skip / Lite / Full
```

---

## Phase A — Neo → Muse handoff (always)

Output an **Agent Handoff** block (per `skills/formatting.md`) at the start of Step 10.6, before triage runs:

> **Neo (Architect):** "Muse — design documents and threat model are in place at `docs/pdlc/design/[feature-name]/`. Before we lock the design at Step 12, the team needs to pressure-test the user-facing surface against the design laws — heuristics, 8-state coverage, cognitive load, anti-patterns, copy quality. You're up — run the triage, and convene the Roundtable if it warrants. I'll continue Step 11 (PRD link updates) and walk us into the design approval gate at Step 12 once your UX review is in place. The four design artifacts plus the PRD's user flow descriptions are the source of truth for the audit. If UX Discovery ran (Step 4.5), pull in your own findings from there as starting context — you've already named the personas and the critical paths."
>
> **Muse (UX Designer):** "On it. I'll triage the user-facing surface against the design docs, decide whether a full Roundtable is warranted, and bring you back a `ux-review.md` plus MOM if we convene. If the triage comes out Skip, you'll have the file as a one-line record so the audit trail is complete either way. Phantom's threat model is one of my inputs — some of my findings will reference his constraints (e.g., a security-required confirmation modal I'd otherwise refuse on UX grounds)."

---

## Phase B — Full mode flow (when triage = Full)

### Participants

The full team — 9 built-in agents plus any matching custom agents from `.pdlc/agents/`. **Muse leads** (current-step authority); the other agents contribute from their domains:

| Agent | Design-laws lens |
|---|---|
| **Muse** *(lead)* | Drives heuristic scoring; drives 8-state coverage check; drives cognitive-load assessment; drives anti-pattern scan; final severity assignment; chairs cross-talk |
| **Atlas** | Product impact per finding — which findings actually matter for *this* product/user/value-prop; arbitrates "fix now vs mitigate later vs accept-as-tradeoff" calls from a product perspective |
| **Friday** | Frontend implementation feasibility of each fix; effort estimate per fix; a11y testability with screen readers and keyboard |
| **Bolt** | Backend implications of UX choices (does the proposed loading state match achievable backend timing? does the optimistic-UI rollback path introduce data races?) |
| **Neo** | Architectural implications of fixes (does this require API change? schema change?); arbitrates "redesign vs accept" calls from an architecture perspective |
| **Echo** | Testability of each finding (can we write a regression test for an a11y regression?); coverage gaps the findings reveal |
| **Phantom** | Security implications of UX choices (does the undo path leak info? is the modal-as-first-thought we're refusing actually security-required?); feeds threat-model constraints back as input |
| **Pulse** | Operational implications of UX choices (does the loading state match real production timing? perceived-performance against actual telemetry?) |
| **Jarvis** | Documents the UX review and MOM; ensures decisions are written down clearly with rationale |

Read each agent's persona file before spawning. Use the existing party-mode orchestrator from `skills/build/party/orchestrator.md`.

### Sub-procedure 1 — Setup

Muse loads the proposed flows from the design package and grounds her work in:

- The four design artifacts (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`, `threat-model.md`).
- The PRD's user-flow descriptions and BDD scenarios.
- The catalog at `agents/extensions/muse-ux-design.md` (Muse's reference for thresholds, scorecards, and refuse lists — already loaded by Muse's persona directive).
- `[ui-inventory]` from UX Discovery (Step 4.5) if it ran — names existing patterns to align with, flags greenfield surfaces to author from scratch.
- Threat-model findings (Step 10.5) — Phantom's mitigations may force Muse's design hand, e.g., a security-required confirmation modal Muse would otherwise call AI-slop.

### Sub-procedure 2 — Heuristic scoring (Nielsen 10)

Muse scores each of the 10 heuristics 0-4 against the proposed design per the rubric in the catalog. Other agents contribute observations from their lens — Bolt and Friday on consistency-and-standards (heuristic 4) by knowing the codebase's existing patterns; Atlas on match-with-real-world (heuristic 2) by knowing user mental models; Phantom on error-prevention (heuristic 5) by knowing the threat surface.

Sum to 0-40 and place against the health bands. Each ≤2 score becomes a finding with a severity tag (P0 / P1 / P2 / P3 per the catalog's severity reference).

### Sub-procedure 3 — Operational checks

Three checks run together in this sub-procedure:

- **8-state coverage matrix** — for every interactive element in the proposed flow, verify all 8 states are designed (default / hover / focus / active / disabled / loading / error / success). Missing-state cells become findings; the keyboard-relevant columns (focus, disabled) escalate severity if missed.
- **Cognitive-load 8-item assessment** — Muse rates each item Pass/Fail against the proposed flow. Failure count of 0-1 acceptable, 2-3 moderate, 4+ urgent intervention.
- **UX-writing pass** — button labels (verb + object), error messages (what happened → why → how to fix), empty states (acknowledgement + value prop + action pathway), terminology consistency against project glossary, accessibility-in-writing (link text functional alone, icon-only buttons `aria-label`-equipped).

### Sub-procedure 4 — Anti-pattern scan

Muse runs the catalog's *Anti-Patterns to Refuse* list against the proposed design. Side-stripe borders, gradient text, default glassmorphism, hero-metric template, identical-card grids, modal-as-first-thought, plus the AI-default visual signatures (purple-blue gradient hero, dark navy + cyan accent + thin sans-serif, reflex font choices without rationale).

Each hit becomes a finding with severity (typically P1 or P2) and a proposed action (Replace / Accept-with-ADR / Override-with-rationale). The team can keep any pattern *deliberately* with rationale; Muse refuses to let them through *by reflex*.

### Sub-procedure 5 — Cross-talk and human approval

Findings from sub-procedures 2, 3, and 4 go through cross-talk — the existing protocol from `skills/build/party/spawn-and-mom.md` (up to **3 cross-talk rounds** with early consensus exit). Cross-talk especially matters for design-laws because **chained findings** only surface when one agent's perspective triggers another's:

> *Example chain that needs cross-talk to find:*
> **Muse:** "This delete confirmation is a modal-as-first-thought — undo would be cleaner."
> **Phantom:** "Actually, this delete is irreversible at the data layer — once the row is committed, we can't roll back. Confirmation is security-required here, not reflex."
> **Atlas:** "And our user research shows 40% of these deletions are mid-flow accidents. Confirmation is the right call for this case."
> **Muse:** "OK — kept as confirmation. But the *copy* still needs to follow the formula: name the action, name the consequence, action-specific buttons. 'Are you sure?' / Yes / No → 'Delete invoice for $4,200? This can't be undone.' / Delete invoice / Keep editing."

Output: each finding tagged with severity, proposed action, and dissents (if any). The party produces *recommendations*; the human owns *decisions* at Step 12.

**Pitch+vote within the party (non-binding):** if cross-talk doesn't converge on a finding's severity or proposed action, run a Pitch Round + Vote per `skills/build/party/spawn-and-mom.md` → "Pitch Round + Vote." **The vote informs the party's recommendation per finding — it is not a binding decision.** The human owns final acceptance at the Step 12 design approval gate; the vote tally and pitches are recorded in `ux-review.md` (under the finding's "Cross-talk note" field) and the MOM. P0 findings are non-negotiable — they block ship until resolved or until `/pdlc override` is invoked, regardless of pitch+vote outcome.

**Interaction-mode wiring (Sketch vs Socratic).** Determine the active mode per `skills/interaction-mode.md` (read CONSTITUTION.md §9). The catalog content does not change between modes; only the conduct of this sub-procedure does:

- **Sketch mode** — Muse reports findings concretely with proposed actions. The team reviews and edits.
- **Socratic mode** — Muse conducts the human-facing portion by surfacing findings as questions. Examples: *"Do you think a keyboard-only user has a working path through this checkout flow?"* / *"This confirmation copy says 'Are you sure?' — does the user know what they're confirming?"* / *"The dashboard shows seven equally-weighted metrics. Which one is the primary?"* The user's answers shape the severity assignment and proposed action.

### MOM (Meeting Minutes)

Jarvis writes the MOM to `docs/pdlc/mom/MOM_design-laws_[feature-name]_[YYYY-MM-DD].md` per the existing party-mode pattern. The MOM captures:

- Triage outcome (Skip / Lite / Full) and the three triage answers.
- Participants (built-in + any custom agents).
- Heuristic scorecard with each agent's contributing observations.
- 8-state coverage matrix with elements and missing states.
- Cognitive-load assessment with pass/fail per item.
- Anti-pattern scan with each hit.
- For each finding: severity, proposed action, dissents, final party recommendation.
- Cross-talk highlights (chained findings found via cross-agent discussion).
- Open questions for the human (anything the party couldn't resolve without product- or org-specific context).

### UX review deliverable

Jarvis (with Muse co-authoring the design-laws-content sections) writes the UX review to `docs/pdlc/design/[feature-name]/ux-review.md`. Use `templates/ux-review.md` as the structural template. **Preserve the `<!-- pdlc-template-version -->` comment** as with all other templates.

The UX review is a **living document** — Muse updates it during Construction Review (Wave 3 fills the *As-Built Audit* section) and during Ship Verify (Wave 4 fills the *Ship Verify* section).

---

## Phase C — Lite mode (when triage = 1/3, Q1 only)

When triage produces 1/3 yes (a UI surface is touched but no new flows or first-experience pathways):

- **No party convened.** Muse drafts `ux-review.md` solo.
- **Anti-pattern scan + UX-writing pass + 8-state spot-check** on top-level interactive elements only — don't audit every state of every component; only what changed.
- **No heuristic scorecard** (the surface change is too small for a meaningful 0-40 readout).
- **No cognitive-load assessment** (no new flow to assess against).
- **No MOM** (no meeting happened).
- **Same template** (`templates/ux-review.md`) as full mode — just sparser. Heuristic Scorecard, 8-State Coverage Matrix, and Cognitive Load sections remain blank; Anti-Patterns Found and UX Writing Findings sections are populated.
- **Same approval path** at Step 12 — the human reviews the UX review alongside the other design artifacts.

Lite mode typically takes ~10 minutes of Muse's effort. It's the right depth when the feature changes a single existing surface (e.g., adds a column to an existing table, replaces an icon) — enough to deserve a UX pass but not enough to convene the team.

---

## Phase D — Skip mode (when triage = 0/3)

When triage produces 0/3 yes (pure backend, no UI surface):

- Create `docs/pdlc/design/[feature-name]/ux-review.md` containing only:
  ```markdown
  # UX Review — [feature-name]

  **Triage:** Skipped
  **Date:** [YYYY-MM-DD]
  **Triage answers:**
  - UI surface: no
  - New flow / pattern: no
  - First-experience pathway: no

  **Rationale:** No user-facing UI surface, no new flow or interaction pattern, no first-experience pathway touched. Design-laws audit intentionally skipped per Muse's triage.

  **Re-triage trigger:** if any of the three answers becomes "yes" during Construction (e.g., scope expansion adds a UI surface), re-run the triage and upgrade to Lite or Full as appropriate.
  ```
- Hand back to Neo immediately. Skipped UX reviews still go through Step 12 — the human sees the one-line record and can override the triage if they disagree.

---

## Phase E — Muse → Neo handoff back (always)

After triage and (if applicable) the Roundtable complete, Muse hands lead back to Neo. Output an **Agent Handoff** block at the close of Step 10.6:

**For Full mode:**

> **Muse (UX Designer):** "Neo — UX review is complete. Triage came back **Full**, so we convened the Roundtable. The full breakdown is in `docs/pdlc/design/[feature-name]/ux-review.md`, the MOM is at `docs/pdlc/mom/MOM_design-laws_[feature-name]_[YYYY-MM-DD].md`. Heuristic total scored [n/40] — band: [excellent / good / acceptable / poor / critical]. We surfaced [N] findings — [N1] P0, [N2] P1, [N3] P2, [N4] P3. [N5] are tagged 'fix now' and will need to land as Plan-phase tasks; [N6] are tagged 'mitigate later' and will need ADRs; [N7] are 'accept-as-tradeoff' with rationale. Two open questions for the human are flagged at the bottom — please make sure those surface at the Step 12 approval gate. The doc is yours."
>
> **Neo (Architect):** "Got it, Muse. I'll link `ux-review.md` from the PRD's Design Docs section at Step 11, and at Step 12 I'll present all five design artifacts for human approval together — architecture, data model, API contracts, threat model, UX review. The 'fix now' findings will be the first thing I plumb into task decomposition at Step 13. Anything that lands as 'mitigate later' or 'accept-as-tradeoff' I'll make sure shows up as an ADR before we cross into Plan."

**For Lite mode:**

> **Muse (UX Designer):** "Neo — triage came back **Lite** (UI surface touched but no new flows or first-experience pathways), so I drafted the UX review solo. It's at `docs/pdlc/design/[feature-name]/ux-review.md`. I found [N] findings — anti-pattern hits and a few copy issues, no full heuristic scorecard at this depth. [N1] tagged 'fix now', the rest are 'accept-as-tradeoff' with rationale. The doc is yours; bring it to the Step 12 gate alongside the other design artifacts."
>
> **Neo (Architect):** "Got it. I'll fold the ux-review link into the PRD at Step 11 and walk all five design artifacts to the human together at Step 12."

**For Skip mode:**

> **Muse (UX Designer):** "Neo — triage came back **Skip** (no user-facing UI surface). I've left a one-line record at `docs/pdlc/design/[feature-name]/ux-review.md` so the audit trail is complete. The human will see the skip rationale at the Step 12 gate and can override if they disagree with the triage. Back to you."
>
> **Neo (Architect):** "Got it. Linking the skip-record at Step 11. Continuing to Step 12."

---

## Lifecycle: keeping the UX review alive

The UX review is a **living document**, not a one-shot artifact:

- During **Plan (Steps 13–19)**, Neo verifies that every "fix now" finding has a corresponding Beads task in the decomposed plan.
- During **Construction Review (Wave 3)**, Muse runs an as-built scorecard against the implementation and appends an *As-Built Audit* section to the same `ux-review.md`. Deltas (e.g., the implementation lost 3 of 8 interactive states the design committed to) become Construction-time findings.
- During **Ship Verify (Wave 4)**, Muse runs a final UX-writing pass + anti-pattern sweep + 8-state spot-check against the as-deployed artifact. Findings append to the *Ship Verify* section. P0 deltas (anti-pattern that snuck in, "An error occurred" copy that escaped) block the ship; P1+ get an ADR.
- During **Operation (Reflect Step 14)**, Jarvis verifies the UX review reflects what was actually built and shipped. The Heuristic / Audit-5d / Cognitive-load totals at design-time, as-built, and ship-verify get logged to `METRICS.md` for cross-feature trend analysis.
- **Re-triage on scope change:** if any of the three triage gates flips from "no" to "yes" mid-feature, re-run the audit — the original triage outcome was based on the design at Step 10, not on what the feature became.
