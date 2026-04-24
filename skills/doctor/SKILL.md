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

### 4c — Roadmap-claim integrity (Beads + STATE.md + ROADMAP.md)

The roadmap-level Beads task is the authoritative claim lock. STATE.md's Roadmap Claim block and ROADMAP.md's Claimed-by column are caches. These four checks catch drift before it misroutes a `/pdlc brainstorm`:

- **roadmap-claim-mismatch** — for the current user, compare `bd list --claimed-by me --label roadmap --status in-progress --json` against STATE.md's Roadmap Claim block.
  - Beads has a claim but STATE.md block says `_None held._` → `[WARNING] Beads holds a roadmap claim on [F-NNN] not reflected in STATE.md. The next session-start banner will prompt resume, or run /pdlc brainstorm [F-NNN] to rebuild STATE.md.`
  - STATE.md block has F-NNN but Beads has no claim → `[WARNING] STATE.md references roadmap claim [F-NNN] but Beads shows no active claim. Force-released? Run /pdlc brainstorm [F-NNN] to re-claim or clear the block manually.`
  - Both set but to different F-NNN → `[CRITICAL] STATE.md claims [F-NNN-A] but Beads shows [F-NNN-B] claimed by you. Reconcile before continuing.`
- **stale-roadmap-claim** — for every `roadmap` task with status `in-progress`, check the assignee's recent commits on any matching `feature/*` branch.
  ```bash
  bd list --label roadmap --status in-progress --json
  git log --since="30 days ago" --all --author="[assignee-email]" --oneline | grep -c "feature/[feature-name]"
  ```
  If the count is 0 AND the claim is >30 days old → `[INFO] [F-NNN] claimed by [email] since [date] with no commits on feature/[name] in the last 30 days. Nudge the owner or run /pdlc release [F-NNN].`
- **duplicate-roadmap-task** — count Beads tasks sharing the same `F-NNN` label.
  ```bash
  bd list --label roadmap --json | jq -r '.[] | .labels[]? | select(test("^F-\\d+$"))' | sort | uniq -c | awk '$1 > 1'
  ```
  Any duplicate → `[CRITICAL] Multiple Beads tasks share label [F-NNN]. Likely a migration bug. Investigate which is authoritative and bd close the stale one(s).`
- **roadmap-beads-mirror-drift** — compare ROADMAP.md's Status/Priority/Claimed-by columns against the matching Beads tasks for each F-NNN.
  - `[WARNING] F-NNN: ROADMAP shows Status=[X] but Beads task status is [Y]. Re-render ROADMAP from Beads.`
  - `[WARNING] F-NNN: ROADMAP shows Priority=[X] but Beads label priority:[Y]. One or the other was edited in isolation.`
  - `[WARNING] F-NNN: ROADMAP shows Claimed by=[X] but Beads assignee is [Y]. STATE.md reconciliation on next session will fix this.`
- **missing-roadmap-beads-tasks** (upgrade migration) — ROADMAP.md has feature rows but `bd list --label roadmap --json` returns `[]`. This is the expected state for projects initialized before v2.11.0 added claim coordination. Every F-NNN is effectively unprotected against multi-dev double-claim.
  - Finding: `[WARNING] ROADMAP.md lists [N] features but no roadmap-labeled Beads tasks exist. Multi-dev claim coordination is disabled until these are bootstrapped.`
  - **Fix action** (offered in `/pdlc doctor --fix`): iterate over ROADMAP.md Feature Backlog rows and run `bd create --label roadmap --label F-NNN --label priority:N --status <planned|shipped|dropped>` per row. Shipped/Dropped rows get the corresponding status. Rows showing `In Progress` with a `Claimed by` value get the matching `bd claim` to preserve the existing assignee. The same bootstrap is offered inline by `/pdlc brainstorm` the first time a post-upgrade user runs it — so this finding is informational for users who haven't yet re-entered brainstorm.

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
