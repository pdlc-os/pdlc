---
name: ship
description: "Run the Operation phase (Ship → Verify → Reflect) for the current feature"
---

You are running the Operation phase. Follow every step in order. Do not skip steps.

---

## Pre-flight: Load state and context

### Step 1 — Read STATE.md

Read `docs/pdlc/memory/STATE.md` completely.

Extract:
- **Current Phase**: must be `Construction Complete — Ready for /ship`
- **Current Feature**: the `[feature-name]` slug
- **Episode file path**: look in `docs/pdlc/memory/episodes/` for a draft file matching `[NNN]_[feature-name]_[YYYY-MM-DD].md`

If the phase is not `Construction Complete — Ready for /ship`, warn the user:

> "STATE.md shows the current phase is `[phase]`, not `Construction Complete`. Running `/pdlc ship` before the build is complete may cause issues.
>
> Continue anyway? (yes/no)"

Wait for confirmation before proceeding.

### Step 2 — Verify test gates

Read `docs/pdlc/memory/CONSTITUTION.md` §7 (Test Gates).

Read the episode file draft at `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`.

Check the Test Summary table in the episode file against the required gates in CONSTITUTION.md.

If any required gate shows `fail` in the episode file, warn the user:

> "Required test gate `[layer]` shows as failed in the episode file. Shipping with failing required gates is a Tier 3 logged warning.
>
> Proceed anyway? (yes/no)"

Log the response in STATE.md as a Tier 3 event if the user proceeds with a failed gate.

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Operation`
- **Current Sub-phase**: `Ship`
- **Last Checkpoint**: `Operation / Ship / [now ISO 8601]`

---

## Lead Agent Assignments

Operation has two lead agents with a handoff at the Verify→Reflect boundary:

| Sub-phases | Lead Agent | Why |
|------------|-----------|-----|
| Ship + Verify (Steps 3–12) | **Pulse** (DevOps) | Merge, versioning, CI/CD, deployment, smoke tests, environment verification |
| Reflect (Steps 13–18) | **Jarvis** (Tech Writer) | Retro generation, episode finalization, CHANGELOG, OVERVIEW, documentation commits |

Read the lead agent's full persona from `agents/pulse.md` or `agents/jarvis.md` and embody their perspective throughout their sub-phases.

Before the first user-facing message, read `skills/formatting.md` for the visual patterns, then output a **Phase Transition Banner** for "SHIP" (with the feature name) followed by:

> **Pulse (DevOps):** "Pulse here — let's get this feature into production! I'll handle the merge to main, version tagging, CI/CD pipeline, deployment verification, and smoke tests. Almost at the finish line."

---

## Operation Flow

The Operation phase runs three sub-phases in strict sequence. Each sub-phase is defined in its own file under `skills/ship/steps/`. Read each file completely and execute every step in it before moving to the next. Do not skip a sub-phase. Do not move forward past an approval gate without explicit human confirmation.

### Sub-phase 1 — SHIP (Lead: Pulse)

Output a **Sub-phase Transition Header** (per `skills/formatting.md`) for "SHIP".

Read `skills/ship/steps/01-ship.md` and execute every step completely (Steps 3–9).

Return here when CI/CD is triggered and STATE.md shows `Verify`.

### Sub-phase 2 — VERIFY (Lead: Pulse)

Output a **Sub-phase Transition Header** for "VERIFY".

Read `skills/ship/steps/02-verify.md` and execute every step completely (Steps 10–12).

Return here when smoke tests are approved and STATE.md shows `Reflect`.

### — HANDOFF: Pulse → Jarvis —

After smoke tests are approved and before starting Reflect, output an **Agent Handoff** block (per `skills/formatting.md`) with:

> **Pulse (DevOps):** "Deployment verified, smoke tests passing — we're live! It's been a smooth ride getting this deployed. I'm handing off to Jarvis now for the retrospective. Great working with you on this one."
>
> **Jarvis (Tech Writer):** "Jarvis here — nice to finally step into the spotlight! The feature is shipped and verified, which means it's time to look back and capture what we learned. I'll generate the retrospective, finalize the episode file, and update the delivery record. Let's wrap this up properly."

### Sub-phase 3 — REFLECT (Lead: Jarvis)

Output a **Sub-phase Transition Header** for "REFLECT".

Read `skills/ship/steps/03-reflect.md` and execute every step completely (Steps 13–18).

Operation is complete when STATE.md shows `Idle — Ready for next /brainstorm`.

---

## Rules

- Never force-push to `main`. This is a Tier 1 hard block with no override.
- Never push PR comments or tags without human approval at the ship gate (Step 3).
- Never proceed to Reflect without human sign-off on smoke tests (Step 12).
- Never commit the episode file without human approval (Step 15).
- If the deployment URL is unknown, ask — do not guess or skip smoke tests.
- The merge strategy is always `--no-ff` (merge commit). Do not squash or rebase feature branches.
- If any step fails due to an external service (GitHub, CI, deploy target), describe the failure clearly and give the user the manual steps to resolve it. Do not silently skip.
