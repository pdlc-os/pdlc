---
name: resume
description: "Resume a paused feature from its saved checkpoint"
argument-hint: [feature-name | --discard]
---

You are resuming a paused PDLC feature. The argument passed is: `$ARGUMENTS`

---

## Pre-flight

Check if `docs/pdlc/memory/.paused-feature.json` exists.

**If it does not exist and no argument was given:**
> "No paused feature found. Nothing to resume.
>
> To start a feature: `/pdlc brainstorm <feature>`
> To resume from STATE.md checkpoint: just start a new Claude Code session (auto-resume)"
Stop.

**If `--discard` was passed:**
Delete `.paused-feature.json` if it exists.
> "Paused state discarded."
Stop.

**If the file exists:**
Read it. Extract the paused feature details.

**If a feature name was provided as argument and it doesn't match the paused feature:**
> "The paused feature is `[paused feature]`, not `[provided name]`. Resume `[paused feature]`? (yes/no)"
If no, stop.

---

## Step 1 — Show paused state

Read `skills/formatting.md` and output a **Sub-phase Transition Header** for "RESUMING", then present the saved state:

> "Resuming **[feature-name]** from where you left off:
>
> - **Phase:** [saved phase]
> - **Sub-phase:** [saved sub-phase]
> - **Checkpoint:** [saved last checkpoint]
> [If Beads task was active:] - **Task:** [saved task ID and title] (will be reclaimed)
> - **Paused at:** [pausedAt timestamp]
> - **Paused by:** [pausedBy — user or hotfix]"

---

## Step 2 — Check for changes since pause

Check if the codebase changed while the feature was paused (another session, a hotfix, teammate commits):

```bash
git log --oneline --since="[pausedAt timestamp]" main
```

**If commits exist since the pause:**

> "[N] commits have been made to main since this feature was paused."

Rebase the feature branch on main to incorporate changes:
```bash
git checkout [feature branch]
git rebase main
```

If rebase has conflicts:
> "Rebase has conflicts in [files]. Please resolve them, then run `/pdlc resume` again."
Stop.

If clean:
> "Feature branch rebased — changes since pause are incorporated."

**If the changes include a hotfix** (check for `hotfix(` in commit messages):
Run a targeted impact assessment — ask Neo and Echo:
- **Neo:** "Does this hotfix change any architectural assumptions the feature relies on?"
- **Echo:** "Do any of the feature's tests need updating because of this change?"

Present any findings to the user before continuing.

**If no commits since pause:** skip rebase.

---

## Step 3 — Reclaim Beads task

If the saved state had an active Beads task:

```bash
bd update [saved-task-id] --claim
```

If the claim fails (task was closed or claimed by another process):
> "Beads task `[task-id]` could not be reclaimed — it may have been completed or modified while paused. Running `bd ready --json` to find the next available task."

Run `bd ready --json` and pick the next task from the ready queue. Update STATE.md accordingly.

If the claim succeeds:
> "Beads task `[task-id]` reclaimed: [task title]"

---

## Step 4 — Restore STATE.md

Restore STATE.md from the saved snapshot:

- **Current Phase**: `[saved phase]`
- **Current Feature**: `[saved feature name]`
- **Current Sub-phase**: `[saved sub-phase]`
- **Active Beads Task**: `[reclaimed task ID — task title]` (or the next task from Step 3)
- **Last Checkpoint**: `[saved phase] / [saved sub-phase] / [now ISO 8601]`
- **Party Mode**: `[saved party mode]`

Append to Phase History:
```
| [now] | feature_resumed | [saved phase] | [saved sub-phase] | [feature-name] |
```

---

## Step 5 — Delete paused state and hand off

Delete `docs/pdlc/memory/.paused-feature.json`.

Switch to the feature branch:
```bash
git checkout [feature branch]
```

Determine the lead agent for the resumed phase and announce:

> **[Lead Agent Name] ([Role]):** "Welcome back to **[feature-name]**. We're picking up at **[phase] / [sub-phase]**. [If changes were found:] Note: [N] commits were incorporated since the pause — [summary of impact if any]. [If Beads task reclaimed:] Task `[task-id]` is reclaimed and ready to go."

Re-invoke the appropriate phase skill (`/pdlc brainstorm`, `/pdlc build`, or `/pdlc ship`). The skill reads STATE.md and resumes from the checkpoint.

---

## Rules

- Resume always checks for changes since the pause and rebases if needed. It never blindly restores stale state.
- Resume always attempts to reclaim the Beads task that was active at pause time. If it can't, it picks the next ready task.
- Resume deletes `.paused-feature.json` — the pause state is consumed. If the user wants to pause again, they run `/pdlc pause` again.
- Only one feature can be paused at a time. To switch between features, pause one, brainstorm/build the other, then resume the first.
- If STATE.md is not Idle when resume is called (another feature is active), warn the user:
  > "Another feature is currently active (`[active feature]`). Pause it first with `/pdlc pause`, then resume."
