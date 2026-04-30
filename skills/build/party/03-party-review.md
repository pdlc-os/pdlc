# Party Mode: Party Review

**Topic slug:** `party-review`
**Trigger:** Automatic — replaces the sequential review step (Step 12) once all tasks are complete
**Purpose:** Run all reviewers in parallel with cross-talk so interconnected findings are explicitly linked, not siloed

---

## Why This Replaces Sequential Review

In sequential review, each agent reviews in isolation. A Phantom security finding and a Neo architecture finding may be two symptoms of the same root cause — but neither agent sees the other's output, so they're filed separately and the link is lost. Party review runs agents in parallel, then cross-talks findings that share an underlying cause. The result is a tighter review file with fewer duplicate fix actions.

---

## Participants

The four always-on built-in reviewers participate in every party review — no exceptions.

- **Neo** — Architecture & PRD conformance (leads and synthesizes)
- **Echo** — Test coverage & quality
- **Phantom** — Security
- **Jarvis** — Documentation & API contracts

**Conditional built-in: Muse — As-Built UX Audit.** When `docs/pdlc/design/[feature-name]/ux-review.md` exists with triage outcome **Lite** or **Full** (Step 10.6 ran), **Muse joins Party Review** regardless of label match. Her mandate is the as-built UX audit — comparing the design-time scorecard against the as-built implementation, flagging deltas, and surfacing new findings only visible in real code (real loading times, real focus order, real error copy, real tab traversal). Muse's findings flow into the same review file as the other reviewers; her scorecard delta + new findings also append to the *As-Built Audit* section of `ux-review.md` (one file per feature, tracking design-time → as-built → ship-verify). When Step 10.6 was Skipped or `ux-review.md` doesn't exist, Muse does **not** auto-join via this rule (she may still auto-select via the label match below if the feature carries `ux`, `design`, or `user-flow` labels — in that case she contributes per `agents/muse.md` without an as-built scorecard).

**Custom agents and other auto-selected built-ins:** any agents in `.pdlc/agents/` with `always_on: true`, or whose `auto_select_on_labels` match the current feature's labels, also join the review. (This includes the built-in Muse, Atlas, Bolt, Friday, Pulse on label matches.) They receive the same full context and produce a review mandate tailored to their focus areas per their persona file (same output format: numbered findings labeled Critical / Important / Advisory). Neo synthesizes across all reviewers, including custom ones, during Round 2 cross-talk.

---

## Context to Load

Before spawning agents, gather all of the following:

- Completed task list (from STATE.md Phase History)
- Full feature branch diff: `git diff main..feature/[feature-name]`
- All commits on branch: `git log main..feature/[feature-name] --oneline`
- `docs/pdlc/memory/CONSTITUTION.md`
- `docs/pdlc/memory/DECISIONS.md`
- `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
- All files in `docs/pdlc/design/[feature-name]/`

Pass this full context to every agent spawn. Do not abbreviate the diff — reviewers need the actual changes.

---

## Round 1 — Parallel Review Passes

Spawn all four reviewers simultaneously. Each gets the same full context but a different review mandate:

**Neo's mandate:**
```
Contribution: Architecture & PRD conformance review of the full feature diff.
Check:
- Does the implementation match the ARCHITECTURE.md design? Flag any drift.
- Does the code satisfy every acceptance criterion in the PRD? Name any AC that is
  not clearly addressed by the implementation.
- Are there any cross-cutting concerns (error handling, logging, observability) that
  were applied inconsistently across the tasks?
- Does anything violate the architectural constraints in CONSTITUTION.md §3?
- Any tech debt introduced that should be logged?

Output your findings as a numbered list. Label each: [Critical | Important | Advisory].
```

**Phantom's mandate:**
```
Contribution: Security review of the full feature diff.
Check OWASP Top 10 surface against the changed code:
- Input validation: are all user-supplied or external inputs validated before use?
- Authentication: are all new endpoints/routes protected correctly?
- Authorization: can a user access or modify another user's data?
- Secrets: are any credentials, tokens, or keys present in the diff?
- Injection: SQL, command, LDAP, template injection surfaces?
- Insecure direct object references?
- Any new dependency introduced — is it known safe?

Output your findings as a numbered list. Label each: [Critical | Important | Advisory].
For Critical findings, include the exact file and line range.
```

**Echo's mandate:**
```
Contribution: Test coverage and quality review of the full feature diff.
Check:
- Is every acceptance criterion from the PRD covered by at least one test?
  Map each AC to the test(s) that cover it. Flag any AC with no test.
- Are the tests testing behavior (Given/When/Then) or just implementation details?
- Are there edge cases in the implementation that have no corresponding test?
- Any test that would pass even if the implementation were wrong (false confidence)?
- Regression risk: any change to shared utilities, middleware, or base classes
  that could break existing tests not in this feature's test suite?

Output your findings as a numbered list. Label each: [Critical | Important | Advisory].
```

**Jarvis's mandate:**
```
Contribution: Documentation and API contract review of the full feature diff.
Check:
- Are new public functions, methods, and classes documented?
- Do the API contracts in api-contracts.md match what was actually implemented
  (method, path, request/response schema, error codes)?
- Is the README updated if the feature changes how the system is used or set up?
- Are commit messages clear and in Conventional Commits format?
- Draft a CHANGELOG entry for this feature in Conventional Changelog format.

Output your findings as a numbered list. Label each: [Important | Advisory].
Also output the draft CHANGELOG entry as a separate section.
```

**Muse's mandate (conditional — only when `ux-review.md` exists with Lite/Full triage):**
```
Contribution: As-Built UX audit of the full feature diff against the design-time
scorecard captured in docs/pdlc/design/[feature-name]/ux-review.md at Step 10.6.

Step 1 — Load the design-time scorecard:
- Read ux-review.md fully. Note the Heuristics Scorecard (Nielsen 10) totals,
  the 8-State Coverage Matrix, the Cognitive Load Assessment, the Anti-Patterns
  Found list, and any Findings & Proposed Actions that were tagged "Fix now"
  vs "Mitigate later" vs "Accept-as-tradeoff" at Step 12.
- Note the catalog reference: agents/extensions/muse-ux-design.md (your reference
  for thresholds, scorecards, checklists, and refuse lists — already loaded by
  your persona directive).

Step 2 — Run the as-built scorecard against the implementation:
- Score the Nielsen 10 heuristics 0-4 against the as-built code, not the design.
  Walk the actual user flows in the implementation: real loading states, real
  focus order, real error messages from the backend, real keyboard tab traversal,
  real touch-target sizes in CSS, real ARIA attributes in JSX/templates.
- Re-run the 8-state coverage matrix against the implementation. Did the design
  commit to 8 states for [Save] but the implementation only has 6? That's a
  delta with severity escalated for keyboard-relevant misses (Focus, Disabled).
- Re-run the cognitive-load 8-item assessment against the implementation —
  does the rendered UI still feel like ≤4 options per decision, or did
  scope creep add a fourth navigation item?
- Run the anti-pattern refuse list against the implementation — did a
  side-stripe border, gradient text, or modal-as-first-thought sneak in
  during construction that wasn't in the design?
- Re-run the UX-writing pass against the actual rendered copy — did "An error
  occurred" sneak through? Are button labels still verb+object?

Step 3 — Compute deltas and surface new findings:
- Heuristic deltas: any negative delta on a heuristic generates a finding.
  Negative delta on the *total* drives a Reflect-phase metric.
- 8-state deltas: any state present in design but missing in as-built generates
  a finding (P0 if the missed state is keyboard-relevant — Focus or Disabled).
- New findings: anything the design-time review couldn't see because it only
  manifests in real code (real backend latency vs designed loading state,
  real focus order on tab key, real error copy from API failures, real
  contrast on actual rendered colors).

Step 4 — Output two artifacts:

(a) Findings list for the unified review file (REVIEW_<feature>_<date>.md):
    Output your findings as a numbered list. Label each:
    [Critical = P0 (blocks merge) | Important = P1/P2 | Advisory = P3].
    Include code references (file:line) where relevant.
    Cross-talk-eligible — Echo may have related a11y test gaps, Phantom may
    have related auth/info-disclosure findings, Friday may have related
    a11y feasibility constraints.

(b) As-Built Audit section content for ux-review.md:
    Use the section template at templates/ux-review.md (As-Built Audit). Fill
    in the as-built scorecard tables (heuristics, 8-state delta, cognitive-load
    delta, anti-patterns introduced), the New As-Built Findings sub-sections
    (using the F-AB-NNN finding template), and leave the Construction Review
    approval outcomes table for Neo to fill at Step 13.

P0 findings (keyboard-broken, "An error occurred" copy that escaped, AI-default
patterns shipped without rationale, accessibility violations) cannot be
accepted-as-tradeoff — they block merge until fixed or `/pdlc override` invoked.
```

---

## Round 2 — Cross-talk

After collecting all four responses, identify **interconnected findings**: cases where two agents flagged the same underlying problem from different angles.

For each identified interconnection, spawn the two relevant agents with each other's finding:

```
[Agent A] flagged: [finding]
[Agent B] flagged: [finding]

These appear to be related. Do you agree they share a root cause?
If yes, what is the single fix that resolves both findings — and which finding
should be the primary one in the review file, with the other cross-referenced?
If no, explain why they are independent.
```

Also route any Critical finding from Phantom or Echo to Neo:

```
[Phantom/Echo] flagged a Critical issue: [finding]
Does this have architectural implications beyond the immediate fix?
Should it trigger a DECISIONS.md entry or a change to CONSTITUTION.md?
```

Cross-talk follows the canonical bounded loop: **up to 3 rounds, exit early on consensus.** See `skills/build/party/spawn-and-mom.md` → "Cross-talk Rounds" for the full rules. Most interconnected findings resolve in round 1; use rounds 2–3 only when agents continue to disagree about whether findings share a root cause or how a Critical issue should be treated. If consensus is not reached, follow the Party Review branch of `skills/build/party/deadlock-protocol.md` (Deadlock Type 3) — write both findings independently with a linked-review note and surface the disagreement.

---

## Review File Output

After cross-talk, write the unified review file to:
```
docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md
```

Follow `templates/review.md` structure. For each finding:
- State the finding
- Label it: Critical / Important / Advisory
- Include the reviewer who raised it
- If it was cross-referenced with another agent's finding, note: "Linked with [Agent]'s finding #N — same root cause. Single fix resolves both."

Add the draft CHANGELOG entry (from Jarvis) as the final section.

**When Muse participated (Step 10.6 ran Lite/Full):** in addition to writing Muse's findings into `REVIEW_*.md` per the format above, append the *As-Built Audit* section content to `docs/pdlc/design/[feature-name]/ux-review.md` (filling in the scorecard delta tables, anti-patterns introduced, new as-built findings, and cross-talk-linked findings sub-sections per the template). The unified review file references the as-built scorecard rather than duplicating it: a one-line note in `REVIEW_*.md` like *"Muse's full as-built scorecard with deltas is in `docs/pdlc/design/[feature-name]/ux-review.md` → As-Built Audit section."* keeps the review file readable while preserving the structured artifact for METRICS and Reflect.

**Writing quality pass:** Each agent's findings must follow their **Writing Quality Pass** (see `agents/*.md`). Findings should be concrete ("SQL injection via unsanitized `user_id` in `/api/orders`") not vague ("potential security issue in order service").

---

## Proceed

After writing the review file, return to **Step 13** (Review approval gate) in `skills/build/SKILL.md`.
Write the MOM file per `orchestrator.md`.

The MOM for party review captures: what each agent flagged, which findings were linked in cross-talk, and the final tally (Critical / Important / Advisory counts).
