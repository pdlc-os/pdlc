# Doctor — Comprehensive Health Check

Run `/pdlc doctor` at any time to scan your project for inconsistencies between PDLC state, documentation, task graph, and actual code.

### When to run

- After pulling a teammate's changes
- After a long break from the project
- Before starting a new feature
- After a rollback or revert
- When something feels "off" and you're not sure what state PDLC is in

### What it checks

| # | Check | What it catches |
|---|-------|----------------|
| 1 | **State file integrity** | Missing or empty memory files from `docs/pdlc/memory/` |
| 2 | **STATE.md consistency** | Mismatched phase/sub-phase, active feature during Idle, stale checkpoints |
| 3 | **ROADMAP vs STATE vs reality** | Multiple In Progress features, shipped features without episodes, orphaned statuses |
| 4 | **Beads health + task graph vs STATE** | Runs `bd doctor` for internal integrity, then: orphaned claimed tasks, "done" tasks with no commits, open tasks on shipped features, circular dependencies. Uses Haiku model. |
| 5 | **Document vs code drift** | PRD acceptance criteria without tests, architecture docs describing non-existent components, API contract drift, removed functionality still in OVERVIEW |
| 6 | **Git history analysis** | Revert/rollback detection, non-PDLC commits, multi-user edits to PDLC files, cross-session changes |
| 7 | **Pending file health** | Stale `.pending-party.json` or `.pending-decision.json`, conflicting pending files |
| 8 | **CONSTITUTION compliance** | Tech stack mismatches, missing required test layers, architectural constraint violations |

### Severity levels

- **CRITICAL** — Something is broken and will cause problems if not fixed (missing files, circular deps, shipped features with open tasks)
- **WARNING** — Something is inconsistent and should be addressed (doc drift, orphaned states, stale files)
- **INFO** — Worth knowing but not urgent (non-PDLC commits, stale checkpoints, undocumented code)

### Fix modes

After presenting findings, you choose:
- **Fix all** — address critical and warning items (each fix approved individually)
- **Fix critical only** — address only critical issues
- **Review one by one** — walk through each finding
- **Export** — save report to `docs/pdlc/doctor-report_[date].md`
- **Dismiss** — acknowledge and continue

### Multi-user and rollback scenarios

Doctor specifically detects:
- **Rollbacks**: revert commits after the last PDLC checkpoint — flags that code may not match docs
- **Multi-user edits**: identifies when multiple committers changed code or PDLC files since the last checkpoint
- **Manual PDLC file edits**: flags direct edits to STATE.md, CONSTITUTION.md, or ROADMAP.md outside of PDLC commands
- **Cross-session drift**: commits that don't follow PDLC conventions, indicating work done outside the PDLC workflow

---

[← Previous: Design Decisions](12-design-decisions.md) | [Back to README](../../README.md)
