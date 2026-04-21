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
8. `docs/pdlc/memory/DEPLOYMENTS.md`
9. `docs/pdlc/memory/episodes/index.md`
10. `docs/pdlc/memory/.pending-party.json` (if exists)
11. `docs/pdlc/memory/.pending-decision.json` (if exists)

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
| DEPLOYMENTS.md | Yes | Init |
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

## Checks 5–8, Report, and Fix Mode

Read `skills/doctor/checks-and-report.md` and execute it completely (document vs code drift, git history analysis, pending file health, Constitution compliance, report presentation, and fix mode).

---

## Rules

- **Read-only by default.** Doctor never modifies files without explicit user approval.
- **Non-blocking.** Doctor findings don't prevent other PDLC commands from running. It's advisory.
- **Idempotent.** Running doctor multiple times produces the same results if nothing changed.
- **Fast checks first.** State file checks (1-4) run before expensive code scanning (5-6). If the user wants a quick check, they can stop after state checks.
- Doctor reports are not committed to git automatically. The user can export and commit if they want a record.
- When running in fix mode, each fix follows the write-order rules from `skills/state-reconciliation.md`.
