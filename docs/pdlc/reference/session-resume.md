# Session Resume Behavior

When a session starts and the session start hook injects STATE.md, Claude **must inform the user** about the resume state before doing anything else. The hook message will contain one of three resume banners:

## 1. RESUME FROM HANDOFF (fresh)

Context was cleared at a gate boundary. The handoff has the exact next action. Tell the user:

> "Resuming `[feature-name]` — picking up from **[next phase]**.
> [1-sentence summary of what was completed and what comes next, derived from the handoff]."

Then read the key artifacts listed in the handoff and proceed with the next action.

## 2. RESUME FROM STEP CHECKPOINT (mid-phase)

Context was cleared mid-phase. The Context Checkpoint has the exact step. Tell the user:

> "Resuming `[feature-name]` — you were in **[sub-phase]**, just finished **[step]**.
> Next: [next_action from checkpoint]."

Then:
1. Read the `skill_file` listed in the checkpoint
2. Jump to the step **after** the `step` field (e.g., if step is "Step 7", start at Step 8)
3. Read any `files_open` listed in the checkpoint for additional context
4. If the handoff also has data from an earlier gate, use `decisions_made` and `key_outputs` as background context
5. Continue executing the skill from the resume point

## 3. RESUME FROM STATE (mid-phase, no checkpoint)

Context was cleared before any step checkpoint was written, or the Context Checkpoint fields are all null. Tell the user:

> "Resuming `[feature-name]` — you're in **[current phase] / [current sub-phase]** but no step checkpoint was saved.
> Let me read the current state and artifacts to pick up where you left off."

Then read STATE.md, the relevant skill file for the current sub-phase, and any on-disk artifacts (PRD, design docs, brainstorm log). Proceed from the beginning of the current sub-phase — some steps may have already completed (check for on-disk artifacts to avoid re-asking questions or regenerating existing files).

## No resume needed

If no resume banner is present (Idle state, no active feature): do not print a resume message. Wait for user input or a `/pdlc` command.

---

## Priority order

When multiple sources are available, use them in this order:

1. **Context Checkpoint** (`step`, `next_action`, `skill_file`) — most precise, step-level
2. **Handoff** (`next_phase`, `next_action`, `key_outputs`) — gate-level
3. **STATE.md fields** (`Current Phase`, `Current Sub-phase`) — phase-level fallback

The session-start hook includes all available data in the resume banner. Claude should use the most specific source available.
