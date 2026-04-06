# State Reconciliation Protocol

This protocol resolves conflicts between PDLC's state files when resuming after an interruption. It runs at session start (invoked by the session-start hook's context injection) and at the beginning of any phase skill that reads STATE.md.

---

## State Files and Their Authority

PDLC maintains state across multiple files. Each has a specific scope:

| File | Scope | Authority |
|------|-------|-----------|
| `STATE.md` | Project-wide phase/sub-phase/task | **Primary source of truth** for where the workflow is |
| `.pending-party.json` | Single in-progress meeting | Temporary — deleted when meeting completes |
| `.pending-decision.json` | Single in-progress decision | Temporary — deleted when decision completes |
| `.paused-feature.json` | Feature state snapshot during hotfix | Temporary — deleted when feature resumes |
| `ROADMAP.md` | Feature status (Planned/In Progress/Shipped) | Must agree with STATE.md's active feature |
| Beads (`.beads/`) | Task status (ready/claimed/done) | Must agree with STATE.md's active task |

**Rule: STATE.md is the single source of truth.** When conflicts exist between files, STATE.md wins. Other files are reconciled to match.

---

## Priority Order for Pending Files

When multiple pending files exist simultaneously, resolve them **innermost-first** (most specific → most general):

1. **`.pending-party.json`** — resolve first (a meeting is the innermost operation)
2. **`.pending-decision.json`** — resolve second (a decision wraps a meeting)
3. **`STATE.md`** — resume the phase workflow last (the outermost context)

This matches the nesting: a phase contains decisions, which contain meetings.

---

## Reconciliation Steps

Run these checks in order when resuming from any interruption.

### Step 1 — Check for stale pending files

**`.pending-party.json`:**
- Read the `timestamp` field. If it's more than 24 hours old, the meeting is stale.
- Stale meetings: delete the file and log a warning in STATE.md Phase History: `| [now] | stale_party_cleanup | [meetingType] pending file removed (stale) | — | [feature] |`
- Fresh meetings: present to user for resume/restart/discard per the orchestrator protocol.

**`.pending-decision.json`:**
- Same 24-hour staleness check.
- Stale decisions: delete the file, log warning.
- Fresh decisions: present to user per the decision skill's pre-flight.

### Step 2 — Reconcile ROADMAP.md with STATE.md

Read both files. Check for conflicts:

**Conflict: ROADMAP shows a feature as "In Progress" but STATE.md shows "Idle" or a different feature.**
- This means the session crashed after ROADMAP was updated but before STATE.md was updated (or vice versa).
- **Resolution:** STATE.md wins.
  - If STATE.md is Idle: set the ROADMAP feature back to "Planned" (it never actually started).
  - If STATE.md has a different active feature: set the orphaned ROADMAP feature back to "Planned" and ensure the STATE.md feature is "In Progress" in ROADMAP.

**Conflict: ROADMAP shows a feature as "Shipped" but STATE.md still shows it as active.**
- This means the reflect step partially completed.
- **Resolution:** If the episode file exists and is marked "Approved", trust ROADMAP (the feature is shipped). Update STATE.md to Idle. If the episode is still "Draft", trust STATE.md (reflect didn't finish).

### Step 3 — Reconcile Beads with STATE.md

**Conflict: Beads shows a task as "claimed" but STATE.md's Active Beads Task is "none".**
- This means `bd update --claim` ran but STATE.md wasn't updated.
- **Resolution:** Check if the task has any committed code (run `git log --oneline --grep="[task-id]"` or check the task's branch status). If work exists, update STATE.md to reflect the active task. If no work exists, unclaim the task: `bd update --unclaim [task-id]`.

**Conflict: STATE.md shows an active task but Beads shows it as "done".**
- This means `bd done` ran but STATE.md wasn't updated.
- **Resolution:** Update STATE.md: clear Active Beads Task, append completion to Phase History.

### Step 4 — Validate STATE.md internal consistency

Check that STATE.md fields are internally consistent:

| Current Phase | Expected Sub-phase | Expected Active Task |
|--------------|-------------------|---------------------|
| Idle | none | none |
| Initialization | — | none |
| Inception | Discover, Define, Design, or Plan | none |
| Construction | Build, Review, or Test | may be set (during Build) |
| Operation | Ship, Verify, or Reflect | none |
| *Complete — Ready for* | none | none |

If fields don't match (e.g., phase is "Inception" but sub-phase is "Test"), log a warning and ask the user:

> "STATE.md has inconsistent fields: phase is `[phase]` but sub-phase is `[sub-phase]`. This may have been caused by a crash during a phase transition.
>
> Which is correct?
> - **[phase]** — I was in [phase], sub-phase should be [expected]
> - **Reset** — set me back to the last consistent checkpoint"

### Step 5 — Report reconciliation results

If any reconciliation was performed, report it to the user before resuming:

> "Session recovery: [N] state conflicts detected and resolved.
> [For each resolution:]
> - [description of what was fixed]
>
> Resuming from: **[phase] / [sub-phase]**"

If no conflicts were found, proceed silently.

---

## Write-Order Rules

To minimize the window for inconsistent state, all PDLC skills must follow these write-order rules:

### Starting an operation (claiming a task, starting a meeting, beginning a decision):
1. Write the pending file FIRST (`.pending-party.json` or `.pending-decision.json`)
2. Update STATE.md SECOND
3. Update ROADMAP.md THIRD (if applicable)
4. Begin the actual operation LAST

### Completing an operation:
1. Write the output FIRST (MOM file, ADR entry, episode file)
2. Update STATE.md SECOND
3. Update ROADMAP.md THIRD
4. Delete the pending file LAST

This ensures that if a crash happens at any point:
- If the pending file exists but STATE.md isn't updated → the pending file tells us what was happening
- If STATE.md is updated but the pending file still exists → the operation completed but cleanup didn't; safe to delete the pending file
- If ROADMAP.md disagrees with STATE.md → STATE.md is authoritative

---

## Integration Points

This protocol is referenced by:
- `hooks/pdlc-session-start.sh` — detects pending files and triggers warnings
- Every phase SKILL.md — reads STATE.md on entry and applies Step 2-4 before resuming
- `skills/decision/SKILL.md` — checks pending files in pre-flight
- `skills/whatif/SKILL.md` — checks pending files in pre-flight
- `skills/build/party/orchestrator.md` — checks `.pending-party.json` before every meeting
