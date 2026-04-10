# State
<!-- pdlc-template-version: 2.1.0 -->
<!-- This file is the live operational state of the PDLC workflow.
     It is written by PDLC hooks and commands — do not edit manually unless recovering from an error.
     Claude reads this file at the start of every session to auto-resume from the last checkpoint.
     If this file is missing or empty, PDLC will prompt you to run /pdlc init. -->

**Last updated:** <!-- YYYY-MM-DDTHH:MM:SSZ — set automatically by hooks -->

---

## Current Phase

<!-- Valid values: Initialization | Inception | Construction | Operation -->

Initialization

---

## Current Feature

<!-- The name of the feature currently being worked on.
     Matches the [feature-name] slug used in file paths under docs/pdlc/.
     Example: user-auth | billing-integration | onboarding-flow
     Set to "none" when between features. -->

none

---

## Active Beads Task

<!-- The Beads task currently claimed by Claude.
     Format: [task-id] — [task title]
     Example: bd-a1b2 — Add OAuth2 login with GitHub
     Set to "none" when no task is active. -->

none

---

## Current Sub-phase

<!-- The specific sub-phase within the current phase.
     Inception sub-phases: Discover | Define | Design | Plan
     Construction sub-phases: Build | Review | Test
     Operation sub-phases: Ship | Verify | Reflect
     Set to "none" during Initialization or between phases. -->

none

---

## Last Checkpoint

<!-- The most recent point where state was explicitly saved.
     Format: [Phase] / [Sub-phase] / [YYYY-MM-DDTHH:MM:SSZ]
     Example: Construction / Build / 2026-04-03T14:32:00Z
     Updated: (a) at every phase/sub-phase transition, (b) on context CRITICAL warning,
     (c) after every Beads task completes. -->

Initialization / — / <!-- timestamp -->

---

## Party Mode

<!-- Spawn mode for multi-agent party meetings during Construction.
     Valid values: agent-teams | subagents | solo | none
     Set once at the first Wave Kickoff standup during /pdlc build.
     "none" means no preference has been set yet. -->

none

---

## Active Blockers

<!-- List anything currently preventing forward progress.
     Each blocker should have: what it is, when it was logged, and who/what needs to resolve it.
     Format: - [YYYY-MM-DD] [description] — waiting on: [person/system]
     Example:
       - [2026-04-03] Supabase project not provisioned — waiting on: human (needs account setup)
       - [2026-04-03] bd-c3d4 has unresolved merge conflict — waiting on: Claude (will resolve next session)
     Clear this list as blockers are resolved. -->

<!-- none -->

---

## Context Checkpoint

<!-- Updated by Claude after each numbered step within a skill, and by the
     context monitor hook at CRITICAL (≤25% remaining).
     Records exactly where Claude was so /clear recovery is precise.

     Fields:
       - triggered_at: ISO timestamp of the last update
       - active_task: Beads task ID and title at time of save
       - sub_phase: sub-phase in progress
       - step: the step number just completed (e.g. "Step 7")
       - skill_file: path to the skill file being executed
       - work_in_progress: one-sentence summary of what was just completed
       - next_action: the exact next step Claude should take on resume
       - files_open: list of files that were being edited
-->

```json
{
  "triggered_at": null,
  "active_task": null,
  "sub_phase": null,
  "step": null,
  "skill_file": null,
  "work_in_progress": null,
  "next_action": null,
  "files_open": []
}
```

---

## Handoff

<!-- Context handoff for session continuity.
     This section is OVERWRITTEN (not appended) at each approval gate so Claude
     can resume cleanly after a /clear. It captures the minimum context needed to
     pick up where the last session left off.

     Fields:
       - phase_completed: the phase/sub-phase that just finished
       - next_phase: the phase/sub-phase that should start next
       - feature: the active feature name
       - key_outputs: file paths to artifacts produced (Claude reads these on resume)
       - decisions_made: important decisions from the completed phase (2-3 items max)
       - next_action: the exact first thing Claude should do on resume
       - pending_questions: unresolved items the user needs to address

     Written by: PDLC skill files at each approval gate
     Read by: pdlc-session-start.sh on session start
     Cleared by: 03-reflect.md Step 17 when feature completes -->

```json
{
  "phase_completed": null,
  "next_phase": null,
  "feature": null,
  "key_outputs": [],
  "decisions_made": [],
  "next_action": null,
  "pending_questions": []
}
```

---

## Phase History

<!-- Append a row every time the phase or sub-phase changes.
     Written automatically by hooks. Do not edit manually. -->

| Timestamp | Event | Phase | Sub-phase | Feature |
|-----------|-------|-------|-----------|---------|
| <!-- YYYY-MM-DDTHH:MM:SSZ --> | init | Initialization | — | none |
