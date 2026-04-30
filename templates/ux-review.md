# UX Review — [feature-name]
<!-- pdlc-template-version: 1.3.0 -->

**Triage:** Full | Lite | Skipped  *(set per Muse's triage outcome at Brainstorm Step 10.6)*
**Convened:** [YYYY-MM-DD]
**Lead:** Muse (UX Designer)
**Participants:** [list — team for Full mode; Muse-only for Lite; n/a for Skip]
**Status:** Pending human approval (Step 12) | Approved | Approved with overrides | Revision requested

---

## Triage Record

| Question | Answer | Evidence |
|---|---|---|
| Does this feature add or modify any user-facing UI surface? | yes / no | [where] |
| Does this feature introduce a new flow, page, or significant interaction pattern? | yes / no | [what] |
| Does this feature touch first-experience pathways (onboarding, first-time empty state, signup, install)? | yes / no | [which] |

**Triage outcome:** [Full / Lite / Skip]

---

## Heuristics Scorecard (Nielsen 10)

*(Full mode only. Lite mode skips this section.)*

Each heuristic scored 0-4 per the rubric in `agents/extensions/muse-ux-design.md` → *Heuristics Scoring (Nielsen 10)*. Score ≤2 produces a finding; record severity in the *Severity* column.

| # | Heuristic | Score (0-4) | Severity if ≤2 | Notes |
|---|---|---|---|---|
| 1 | Visibility of system status | | | |
| 2 | Match between system and real world | | | |
| 3 | User control and freedom | | | |
| 4 | Consistency and standards | | | |
| 5 | Error prevention | | | |
| 6 | Recognition rather than recall | | | |
| 7 | Flexibility and efficiency of use | | | |
| 8 | Aesthetic and minimalist design | | | |
| 9 | Help users recognize, diagnose, recover from errors | | | |
| 10 | Help and documentation | | | |

**Total:** [n/40]   **Health band:** Excellent (36-40) / Good (28-35) / Acceptable (20-27) / Poor (12-19) / Critical (0-11)

---

## Audit Scorecard (5 dimensions)

*(Full mode only. Lite mode skips the full audit scorecard but may spot-check individual dimensions. Catalog reference: `agents/extensions/muse-ux-design.md` → *Audit Scorecard (5 dimensions)*.)*

Each dimension scored 0-4. Score ≤2 produces a finding; record severity in the *Severity* column.

| # | Dimension | Score (0-4) | Severity if ≤2 | Notes |
|---|---|---|---|---|
| 1 | A11y (WCAG 2.2 conformance — contrast, focus, keyboard, target sizes, ARIA) | | | |
| 2 | Performance (layout-driving animation, asset weight, render path, font loading) | | | |
| 3 | Theming (token usage, dark-mode parity, color consistency, OKLCH) | | | |
| 4 | Responsive (mobile-first, capability detection, safe-area, touch targets) | | | |
| 5 | Anti-Patterns (AI-default tells absent or kept deliberately) | | | |

**Total:** [n/20]   **Health band:** Excellent (18-20) / Good (14-17) / Acceptable (10-13) / Poor (6-9) / Critical (0-5)

---

## 8-State Coverage Matrix

*(Full mode only. Lite mode does an 8-state spot-check on top-level interactive elements only and may use a flat list rather than this matrix.)*

For every interactive element in the proposed flow:

| Element | Default | Hover | Focus | Active | Disabled | Loading | Error | Success |
|---|---|---|---|---|---|---|---|---|
| [element name] | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ |

Missing states become findings. ✗ in the keyboard-relevant columns (Focus, Disabled) escalates severity — keyboard users never see hover, so a design with hover-but-no-focus is keyboard-broken.

---

## Cognitive Load Assessment

Each item scored Pass / Fail per the 8-item checklist in `agents/extensions/muse-ux-design.md` → *Cognitive Load Assessment*.

| # | Checklist item | Pass / Fail | Notes |
|---|---|---|---|
| 1 | Users can complete primary tasks without distraction | | |
| 2 | Information presented in groups of ≤4 items | | |
| 3 | Related elements visually grouped at a glance | | |
| 4 | Screen priority immediately recognizable | | |
| 5 | User focused on one decision sequentially | | |
| 6 | ≤4 visible options per decision | | |
| 7 | User can avoid referencing previous screens | | |
| 8 | Complexity revealed progressively | | |

**Failure count:** [n/8]   **Verdict:** acceptable (0-1) / moderate (2-3) / urgent (4+)

---

## Persona Red-Flag Scan

*(Full mode only. Catalog reference: `agents/extensions/muse-ux-design.md` → *Persona Red-Flag Scan* — choose 2-3 archetypes relevant to this feature's user base.)*

For each selected persona, walk the catalog's red-flag list against the proposed flow and record hits. Blocking red flags become P0 findings and trigger Decision Review escalation; non-blocking red flags become P1 / P2 findings in the standard finding template below.

| Persona | Profile (one line) | Red flags found | Blocking? |
|---|---|---|---|
| [The power user] | [highly proficient, keyboard-driven, batch operations, skips tutorials] | [list of red-flag hits with one-line locations] | yes / no |
| [The first-time user] | [unfamiliar with conventions, looking for clear primary action] | [...] | yes / no |
| [The accessibility-dependent user] | [screen reader / keyboard-only / reduced-motion / high-contrast] | [...] | yes / no |
| [The distracted-mobile user] | [on the move, flaky connection, thumb-reachable, glanceable] | [...] | yes / no |
| [The edge-case stress-tester] | [pastes giant strings, double-clicks submit, network failures, concurrent edits] | [...] | yes / no |

*(Use only the personas selected for this feature; remove rows for personas not exercised.)*

---

## Anti-Patterns Found

Each hit from the *Anti-Patterns to Refuse* list in `agents/extensions/muse-ux-design.md`. Action options: **Replace** · **Accept-with-ADR** · **Override-with-rationale**.

| Pattern | Location | Severity | Proposed action |
|---|---|---|---|
| [e.g., side-stripe border on metrics card] | [where in the design] | P1 / P2 | Replace / Accept-with-ADR / Override-with-rationale |

---

## UX Writing Findings

Findings from the UX writing pass — button labels, error messages, empty states, terminology consistency, accessibility-in-writing checks.

| Surface | Issue | Severity | Proposed copy |
|---|---|---|---|
| [e.g., delete-confirmation modal] | "Are you sure?" / Yes-No labels | P2 | "Delete 5 items? This can't be undone." / Delete 5 items / Keep them |

---

## Findings & Proposed Actions

*(One section per finding that scored ≤2 / failed / surfaced as an anti-pattern hit / 8-state gap / UX-writing issue. Order by severity descending — P0 first.)*

### F-001 — [Finding Title]

- **Source:** Heuristic-N | Cognitive-load item N | Anti-pattern: [name] | 8-state coverage gap on [element] | UX-writing | Audit-dimension: [name] | Persona: [name] | Other
- **Severity:** P0 (blocks completion) | P1 (significant difficulty) | P2 (annoyance with workarounds) | P3 (polish)
- **Description:** [one-paragraph plain-language description of the finding and why it matters to the user]
- **Catalog reference:** *(point to the relevant section in `agents/extensions/muse-ux-design.md` so reviewers can cross-check)*
- **Proposed action (Muse's recommendation):** Fix now | Mitigate later | Accept-as-tradeoff
  - **If "Fix now":** [specific design change; will land as Plan-phase Beads task at Step 13–19]
  - **If "Mitigate later":** [tech-debt entry to be created in `docs/pdlc/memory/DECISIONS.md` as ADR; re-evaluation trigger]
  - **If "Accept-as-tradeoff":** [Atlas's product justification + Muse's residual-UX assessment; ADR in `DECISIONS.md`. **Note: P0 findings cannot be accepted — they block ship until resolved or `/pdlc override` is invoked.**]
- **Decision (human, at Step 12 approval):** *[blank until human reviews; one of: confirm Muse's recommendation / override to: ___ / reject and require redesign]*
- **Cross-talk note:** *[fill in if this finding was sharpened via cross-agent discussion at the Design-Laws Roundtable — capture the chain]*

### F-002 — [Finding Title]
*(repeat structure)*

---

## Findings Noted but Not Prioritized

*(P3-severity findings — recorded for completeness, not actively debated.)*

| ID | Title | Source | Catalog reference | Why deprioritized |
|---|---|---|---|---|
| F-NL-1 | [...] | [...] | [...] | [e.g., minor visual polish, no functional impact] |

---

## Open Questions for Human

*(Things the audit could not resolve without product- or org-specific context. The human addresses these at the Step 12 approval gate.)*

1. [Question — e.g., "Is the keyboard-only path through this checkout flow a hard requirement, or is the audience primarily mobile-touch? Affects severity of F-003."]
2. [Question — e.g., "Are we comfortable shipping the dashboard with a P1 cognitive-load finding (4 metrics + 3 charts on one screen) given the user research shows analysts want everything at once?"]

---

## As-Built Audit *(filled at Construction Review)*

Filled by Muse during Construction Review (Party Review) when the feature ran Step 10.6 with **Lite** or **Full** triage. Muse compares the design-time scorecard against the as-built implementation, flags deltas, and surfaces new findings discovered against the actual code that weren't visible at design time. If Step 10.6 was Skipped, this section is left blank — there is no as-built audit to record.

**Construction Review date:** [YYYY-MM-DD]
**Reviewed by:** Muse (UX Designer) as part of Party Review with Neo, Echo, Phantom, Jarvis [+ custom / auto-selected agents].
**Source PR / branch:** [`feature/<feature-name>` or PR link]

### As-Built Heuristics Scorecard

Muse runs the Nielsen 10 scorecard against the as-built implementation using the same rubric as Step 10.6 (`agents/extensions/muse-ux-design.md` → *Heuristics Scoring (Nielsen 10)*).

| # | Heuristic | Design-time score | As-built score | Delta | Notes |
|---|---|---|---|---|---|
| 1 | Visibility of system status | | | | |
| 2 | Match between system and real world | | | | |
| 3 | User control and freedom | | | | |
| 4 | Consistency and standards | | | | |
| 5 | Error prevention | | | | |
| 6 | Recognition rather than recall | | | | |
| 7 | Flexibility and efficiency of use | | | | |
| 8 | Aesthetic and minimalist design | | | | |
| 9 | Help users recognize, diagnose, recover from errors | | | | |
| 10 | Help and documentation | | | | |

**Design-time total:** [n/40]   **As-built total:** [n/40]   **Delta:** [+/- N]
**Design-time band:** Excellent / Good / Acceptable / Poor / Critical   **As-built band:** [...]

A negative delta on any heuristic generates a finding (see *New As-Built Findings* below). A negative delta on the *total* drives a Reflect-phase metric — does the as-built consistently lose points against the design? That's a process signal worth surfacing in `METRICS.md`.

### As-Built 8-State Coverage Delta

For every interactive element that the design committed to all 8 states, compare the as-built implementation:

| Element | Design committed (states) | As-built (states) | Missing in as-built | Severity |
|---|---|---|---|---|
| [element name] | 8/8 | 6/8 | hover, focus | P0 (focus missing → keyboard-broken) |

✗ in keyboard-relevant columns (Focus, Disabled) escalates severity — keyboard users never see hover, so a design that committed to focus but the as-built dropped it is keyboard-broken.

### As-Built Cognitive Load Delta

| # | Checklist item | Design-time | As-built | Delta | Notes |
|---|---|---|---|---|---|
| 1 | Complete primary tasks without distraction | | | | |
| 2 | Process information in groups of ≤4 items | | | | |
| 3 | Related elements visually grouped at a glance | | | | |
| 4 | Screen priority immediately recognizable | | | | |
| 5 | User focused on one decision sequentially | | | | |
| 6 | ≤4 visible options per decision | | | | |
| 7 | User can avoid referencing previous screens | | | | |
| 8 | Complexity revealed progressively | | | | |

**Design-time failure count:** [n/8]   **As-built failure count:** [n/8]
**Design-time verdict:** acceptable / moderate / urgent   **As-built verdict:** [...]

### As-Built Anti-Patterns Introduced

Anti-patterns that appeared during implementation but weren't in the design (e.g., a placeholder gradient that snuck into the shipped CSS, a side-stripe border added "to make it pop", a confirmation modal someone added without revisiting the undo-vs-confirm rule):

| Pattern | Location (file:line) | Severity | Proposed action |
|---|---|---|---|
| [e.g., side-stripe border on metrics card] | [`src/components/MetricCard.css:42`] | P1 | Replace / Accept-with-ADR / Override-with-rationale |

### New As-Built Findings

Findings discovered at Construction that weren't visible in the design-time review — typically because they only manifest in the actual implementation (real loading times, real focus order, real error messages from backend, real keyboard tab traversal, etc.). Order by severity descending — P0 first.

#### F-AB-001 — [Finding Title]

- **Source:** Heuristic-N delta | 8-state coverage gap | Cognitive-load delta | Anti-pattern introduced | UX-writing drift | Other
- **Severity:** P0 (blocks merge) | P1 (significant difficulty) | P2 (annoyance with workarounds) | P3 (polish)
- **Description:** [one-paragraph plain-language description of the finding and why it matters to the user]
- **Catalog reference:** *(point to the relevant section in `agents/extensions/muse-ux-design.md` so reviewers can cross-check)*
- **Code reference:** [`src/path/to/file.ext:Lstart-Lend`]
- **Proposed action (Muse's recommendation):** Fix before merge | Mitigate later | Accept-as-tradeoff
  - **If "Fix before merge":** [specific code change required; lands as a Build-phase task before review approval]
  - **If "Mitigate later":** [tech-debt entry to be created in `docs/pdlc/memory/DECISIONS.md` as ADR; re-evaluation trigger]
  - **If "Accept-as-tradeoff":** [Atlas's product justification + Muse's residual-UX assessment; ADR in `DECISIONS.md`. **Note: P0 findings cannot be accepted-as-tradeoff** — they block merge until resolved or `/pdlc override` invoked.]
- **Decision (human, at Step 13 Review approval):** *[blank until human reviews]*
- **Cross-talk note:** *[fill if surfaced via cross-agent discussion at Party Review — capture the chain]*

#### F-AB-002 — [Finding Title]
*(repeat structure)*

### Cross-talk-linked findings (with other Party Review participants)

Findings from Muse's as-built audit that cross-talk linked to findings from Neo / Phantom / Echo / Jarvis (or custom reviewers). Link captured here so the unified review file (`REVIEW_<feature>_<date>.md`) doesn't duplicate the same root cause across multiple reviewers.

| F-AB-NNN (Muse) | Linked with | Shared root cause | Primary finding for fix |
|---|---|---|---|
| F-AB-003 | Echo's #5 (no test for keyboard nav) | Focus state missing on `Save` button | F-AB-003 |

### Construction Review approval outcomes

Updated by Neo when the human approves the Party Review at Step 13.

| Finding ID | Muse's recommendation | Human decision | Rationale |
|---|---|---|---|
| F-AB-001 | Fix before merge | Fix before merge ✓ | — |
| F-AB-002 | Accept-as-tradeoff | Mitigate later | "Worth fixing in v2; the rest of the feature is solid." |

**ADR registry updates required:**
- [ADR-NNN — accepted as-built UX tradeoff for F-AB-NNN]

**Build-phase tasks to be created (if any "Fix before merge" findings remain after approval):**
- [Finding F-AB-NNN fix: ___]

---

## Ship Verify *(filled at `/pdlc ship` Verify step)*

Filled by Muse during Ship Verify (Step 11.5 — between smoke tests and the smoke-test approval gate at Step 12) when the feature ran Step 10.6 with **Lite** or **Full** triage. Five focused checks against the as-deployed artifact: UX-writing drift, anti-pattern sweep, 8-state spot-check on top-level interactives, accessibility regression, console / runtime issues. P0 findings block ship until resolved or `/pdlc override` invoked; P1+ get an ADR.

**Verify date:** [YYYY-MM-DD]
**Deploy URL checked:** `[deploy-url]`
**Verified by:** Muse (UX Designer) — handed off briefly from Pulse during Ship Verify.

### UX-Writing Drift

Hits from the verbatim ban-list (P0) and copy-quality checks against the rendered UI.

| Surface | Issue | Severity | Proposed copy |
|---|---|---|---|
| [URL path or screen] | [e.g., "An error occurred" rendered in /api/orders error state] | P0 | "Couldn't load your orders. Check your connection and try again." |

**Verbatim ban-list (always P0, string-equality match):** "An error occurred" / "Something went wrong" / "Invalid input" / "Error: undefined" / strings starting with "Error 500" or "500 Internal Server Error" rendered to end users. Other copy-quality issues (formula not followed, generic labels, jargon) are P1/P2.

### Anti-Patterns Introduced Post-Design

Anti-patterns visible in the deployed UI that weren't in the design or the as-built scorecard. Typically introduced by deploy-pipeline transformations (CSS minifier, CDN), last-minute changes, or environment-specific theming bugs.

| Pattern | Location (URL path / element) | Severity | Proposed action |
|---|---|---|---|

### 8-State Spot-Check Delta

Top-level interactives (3-5 most prominent on the deployed UI). Compare states against the as-built scorecard from Construction Review. ✗ in keyboard-relevant columns (Focus, Disabled) is P0 — keyboard-broken.

| Element | As-built (states) | As-deployed (states) | Missing | Severity | Likely cause |
|---|---|---|---|---|---|
| [Primary CTA] | 8/8 | 6/8 | hover, focus | P0 | CSS minifier dropped `:focus-visible` rules |

### Accessibility Regression

| Check | Result | WCAG criterion | Notes |
|---|---|---|---|
| Body-text contrast | pass / fail | **1.4.3** AA (4.5:1) | [details] |
| UI-component contrast | pass / fail | **1.4.11** AA (3:1) | [details] |
| Information not by color alone | pass / fail | **1.4.1** A | [details] |
| Keyboard reachability | pass / fail | **2.1.1** A | [details] |
| Focus visible on interactives | pass / fail | **2.4.7** AA | [details] |
| Touch targets ≥44×44px on primary flow | pass / fail | **2.5.8** AA (24×24 floor; 44 working min) | [details] |

### Console / Runtime Issues

| Issue | Where surfaced | User-facing? | Severity |
|---|---|---|---|
| [e.g., 404 on font asset] | [browser console on /dashboard] | yes (FOUT) | P2 |

### Ship-Verify Findings

Findings from the five checks above. Order by severity descending — P0 first.

#### F-SV-001 — [Finding Title]

- **Source:** UX-writing drift | Anti-pattern introduced | 8-state delta | Accessibility regression | Console / runtime | Other
- **Severity:** P0 (blocks ship) | P1 (significant difficulty) | P2 (annoyance with workarounds) | P3 (polish)
- **Description:** [one-paragraph plain-language description of the finding and its user impact]
- **Catalog reference:** *(point to the relevant section in `agents/extensions/muse-ux-design.md`)*
- **Code or asset reference:** [`src/path/to/file.ext:Lstart-Lend` or deployed asset URL or browser-console excerpt]
- **Proposed action (Muse's recommendation):** Fix forward | Mitigate later | Accept-as-tradeoff
  - **If "Fix forward":** [revert deploy → patch → re-deploy → re-verify cycle]
  - **If "Mitigate later":** [tech-debt entry to be created in `docs/pdlc/memory/DECISIONS.md` as ADR; re-evaluation trigger]
  - **If "Accept-as-tradeoff":** [Atlas's product justification + Muse's residual-UX assessment; ADR. **Note: P0 findings cannot be accepted-as-tradeoff** — they block ship until resolved or `/pdlc override` invoked.]
- **Decision (human, at Step 12 smoke-test approval gate):** *[blank until human reviews]*

#### F-SV-002 — [Finding Title]
*(repeat structure)*

### Ship Verify approval outcomes

Updated by Pulse when the human approves at the Step 12 smoke-test approval gate.

| Finding ID | Muse's recommendation | Human decision | Rationale |
|---|---|---|---|
| F-SV-001 | Fix forward | Fix forward ✓ | — |
| F-SV-002 | Accept-as-tradeoff | Mitigate later | "Worth fixing in next deploy; not blocking right now." |

**ADR registry updates required:**
- [ADR-NNN — accepted ship-verify UX tradeoff for F-SV-NNN]

**METRICS update:** Jarvis writes the ship-verify totals (Nielsen, cognitive-load, finding counts) to the *UX Scorecard Trend* row in `docs/pdlc/memory/METRICS.md` at Reflect.

---

## Approval Outcomes *(filled in at Step 12)*

*(Updated by Neo when the human approves the design package. Tracks deviations from Muse's recommendations.)*

| Finding ID | Muse's recommendation | Human decision | Rationale |
|---|---|---|---|
| F-001 | Fix now | Fix now ✓ | — |
| F-002 | Accept-as-tradeoff | Mitigate later | "We'd rather take the engineering hit than ship the cognitive-load gap." |

**ADR registry updates required:**
- [ADR-NNN — accepted UX tradeoff for F-NNN]

**Beads tasks to be created at Plan (Step 13):**
- [Finding F-NNN fix: ___]

---

## Revision History

| Date | Author | Change |
|---|---|---|
| [YYYY-MM-DD] | Muse (initial draft) | Created at Step 10.6 |
| [YYYY-MM-DD] | Muse (Construction as-built) | As-Built Audit section filled |
| [YYYY-MM-DD] | Muse (Ship Verify) | Ship-Verify Findings section filled |
