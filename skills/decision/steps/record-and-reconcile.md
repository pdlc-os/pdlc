# Record, Reconcile, and Resume
## Steps 4–6

---

## Step 4 — Record in the Decision Registry

Determine the next ADR number by reading `docs/pdlc/memory/DECISIONS.md` and finding the highest existing `ADR-NNN`. Increment by 1. If no entries exist, start at `ADR-001`.

Append the following entry to `docs/pdlc/memory/DECISIONS.md`:

```markdown
---

### ADR-[NNN]: [Decision title — short summary]

**Date:** [today YYYY-MM-DD]
**Source:** [User (explicit) | PDLC flow]
**Phase:** [current phase from STATE.md]
**Sub-phase:** [current sub-phase, or — if none]
**Agent:** [agent name who initiated, or — if user-initiated]
**Feature:** [current feature from STATE.md, or — if none]
**Status:** Active
**MOM:** [link to MOM file, or — if no impacts found]

**Decision:** [The full decision text]

**Context:** [Why this decision was made — what problem it solves or what constraint it responds to]

**Alternatives considered:**
- [If known, list what was considered and rejected. If user-initiated and not discussed, write "Not discussed — user decision."]

**Impact summary:**
- [N] agents identified impacts
- [N] files/areas changed
- Risk: [Low / Medium / High]
- [If resequencing occurred:] Roadmap resequenced: [list affected features]
- Full details: [MOM file link]
```

Update the `Last updated` date at the top of DECISIONS.md.

Update `.pending-decision.json`: set `"progress": "recorded"` and add `"adrId": "ADR-[NNN]"`.

---

## Step 5 — Phase-aware reconciliation

After the decision is recorded and file-level changes are applied, reconcile the downstream effects based on the current phase. Read `docs/pdlc/memory/STATE.md` to determine the active phase.

### If currently in Inception (brainstorm)

The decision may affect the brainstorm log, PRD, or design docs that are being actively written.

**Brainstorm log** (`docs/pdlc/brainstorm/brainstorm_[feature-name]_[date].md`):
- If the decision changes requirements, user context, or scope: append a "Decision Context" entry to the brainstorm log noting the decision (ADR ID, summary) so it feeds into PRD generation.

**PRD** (if already drafted — sub-phase is Define or later):
- If the decision changes requirements, acceptance criteria, or scope: update the relevant PRD sections. Mark the changes with `[Updated per ADR-NNN]` so the user can trace what changed and why.
- If the decision adds or removes user stories: update the stories section.
- Re-present the updated PRD to the user for re-approval if the changes are material. Minor clarifications do not require re-approval.

**Design docs** (if already drafted — sub-phase is Design or Plan):
- If the decision changes architecture, data model, or API contracts: update the relevant design docs. Mark with `[Updated per ADR-NNN]`.
- Neo reviews the changes for architectural consistency.
- Re-present updated design docs for re-approval if material.

**Beads tasks** (if already created — sub-phase is Plan):
- If the decision changes scope: create new tasks, close obsolete ones, or update descriptions via `bd create`, `bd done`, `bd update`.
- If the decision changes dependencies: update with `bd dep add` / `bd dep remove`.
- Regenerate the dependency tree and update the plan file.

### If currently in Construction (build)

The decision may affect active code, Beads tasks, tests, and the episode draft.

**Active Beads task context:**
- Read the active task from STATE.md. If the decision affects this task's requirements or implementation approach, update the task description in Beads: `bd update [task-id] --description "[updated description. See ADR-NNN.]"`
- If the decision makes the current task obsolete: `bd done [task-id]` with a note referencing the ADR.

**Beads task graph:**
- If the decision changes feature scope: create new tasks for new work, close tasks that are no longer needed, update descriptions for tasks whose requirements changed.
- If the decision changes task dependencies or execution order: update with `bd dep add` / `bd dep remove`.
- Run `bd ready` to verify the task graph is still valid after changes.

**Test suites** (Echo's responsibility):
- If the decision changes behavior that existing tests validate: flag which test files need updating. List them for the user.
- If the decision introduces new testable behavior: note what test coverage is needed. New tests will be written as part of the TDD loop when the affected task is picked up.

**Episode draft** (`docs/pdlc/memory/episodes/[NNN]_[feature]_[date].md`):
- If an episode draft exists: append to the "Key Decisions & Rationale" section: `- ADR-[NNN]: [summary] (recorded mid-build, [date])`

**Build agents context:**
- When the build resumes, the lead agent (Neo) must read the MOM file for this decision and inform the team. Before resuming the next task, Neo announces:
  > "**Decision context (ADR-[NNN]):** [summary]. This affects: [list of impacted areas]. The following changes have been applied: [list]. Keep this in mind as we continue building."

### If currently in Operation (ship)

Decisions during ship are rare but possible (e.g., "don't deploy to prod, deploy to staging first").

**Deployment config** (Pulse's responsibility):
- If the decision changes deployment target, environment, or CI/CD behavior: update the relevant config and inform Pulse.

**Episode draft:**
- Append to "Key Decisions & Rationale" section as above.

### If Idle (between phases)

No active workflow to reconcile. The decision is recorded and will be available as context when the next phase starts. Any agent that reads DECISIONS.md at the start of a phase will see it.

---

## Step 5b — Conditional CLAUDE.md refresh

If the decision affects **architecture, tech stack, or project structure** (check the MOM's agent assessments — Neo flagged architecture impact, or Bolt/Friday flagged structural changes, or the decision explicitly changes a technology choice), update the project-root `CLAUDE.md`:

1. Read `CLAUDE.md` from the project root. If it doesn't exist, skip this step.
2. Identify which sections are affected:
   - **Architecture** — if the decision changes architectural style, adds/removes a layer or service, or alters data flow
   - **Tech Stack** — if the decision adds, removes, or replaces a technology (language, framework, database, infrastructure)
   - **Project Structure** — if the decision reorganizes directories or introduces new top-level modules
   - **Key Files** — if the decision introduces or removes structurally important files
3. Update only the affected sections. Also update any corresponding `.claude/docs/` sub-files if they exist (e.g., if the Architecture section was split out, update `.claude/docs/architecture.md`).
4. **Size check:** After updating, if CLAUDE.md exceeds 180 lines, apply the overflow protocol from `skills/repo-scan/SKILL.md` — split overflowing sections into `.claude/docs/` sub-files with return directives.
5. If no sections are affected, skip entirely.

This keeps CLAUDE.md current for decisions that cause significant structural evolution, without touching it for minor decisions.

---

## Step 6 — Summary and resume

Present the full summary:

> "**Decision recorded: ADR-[NNN]** — [title]
> MOM: `docs/pdlc/mom/MOM_decision_[ADR-NNN]_[YYYY-MM-DD].md`
>
> **Changes applied:**
> [list of all files updated — both from impact assessment and reconciliation]
>
> [If Beads tasks changed:] **Beads updates:** [created N / updated N / closed N tasks]
> [If PRD updated:] **PRD updated** — re-approval needed: [yes/no]
> [If design docs updated:] **Design docs updated** — re-approval needed: [yes/no]
> [If CLAUDE.md updated:] **CLAUDE.md updated** — [sections changed]
> [If resequenced:] **Roadmap resequenced** — [brief summary]"

**If a phase was active:**

> "You were in **[phase] / [sub-phase]** when you paused.
> [If re-approval is needed:] The [PRD/design docs] need re-approval before we can continue.
> [Otherwise:] Ready to resume. Shall I pick up where we left off?"

If the user confirms: delete `.pending-decision.json`, then re-invoke the active phase's skill (`/pdlc brainstorm`, `/pdlc build`, or `/pdlc ship`). The skill reads STATE.md and resumes from the last checkpoint. Neo (during build) will announce the decision context to the team on the first turn.

If the user declines: delete `.pending-decision.json`. Stop. The user can resume manually later.

**If no phase was active:**

Delete `.pending-decision.json`. Stop. The decision is recorded and ready for the next phase.

---

## Rules

- Never skip the Decision Review Party. Even if the decision seems minor, run the full assessment.
- Never modify files without user approval.
- The decision registry is append-only. Never delete or modify existing entries. Mark superseded decisions as `[SUPERSEDED by ADR-NNN]` in their Status field.
- Roadmap priority is managed via the Priority integer column in ROADMAP.md, independent of ADR numbering. Resequencing never requires renumbering ADRs or Feature IDs.
- MOM files are permanent records — do not delete them after recording the decision.
- When called from within another skill (review Step 14, reflect Step 7), the Source and Agent fields are set by the calling skill, not by this one.
