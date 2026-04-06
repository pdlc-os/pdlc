# Doctor — Comprehensive Health Check

Run `/pdlc doctor` at any time to scan your project for inconsistencies between PDLC state, documentation, task graph, and actual code. Neo (Architect) leads the check — read-only by default, with optional fix mode.

---

### When to run

- After pulling a teammate's changes
- After a long break from the project
- Before starting a new feature
- After a rollback or revert
- When something feels "off" and you're not sure what state PDLC is in
- After multiple Claude Code sessions where state may have drifted

---

### What it checks

#### Check 1 — State file integrity

Verifies all expected memory files exist in `docs/pdlc/memory/`: CONSTITUTION, INTENT, STATE, ROADMAP, DECISIONS, CHANGELOG, OVERVIEW, and episodes/index. Flags missing or empty files.

#### Check 2 — STATE.md consistency

Validates that STATE.md fields make sense together:
- Phase matches sub-phase (e.g., "Test" sub-phase only appears under "Construction")
- Active feature is "none" when phase is Idle
- Active Beads task only set during Construction/Build
- Last checkpoint format and recency (flags checkpoints >7 days old)
- Phase History's last entry matches current state

#### Check 3 — ROADMAP vs STATE vs reality

Cross-references the roadmap with actual project state:
- At most 1 feature should be "In Progress" — matches STATE.md's active feature
- Every "Shipped" feature has a date and episode reference that actually exists
- No priority gaps (1, 2, 5 → missing 3, 4)
- No orphaned "In Progress" features (roadmap says active but STATE.md disagrees)

#### Check 4 — Beads health + task graph vs STATE

> **Uses Haiku model** for speed — Beads diagnostics are mechanical CLI operations.

**First: runs `bd doctor`** — Beads' built-in diagnostic that checks the `.beads/` database for internal corruption, orphaned records, and integrity issues. Any issues Beads reports are included as PDLC doctor findings. If `bd doctor` suggests fix commands, those are captured and offered to the user during the fix phase.

**Then: cross-references Beads tasks with PDLC state:**
- Any claimed task matches STATE.md's active Beads task
- No orphaned claimed tasks (task claimed in Beads but STATE.md shows no active task)
- "Done" tasks have matching git commits (checks `git log --grep="[task-id]"`)
- Shipped features have all their Beads tasks closed
- No circular dependencies in the task graph (`bd dep tree`)
- No tasks stuck in ready state for >7 days

This is the only check that runs on Haiku. All other checks use Neo's Opus model.

#### Check 5 — Document vs code drift

The most thorough check — scans for divergence between what docs say and what code does:
- **PRD vs implementation**: each acceptance criterion should have a corresponding test. Flags ACs with no test coverage.
- **Architecture vs code**: components described in ARCHITECTURE.md should exist in the codebase. Flags ghost components and undocumented modules.
- **API contracts vs code**: endpoints documented in api-contracts.md should match actual route definitions. Flags contract drift in both directions.
- **OVERVIEW vs reality**: described functionality should still exist in the codebase. Flags removed features still listed as active.

#### Check 6 — Git history analysis (multi-user & rollback detection)

Detects situations where the repo changed outside of PDLC's awareness:
- **Rollback detection**: scans for revert commits after the last PDLC checkpoint. If code was rolled back but PDLC docs weren't updated, architecture docs and episode files may be stale.
- **Multi-user detection**: identifies unique committers since the last checkpoint. Flags when multiple users modified PDLC memory files directly (STATE.md, CONSTITUTION.md, ROADMAP.md should be changed through PDLC commands, not manual edits).
- **Cross-session drift**: identifies commits that don't follow PDLC conventions (no `feat(`, `fix(`, `docs(` prefix), indicating work done outside the PDLC workflow. These changes may not be reflected in PRDs, architecture docs, or episode files.

#### Check 7 — Pending file health

Checks for stale or conflicting temporary state files:
- `.pending-party.json` older than 24 hours → likely abandoned meeting
- `.pending-decision.json` older than 24 hours → likely abandoned decision
- Both files exist → valid nesting (decision containing meeting) or inconsistency
- Meeting type in pending file doesn't match current phase → stale from a different context

#### Check 8 — CONSTITUTION compliance

Verifies the current codebase respects the project's Constitution:
- **Tech stack**: dependencies in `package.json` (or equivalent) match what CONSTITUTION.md declares
- **Test gates**: required test layers actually have test files present
- **Architectural constraints**: rules like "all business logic in service layer" are spot-checked against the codebase

---

### Severity levels

| Level | Meaning | Examples |
|-------|---------|---------|
| **CRITICAL** | Something is broken and will cause problems | Missing memory files, circular deps, shipped features with open tasks, `bd doctor` corruption |
| **WARNING** | Inconsistent and should be addressed | Doc drift, orphaned states, stale files, manual PDLC edits |
| **INFO** | Worth knowing but not urgent | Non-PDLC commits, stale checkpoints, undocumented code modules |

---

### Fix modes

After presenting the full report, you choose:

| Mode | What it does |
|------|-------------|
| **Fix all** | Address critical and warning items (each fix approved individually before applying) |
| **Fix critical only** | Address only critical issues |
| **Review one by one** | Walk through each finding and decide: fix, skip, or defer |
| **Export** | Save the report to `docs/pdlc/doctor-report_[date].md` and fix later |
| **Dismiss** | Acknowledge and continue without fixing |

For Beads issues, fix mode runs the `bd` commands that `bd doctor` suggested. For state file issues, it shows the exact field change. For doc drift, it flags files for manual review (doctor doesn't rewrite PRDs or architecture docs). All fixes follow the write-order rules from the state reconciliation protocol.

---

### Model usage

| Check | Model | Why |
|-------|-------|-----|
| 1-3 (state files) | Opus | Cross-referencing requires reasoning |
| 4 (Beads) | **Haiku** | `bd doctor` and task graph are mechanical CLI operations |
| 5-8 (code, git, compliance) | Opus | Code analysis and pattern matching require complex reasoning |

---

[← Previous: Design Decisions](12-design-decisions.md) | [Back to README](../../README.md)
