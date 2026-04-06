---
name: abandon
description: "Abandon the current feature and clean up all artifacts"
argument-hint: [feature-name]
---

You are abandoning a feature that is no longer viable. The argument passed is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, read `docs/pdlc/memory/STATE.md` for the current active feature. If no feature is active, stop:
> "No active feature to abandon. Nothing to do."

If a feature name was provided, verify it matches the active feature in STATE.md or exists in ROADMAP.md as "In Progress" or "Planned".

---

## Lead Agent: Oracle (Product Manager)

Oracle leads abandonment — this is a product decision about stopping work. Read `agents/oracle.md`.

Before the first user-facing message, read `skills/formatting.md` and output a **Sub-phase Transition Header** for "ABANDON FEATURE" followed by:

> **Oracle (Product Manager):** "Understood — sometimes the right call is to stop. Let me walk through the cleanup so nothing is left dangling."

---

## Step 1 — Confirm abandonment

> "You're about to abandon **[feature-name]**.
>
> Current state: **[phase] / [sub-phase]**
> [If Beads tasks exist:] Open tasks: [N]
> [If PRD exists:] PRD: `docs/pdlc/prds/PRD_[feature]_[date].md`
> [If design docs exist:] Design: `docs/pdlc/design/[feature]/`
> [If episode draft exists:] Episode draft: `docs/pdlc/memory/episodes/[NNN]_[feature]_[date].md`
>
> This will:
> - Close all open Beads tasks for this feature
> - Update ROADMAP.md to **Dropped**
> - Create an abandonment episode
> - Reset STATE.md to Idle
>
> **Why are you abandoning this feature?**"

Wait for the user's reason. Record it — this goes into the abandonment episode and DECISIONS.md.

---

## Step 2 — Record the decision

Append to `docs/pdlc/memory/DECISIONS.md`:

```markdown
### ADR-[NNN]: Abandon feature [feature-name]

**Date:** [today]
**Source:** User (explicit)
**Phase:** [current phase]
**Sub-phase:** [current sub-phase]
**Agent:** Oracle
**Feature:** [feature-name]
**Status:** Active

**Decision:** Abandon feature `[feature-name]` — stop all work and clean up.

**Context:** [user's reason from Step 1]

**Work completed before abandonment:**
- Phase reached: [phase / sub-phase]
- Beads tasks completed: [N of M]
- PRD: [exists / not created]
- Design docs: [exists / not created]
- Code on feature branch: [yes / no — check git log]

**Alternatives considered:** Not discussed — user decision to abandon.
```

---

## Step 3 — Close Beads tasks

List all tasks for this feature:
```bash
bd list --label "epic:[feature-name]" --json
```

For each open task (not already "done"):
```bash
bd done [task-id] --message "Feature abandoned — see ADR-[NNN]"
```

Report:
> "Closed [N] open Beads tasks for `[feature-name]`."

---

## Step 4 — Update ROADMAP.md

Find the feature row. Update:
- **Status**: `In Progress` or `Planned` → `Dropped`
- **Shipped**: `—` → `Dropped [today]`
- **Episode**: `—` → `[NNN]_abandoned_[feature]_[date].md`

---

## Step 5 — Create abandonment episode

Create a compact episode at `docs/pdlc/memory/episodes/[NNN]_abandoned_[feature-name]_[date].md`:

```markdown
# Episode [NNN]: Abandoned — [feature-name]

**Type:** Abandoned
**Date:** [today]
**Phase reached:** [phase / sub-phase]

## Reason for Abandonment
[User's reason from Step 1]

## Work Completed
- **Beads tasks:** [N] completed, [M] abandoned (closed without completion)
- **PRD:** [exists at path / not created]
- **Design docs:** [exist at path / not created]
- **Code:** [feature branch exists: yes/no. If yes, list key files changed]

## Decision Record
ADR-[NNN]: [link to DECISIONS.md entry]

## Lessons Learned
[Oracle's brief assessment: what can be learned from this abandonment?
Was the feature ill-conceived? Did circumstances change? Was it technically
infeasible? This helps future roadmap planning.]

## Artifacts (archived)
The following artifacts were moved to `docs/pdlc/archive/` for reference:
- PRD: [archive path or "none"]
- Design docs: [archive path or "none"]
- Brainstorm log: [archive path or "none"]
- Feature branch: `feature/[feature-name]` (not merged, not deleted)
```

Update `docs/pdlc/memory/episodes/index.md`:
```
| [NNN] | [feature-name] | [today] | [episode file] | — | Abandoned |
```

---

## Step 6 — Clean up state

**STATE.md:**
- **Current Phase**: `Idle — Ready for next /pdlc brainstorm`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Abandoned / [feature-name] / [now ISO 8601]`

Append to Phase History:
```
| [now] | feature_abandoned | [phase] | [sub-phase] | [feature-name] |
```

**Archive artifacts (not delete):**

> **Model override:** Use **Haiku** for file moves and Beads commands.

Move the abandoned feature's artifacts to the archive so they don't clutter active directories:

```bash
mkdir -p docs/pdlc/archive/prds docs/pdlc/archive/design/[feature-name] docs/pdlc/archive/reviews docs/pdlc/archive/brainstorm docs/pdlc/archive/mom
mv docs/pdlc/prds/PRD_[feature-name]_*.md docs/pdlc/archive/prds/ 2>/dev/null || true
mv docs/pdlc/prds/plans/plan_[feature-name]_*.md docs/pdlc/archive/prds/ 2>/dev/null || true
mv docs/pdlc/design/[feature-name]/* docs/pdlc/archive/design/[feature-name]/ 2>/dev/null || true
rmdir docs/pdlc/design/[feature-name] 2>/dev/null || true
mv docs/pdlc/reviews/REVIEW_[feature-name]_*.md docs/pdlc/archive/reviews/ 2>/dev/null || true
mv docs/pdlc/brainstorm/brainstorm_[feature-name]_*.md docs/pdlc/archive/brainstorm/ 2>/dev/null || true
mv docs/pdlc/mom/[feature-name]_*.md docs/pdlc/archive/mom/ 2>/dev/null || true
```

Clean up Beads:
```bash
bd purge 2>/dev/null || true
bd admin compact --stats 2>/dev/null || true
```

Commit:
```bash
git add docs/pdlc/archive/ docs/pdlc/prds/ docs/pdlc/design/ docs/pdlc/reviews/ docs/pdlc/brainstorm/ docs/pdlc/mom/
git commit -m "chore(pdlc): archive abandoned [feature-name] artifacts + compact beads"
git push origin main
```

> **End of model override.**

The feature branch is kept (not merged, not deleted) — the user can prune it manually with `git branch -D feature/[name]`.

---

## Step 7 — Handoff to next feature

> **Oracle (Product Manager):** "Feature `[feature-name]` has been abandoned and cleaned up. Everything is documented — the PRD, design docs, and branch are preserved for reference in case you want to revisit later."

Read `docs/pdlc/memory/ROADMAP.md`. Find the next priority feature with status `Planned`. Present it using the same next-feature flow as ship Step 18:

> "Here's where we stand on the roadmap:
>
> - **Just abandoned:** `[feature-name]`
> - **Next on the roadmap:** `[F-NNN]: [next-feature]` — [description]
> - **Remaining:** [N] features planned
>
> What would you like to do?
> - **Continue** — start brainstorming `[next-feature]` now
> - **Pause** — take a break
> - **Switch** — work on a different feature"

Handle the response the same way as the ship Step 18 feature loop.

---

## Rules

- Abandonment is permanent in ROADMAP.md (status = Dropped). To revisit the feature later, add it as a new entry with a new F-NNN ID.
- No artifacts are deleted — PRDs, design docs, brainstorm logs, and the feature branch are preserved for reference.
- An abandonment episode is always created — it records what was done and why it was stopped.
- An ADR entry is always created — the decision to abandon is a formal decision.
- The feature branch is NOT merged and NOT deleted. The user can prune it manually with `git branch -D feature/[name]`.
- If `.paused-feature.json` exists for this feature (it was paused during a hotfix), delete it as part of cleanup.
