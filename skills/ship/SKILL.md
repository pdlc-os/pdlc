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

> "STATE.md shows the current phase is `[phase]`, not `Construction Complete`. Running `/ship` before Construction is complete may cause issues.
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

## Operation Flow

The Operation phase runs three sub-phases in strict sequence. Each sub-phase is defined in its own file under `skills/ship/steps/`. Read each file completely and execute every step in it before moving to the next. Do not skip a sub-phase. Do not move forward past an approval gate without explicit human confirmation.

### Sub-phase 1 — SHIP

Read `skills/ship/steps/ship.md` and execute every step completely (Steps 3–9).

Return here when CI/CD is triggered and STATE.md shows `Verify`.

### Sub-phase 2 — VERIFY

Read `skills/ship/steps/verify.md` and execute every step completely (Steps 10–12).

Return here when smoke tests are approved and STATE.md shows `Reflect`.

### Sub-phase 3 — REFLECT

Read `skills/ship/steps/reflect.md` and execute every step completely (Steps 13–18).

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
