# Session Resume Behavior

When a session starts and the session start hook injects STATE.md, Claude **must inform the user** about the resume state before doing anything else. The hook message will contain one of three resume banners:

## 1. RESUME FROM HANDOFF (fresh)

Context was cleared at a gate boundary. The handoff has the exact next action. Tell the user:

> "Resuming `[feature-name]` — picking up from **[next phase]**.
> [1-sentence summary of what was completed and what comes next, derived from the handoff]."

Then read the key artifacts listed in the handoff and proceed with the next action.

## 2. RESUME FROM STATE (mid-phase, stale handoff)

Context was cleared mid-phase, after the last gate. The handoff is from an earlier gate. Tell the user:

> "Resuming `[feature-name]` — you're mid-way through **[current sub-phase]** (last gate was [handoff phase_completed]).
> Let me read the current artifacts and pick up where you left off."

Then read STATE.md, the relevant skill file for the current sub-phase, and any artifacts that exist on disk (PRD, design docs, brainstorm log) to reconstruct context. Proceed from the current sub-phase.

## 3. RESUME FROM STATE (mid-phase, no handoff)

Context was cleared before any gate was reached, or the handoff is empty. Tell the user:

> "Resuming `[feature-name]` — you're in **[current phase] / [current sub-phase]** but no handoff was saved.
> Let me read the current state and artifacts to pick up where you left off."

Then read STATE.md, the relevant skill file, and any on-disk artifacts. Proceed from the current sub-phase.

## No resume needed

If no resume banner is present (Idle state, no active feature): do not print a resume message. Wait for user input or a `/pdlc` command.
