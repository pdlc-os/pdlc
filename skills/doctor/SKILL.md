---
name: doctor
description: "Comprehensive health check of PDLC state, docs, tasks, and code alignment"
---

You are running a PDLC health check. This is a **read-only diagnostic** — nothing is modified unless the user explicitly approves fixes at the end.

## Lead Agent: Neo (Architect)

Neo leads the doctor check — architectural oversight gives the broadest view across code, docs, tasks, and state.

Before the first user-facing message, read `skills/formatting.md` and output a **Sub-phase Transition Header** for "DOCTOR" followed by:

> **Neo (Architect):** "Running a full health check on the project. I'll scan state files, task graph, docs, and code to find anything out of sync. This is read-only — I'll present findings and you decide what to fix."

---

## Pre-flight

Read these files (skip any that don't exist — their absence is itself a finding):
1. `docs/pdlc/memory/STATE.md`
2. `docs/pdlc/memory/ROADMAP.md`
3. `docs/pdlc/memory/DECISIONS.md`
4. `docs/pdlc/memory/CONSTITUTION.md`
5. `docs/pdlc/memory/INTENT.md`
6. `docs/pdlc/memory/OVERVIEW.md`
7. `docs/pdlc/memory/CHANGELOG.md`
8. `docs/pdlc/memory/episodes/index.md`
9. `docs/pdlc/memory/.pending-party.json` (if exists)
10. `docs/pdlc/memory/.pending-decision.json` (if exists)

Run: `bd list --json` (capture all Beads tasks)
Run: `git log --oneline -50` (recent commit history)
Run: `git status` (working tree state)

---

## Check 1 — State file integrity

Verify all expected memory files exist:

| File | Required | Created during |
|------|----------|---------------|
| CONSTITUTION.md | Yes | Init |
| INTENT.md | Yes | Init |
| STATE.md | Yes | Init |
| ROADMAP.md | Yes | Init |
| DECISIONS.md | Yes | Init |
| CHANGELOG.md | Yes | Init |
| OVERVIEW.md | Yes | Init |
| episodes/index.md | Yes | Init |

**Findings:**
- Missing files → `[CRITICAL] [filename] is missing. Was init completed?`
- Empty files (0 bytes or only comments) → `[WARNING] [filename] exists but has no content`

---

## Check 2 — STATE.md consistency

Read STATE.md and validate internal consistency:

- **Phase vs sub-phase alignment** — does the sub-phase belong to the claimed phase? (e.g., sub-phase "Test" should only appear in phase "Construction")
- **Active feature vs phase** — if phase is Idle, active feature should be "none"; if phase is Construction, a feature should be set
- **Active Beads task vs phase** — active task should only be set during Construction/Build
- **Last checkpoint format** — should match `[Phase] / [Sub-phase] / [ISO 8601]`
- **Phase History** — last entry should be consistent with current phase

**Findings:**
- Mismatched phase/sub-phase → `[CRITICAL] STATE.md phase is [X] but sub-phase is [Y] — these don't match`
- Active feature during Idle → `[WARNING] STATE.md is Idle but active feature is [X] — should be "none"`
- Stale checkpoint (>7 days old) → `[INFO] Last checkpoint is [N] days old — is work still in progress?`

---

## Check 3 — ROADMAP.md vs STATE.md vs reality

Cross-reference roadmap status with actual state:

- **"In Progress" features** — there should be at most 1, and it should match STATE.md's active feature
- **"Shipped" features** — each should have a non-empty Shipped date and Episode reference
- **Episode references** — each referenced episode file should actually exist in `docs/pdlc/memory/episodes/`
- **Priority gaps** — priorities should be sequential (no gaps like 1, 2, 5)
- **Orphaned "In Progress"** — a feature marked In Progress but STATE.md is Idle or shows a different feature

**Findings:**
- Multiple In Progress → `[CRITICAL] ROADMAP has [N] features marked In Progress — only 1 should be active`
- Shipped without episode → `[WARNING] [F-NNN] marked Shipped but Episode column is empty`
- Missing episode file → `[CRITICAL] [F-NNN] references episode [file] but it doesn't exist`
- Orphaned In Progress → `[WARNING] [F-NNN] is In Progress but STATE.md active feature is [X]`

---

## Check 4 — Beads health and task graph vs STATE.md

> **Model override:** This check uses the **Haiku** model. Beads diagnostics and task graph operations are mechanical CLI work.

### 4a — Run Beads doctor

Run: `bd doctor`

This is Beads' built-in diagnostic. It checks the `.beads/` database for internal corruption, orphaned records, and integrity issues. Capture the output.

**If `bd doctor` reports issues:**
- Include each issue as a finding with appropriate severity
- `bd doctor` may suggest fix commands — capture those for the fix phase

**If `bd doctor` passes clean:**
> "Beads internal health: ✓ clean"

### 4b — Cross-reference Beads with PDLC state

Cross-reference Beads tasks with project state:

- **Claimed tasks** — any claimed task should match STATE.md's active Beads task
- **Orphaned claimed tasks** — tasks claimed but STATE.md shows no active task (crash during build)
- **"Done" tasks without commits** — run `git log --oneline --grep="[task-id]"` for each done task; flag any with no matching commits
- **Open tasks for shipped features** — if a feature is marked Shipped in ROADMAP, all its Beads tasks should be done
- **Circular dependencies** — run `bd dep tree` and check for cycles
- **Stale ready queue** — tasks in ready state for >7 days with no progress

**Findings:**
- `bd doctor` issue → `[CRITICAL/WARNING] Beads internal: [issue from bd doctor]`
- Orphaned claimed task → `[WARNING] Beads task [id] is claimed but STATE.md has no active task`
- Done without commits → `[WARNING] Beads task [id] marked done but no matching git commits found`
- Open tasks on shipped feature → `[CRITICAL] Feature [F-NNN] is Shipped but [N] Beads tasks are still open`
- Circular dependency → `[CRITICAL] Circular dependency detected in task graph: [details]`

> **End of model override.** Return to Neo's assigned model (Opus) for remaining checks.

---

## Check 5 — Document vs code drift

This is the most expensive check. For each active or recently shipped feature, verify that docs match reality:

### PRD vs implementation
- Read the PRD's acceptance criteria
- For each criterion, grep the codebase for related test names (tests should use Given/When/Then from the PRD)
- Flag any AC with no corresponding test

### Architecture vs code
- Read `ARCHITECTURE.md` — what components/services/modules does it describe?
- Check if those components actually exist in the codebase (grep for module names, file paths, class names)
- Flag components described in architecture that don't exist in code, and code modules not mentioned in architecture

### API contracts vs implementation
- Read `api-contracts.md` — what endpoints are documented?
- Grep codebase for route definitions (e.g., `app.get`, `router.post`, `@Get`, etc.)
- Flag endpoints in the contract that don't exist in code, and endpoints in code not in the contract

### OVERVIEW.md vs reality
- Read the "Active Functionality" section
- Cross-reference with the last few episodes and the current codebase
- Flag described functionality that appears to have been removed (no matching code)

**Findings:**
- AC without test → `[WARNING] PRD acceptance criterion [N] has no matching test`
- Architecture ghost → `[WARNING] ARCHITECTURE.md describes [component] but it doesn't exist in code`
- Undocumented code → `[INFO] Code module [X] exists but isn't mentioned in ARCHITECTURE.md`
- Contract drift → `[WARNING] api-contracts.md documents [endpoint] but it's not in the code (or vice versa)`
- Removed functionality → `[CRITICAL] OVERVIEW.md describes [feature] but the code appears to have been removed`

---

## Check 6 — Git history vs PDLC state (multi-user & rollback detection)

Detect situations where the repo changed outside of PDLC's awareness:

### Rollback detection
- Read STATE.md Phase History — get the last few checkpoint timestamps
- Run `git log --since="[oldest checkpoint]" --oneline`
- Look for revert commits (`git log --grep="revert" --grep="Revert" -i`)
- Look for force pushes: compare `git log` with `git reflog` (if available) for missing commits
- If reverts exist after the last PDLC checkpoint, the code may have changed without PDLC docs being updated

### Multi-user detection
- Run `git log --format="%ae" --since="[last checkpoint]" | sort -u` to get unique committers since the last PDLC checkpoint
- If >1 committer is found, check if any non-PDLC commits touched files in `docs/pdlc/` (manual edits to memory files) or changed code that PRDs/architecture docs describe
- Flag manual edits to CONSTITUTION.md or STATE.md (these should go through PDLC)

### Cross-session detection
- Read `git log --oneline` for commits since the last STATE.md checkpoint
- Identify any commits that don't follow PDLC's commit message conventions (these were made outside PDLC)
- If code was changed outside PDLC, the architecture docs and episode file may be stale

**Findings:**
- Revert detected → `[CRITICAL] Revert commit found: [hash] [message]. Code may not match PDLC docs.`
- Manual STATE.md edit → `[WARNING] STATE.md was modified by git commit [hash] outside of PDLC`
- Non-PDLC commits → `[INFO] [N] commits since last checkpoint were made outside PDLC by [authors]`
- Multi-user changes to PDLC files → `[WARNING] [user] modified [file] directly — may conflict with PDLC state`

---

## Check 7 — Pending file health

Check for stale or conflicting pending files:

- `.pending-party.json` — is it older than 24 hours? Does its meetingType match any current phase?
- `.pending-decision.json` — is it older than 24 hours? Does the decision text reference a feature that's still active?
- Both exist simultaneously — is this a valid nesting (decision containing a meeting) or an inconsistency?

**Findings:**
- Stale pending party → `[WARNING] .pending-party.json is [N] hours old — likely abandoned`
- Stale pending decision → `[WARNING] .pending-decision.json is [N] hours old — likely abandoned`
- Conflicting pending files → `[INFO] Both .pending-party.json and .pending-decision.json exist — [valid nesting / potential conflict]`

---

## Check 8 — CONSTITUTION.md compliance

Verify the current codebase respects the Constitution:

- **Tech stack** — do the dependencies in `package.json` (or equivalent) match what CONSTITUTION.md declares?
- **Test gates** — are the required test layers actually present? (e.g., if Constitution says Unit + Integration required, do those test files exist?)
- **Architectural constraints** — if Constitution says "all business logic in service layer", grep for business logic patterns outside service files

**Findings:**
- Stack mismatch → `[WARNING] CONSTITUTION.md says [framework] but package.json doesn't include it`
- Missing test layer → `[WARNING] CONSTITUTION.md requires [layer] tests but no test files found for that layer`
- Constraint violation → `[WARNING] CONSTITUTION.md constraint "[rule]" may be violated in [file]`

---

## Report — Present findings to user

Compile all findings into a report sorted by severity:

```
PDLC Doctor Report
==================

Project: [name]
Date: [today]
Phase: [current phase from STATE.md]
Feature: [active feature or "none"]

CRITICAL ([N])
--------------
[list all CRITICAL findings]

WARNING ([N])
-------------
[list all WARNING findings]

INFO ([N])
----------
[list all INFO findings]

CLEAN ([N] checks passed)
--------------------------
[list checks that found no issues]

Summary: [N] critical, [N] warnings, [N] info across [8] checks.
```

Then ask the user:

> "Doctor found **[N] critical**, **[N] warnings**, and **[N] info** items.
>
> What would you like to do?
> - **Fix all** — I'll fix critical and warning items (with your approval for each)
> - **Fix critical only** — address only the critical issues
> - **Review one by one** — walk through each finding and decide
> - **Export** — save the report to `docs/pdlc/doctor-report_[date].md` and fix later
> - **Dismiss** — acknowledge and continue without fixing"

### Fix mode

For each finding the user wants to fix, propose the specific change:
- State file fixes → show the exact field change
- ROADMAP fixes → show the row update
- Beads fixes → show the `bd` command to run
- Doc drift → flag for manual review (doctor doesn't rewrite PRDs/architecture)
- Rollback impact → suggest running the reconciliation protocol or re-running the affected phase

After all approved fixes are applied, re-run the relevant checks to confirm they pass.

---

## Rules

- **Read-only by default.** Doctor never modifies files without explicit user approval.
- **Non-blocking.** Doctor findings don't prevent other PDLC commands from running. It's advisory.
- **Idempotent.** Running doctor multiple times produces the same results if nothing changed.
- **Fast checks first.** State file checks (1-4) run before expensive code scanning (5-6). If the user wants a quick check, they can stop after state checks.
- Doctor reports are not committed to git automatically. The user can export and commit if they want a record.
- When running in fix mode, each fix follows the write-order rules from `skills/state-reconciliation.md`.
