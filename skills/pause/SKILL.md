---
name: pause
description: "Pause the current feature and save full state for later resume"
---

You are pausing the current PDLC workflow. This cleanly saves everything so the user can resume exactly where they left off.

---

## Pre-flight

Read `docs/pdlc/memory/STATE.md`.

**If no feature is active** (phase is Idle or a `Complete — Ready for` state):
> "Nothing to pause — no active feature. Run `/pdlc brainstorm <feature>` to start one."
Stop.

**If `.paused-feature.json` already exists:**
> "A feature is already paused (`[feature from file]`). You can:
> - `/pdlc resume` — resume the paused feature
> - `/pdlc resume --discard` — discard the paused state and pause the current feature instead"

If the user chooses discard: delete `.paused-feature.json` and continue. Otherwise stop.

---

## Step 1 — Save full state

Read all fields from STATE.md. Save to `docs/pdlc/memory/.paused-feature.json`:

```json
{
  "feature": "[current feature name]",
  "phase": "[current phase]",
  "subPhase": "[current sub-phase]",
  "activeBeadsTask": "[active task ID and title, or none]",
  "lastCheckpoint": "[last checkpoint from STATE.md]",
  "partyMode": "[party mode from STATE.md]",
  "featureBranch": "feature/[feature-name]",
  "pausedAt": "[now ISO 8601]",
  "pausedBy": "user (/pdlc pause)",
  "stateSnapshot": "[full raw content of the key STATE.md sections]"
}
```

---

## Step 2 — Unclaim active Beads task

If STATE.md shows an active Beads task:

```bash
bd update [task-id] --unclaim
```

This releases the task so it returns to the ready queue. It will be reclaimed on resume.

---

## Step 3 — Update STATE.md

- **Current Phase**: `Idle — Paused`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Paused / [saved phase] / [now ISO 8601]`

Append to Phase History:
```
| [now] | feature_paused | [saved phase] | [saved sub-phase] | [feature-name] |
```

---

## Step 4 — Confirm to user

Read `skills/formatting.md` and output a **Sub-phase Transition Header** for "PAUSED", then:

> "**[feature-name]** paused at **[phase] / [sub-phase]**.
>
> State saved. To resume:
> - `/pdlc resume` — picks up exactly where you left off
> [If Beads task was active:] - Beads task `[task-id]` unclaimed — will be reclaimed on resume
>
> You can start a different feature with `/pdlc brainstorm <feature>` or run `/pdlc doctor` while paused."

---

## Rules

- Only one feature can be paused at a time. If the user wants to pause a different feature, they must discard or resume the existing paused feature first.
- Pausing unclaims the active Beads task but does NOT mark it as done. It returns to the ready queue.
- Pausing does NOT modify ROADMAP.md — the feature stays "In Progress" since work will resume.
- The `.paused-feature.json` file is the sole recovery artifact. If it's deleted, the pause state is lost (but STATE.md Phase History still records that a pause happened).
