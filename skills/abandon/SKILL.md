---
name: abandon
description: "Abandon the current feature and clean up all artifacts"
argument-hint: [feature-name]
---

You are abandoning a feature that is no longer viable. The argument passed is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, read `docs/pdlc/memory/STATE.md` for the current active feature. If no feature is active:

**Check for greenfield initialization to abandon:** Read `docs/pdlc/memory/STATE.md`. If it exists and the project has **no shipped episodes** (check `docs/pdlc/memory/episodes/index.md` — all rows are placeholder `—` or the file has no data rows), and `CLAUDE.md` exists at the project root with `<!-- pdlc-scaffold: true -->` or `<!-- pdlc-expanded: true -->` marker — this is an orphaned greenfield initialization.

Ask the user:

> "No active feature found, but this looks like an incomplete greenfield initialization (scaffold CLAUDE.md exists, no features shipped).
>
> Would you like to **abandon this initialization** and start fresh? This will:
> - Delete the scaffold `CLAUDE.md`
> - Remove all `docs/pdlc/` memory files
> - Clean the slate for a new `/pdlc init`
>
> **(yes / no)**"

If the user confirms: delete `CLAUDE.md` (and `.claude/docs/` if it exists), remove the `docs/pdlc/` directory tree, and confirm:

> "Initialization abandoned. All PDLC files removed. Run `/pdlc init` to start fresh."

Stop here — do not continue to the feature abandonment flow.

If the user declines, stop:
> "No changes made. Run `/pdlc brainstorm` to continue where you left off."

**If no greenfield initialization detected either**, stop:
> "No active feature to abandon. Nothing to do."

If a feature name was provided, verify it matches the active feature in STATE.md or exists in ROADMAP.md as "In Progress" or "Planned".

---

## Lead Agent: Atlas (Product Manager)

Atlas leads abandonment — this is a product decision about stopping work. Read `agents/atlas.md`.

Before the first user-facing message, read `skills/formatting.md` and output a **Sub-phase Transition Header** for "ABANDON FEATURE" followed by:

> **Atlas (Product Manager):** "Understood — sometimes the right call is to stop. Let me walk through the cleanup so nothing is left dangling."

---

## Step 1 — Confirm abandonment

Read `docs/pdlc/memory/STATE.md` to determine the current phase. Tailor the confirmation based on how far the feature has progressed:

**If currently in Inception (brainstorming):**

> "You're about to abandon **[feature-name]** during brainstorming.
>
> Current state: **Inception / [sub-phase]**
> [If brainstorm log exists:] Brainstorm log: `docs/pdlc/brainstorm/brainstorm_[feature]_[date].md`
> [If PRD exists:] PRD: `docs/pdlc/prds/PRD_[feature]_[date].md`
> [If design docs exist:] Design: `docs/pdlc/design/[feature]/`
>
> No code has been written yet — this is a clean exit. This will:
> - Archive brainstorm artifacts (log, PRD, design docs)
> - Update ROADMAP.md to **Dropped**
> - Create an abandonment episode
>
> **Why are you abandoning this feature?**"

**If currently in Construction or Operation:**

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
**Agent:** Atlas
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

### 3a. Close sub-tasks (Construction/Operation only)

**If currently in Inception:** Skip to 3b — no sub-tasks exist yet.

**Otherwise:** List all sub-tasks for this feature:
```bash
bd list --label "epic:[feature-name]" --json
```

For each open sub-task (not already "done"):
```bash
bd close [task-id] --reason "Feature abandoned — see ADR-[NNN]"
```

Report:
> "Closed [N] open Beads sub-tasks for `[feature-name]`."

### 3b. Update the roadmap-level Beads task (always)

The roadmap-level task is the one with labels `roadmap` + `F-NNN`. Regardless of phase, update it so the claim is released and the feature status is durable:

```bash
bd list --label roadmap --label F-NNN --json     # find the task id
bd update <bd-task-id> --status dropped
bd unclaim <bd-task-id>
```

If your Beads version lacks `--status dropped`, use `bd close <bd-task-id> --reason "abandoned — see ADR-[NNN]"` instead. Either way, the claim must be released so `/pdlc brainstorm` stops treating the feature as held.

---

## Step 4 — Update ROADMAP.md

Find the feature row. Update:
- **Status**: `In Progress` or `Planned` → `Dropped`
- **Shipped**: `—` → `Dropped [today]`
- **Episode**: `—` → `[NNN]_abandoned_[feature]_[date].md`
- **Claimed by**: clear back to `—`

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
[Atlas's brief assessment: what can be learned from this abandonment?
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
- **Roadmap Claim** block: replace contents with `_None held. Run `/pdlc brainstorm` to claim the next priority feature._`

Append to Phase History:
```
| [now] | feature_abandoned | [phase] | [sub-phase] | [feature-name] |
```

**Archive artifacts (not delete):**

> **Model override:** Use **Haiku** for file moves and Beads commands.

Archive the abandoned feature's artifacts and clean up Beads:

```bash
bash scripts/archive-feature.sh [feature-name]
```

Commit the archive:

```bash
bash scripts/commit-archive.sh [feature-name]
```

> **End of model override.**

The feature branch is kept (not merged, not deleted) — the user can prune it manually with `git branch -D feature/[name]`.

---

## Step 7 — Handoff to next feature

Read `docs/pdlc/memory/ROADMAP.md`. Find the next priority feature with status `Planned`. Call it `[next-feature]` with ID `[next-id]`.

**If abandoned during Inception (brainstorming):**

> **Atlas (Product Manager):** "Feature `[feature-name]` has been dropped from brainstorming. The brainstorm log and any docs are archived for reference — nothing is lost if you want to revisit the idea later."

> "Here's the roadmap:
>
> - **Just dropped:** `[feature-name]`
> [If next feature exists:]
> - **Next on the roadmap:** `[next-id]: [next-feature]` — [description]
> - **Remaining:** [N] features planned
>
> What would you like to do?
> - **Brainstorm next** — start brainstorming `[next-feature]` now
> - **Pick a different feature** — choose from the roadmap or propose a new one
> - **Pause** — take a break, come back later"

Handle the response:

- **Brainstorm next**: Update ROADMAP.md — set `[next-feature]` to `In Progress`. Immediately begin `/pdlc brainstorm [next-feature]`.
- **Pick a different feature**: If from roadmap, update that feature to `In Progress` and begin `/pdlc brainstorm [that-feature]`. If new, add to ROADMAP.md with next `F-NNN` ID, set to `In Progress`, and begin brainstorm.
- **Pause**: Acknowledge and stop.

**If abandoned during Construction or Operation:**

> **Atlas (Product Manager):** "Feature `[feature-name]` has been abandoned and cleaned up. Everything is documented — the PRD, design docs, and branch are preserved for reference in case you want to revisit later."

> "Here's where we stand on the roadmap:
>
> - **Just abandoned:** `[feature-name]`
> [If next feature exists:]
> - **Next on the roadmap:** `[next-id]: [next-feature]` — [description]
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
- **Greenfield initialization abandonment** (no active feature, scaffold CLAUDE.md, no shipped episodes) removes `CLAUDE.md`, `.claude/docs/`, and `docs/pdlc/` entirely. This is a **Tier 2** action — the user has already confirmed via the abandon prompt, which serves as the Tier 2 confirmation. Log the event in git: `git add -A && git commit -m "chore: abandon greenfield initialization — clean slate for re-init"`.
