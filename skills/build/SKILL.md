---
name: build
description: "Run the Construction phase (Build → Review → Test) for the current feature"
---

You are running the Construction phase. Follow every step in order. Do not skip steps.

---

## Lead Agent Assignment

| Phase | Lead Agent | Why |
|-------|-----------|-----|
| Construction (Build → Review → Test → Wrap-up) | **Neo** (Architect) | Architectural oversight, design conformance, cross-cutting concerns, review coordination |

Read Neo's full persona from `agents/neo.md` and embody his perspective throughout Construction.

Before the first user-facing message, read `skills/formatting.md` for the visual patterns, then output a **Phase Transition Banner** for "BUILD" (with the feature name) followed by:

> **Neo (Architect):** "Neo here — still at the helm. We've got a solid design, and now it's time to bring it to life. I'll be overseeing the build loop, coordinating reviews, and making sure every line of code stays true to the architecture. Let's ship some quality code."

---

## Pre-flight: Load state and context (Steps 1–3)

Read `skills/build/steps/01-pre-flight.md` and execute it completely.

Return here when STATE.md shows `Construction` and the feature branch is checked out.

## BUILD LOOP (Steps 4–11)

Output a **Sub-phase Transition Header** (per `skills/formatting.md`) for "BUILD".

Read `skills/build/steps/02-build-loop.md` and execute it completely.

Return here when `bd ready` returns an empty list and all tasks are complete.

## REVIEW (Steps 12–14)

Output a **Sub-phase Transition Header** for "REVIEW".

Read `skills/build/steps/03-review.md` and execute it completely.

Return here when the review is approved and STATE.md shows sub-phase `Test`.

## TEST (Steps 15–17)

Output a **Sub-phase Transition Header** for "TEST".

Read `skills/build/steps/04-test.md` and execute it completely.

Return here when all test layers are resolved (passed, accepted, or deferred).

## WRAP-UP (Steps 18–20)

Output a **Sub-phase Transition Header** for "WRAP-UP".

Read `skills/build/steps/05-wrap-up.md` and execute it completely.

Construction is complete when STATE.md shows `Construction Complete — Ready for /pdlc ship`.

---

## Rules

- TDD is enforced on every task. No implementation code without a failing test first. No exceptions without explicit human override.
- The auto-fix loop cap is 3 attempts per failing test. Never exceed this without human input.
- All review findings are soft warnings. Human decides: fix, accept, or defer. No finding auto-blocks the build.
- Human must approve the review file before PR comments are pushed. Never push automatically.
- Never merge to main during Construction. The feature branch is merged during `/pdlc ship`.
- If context is running low (≤35% remaining), update STATE.md immediately and wrap up the current task cleanly before context compacts.
- The user can issue `/pdlc decide <text>` at any point during Construction to record a decision. This pauses the current flow, runs a full Decision Review Party, and after the decision is recorded, offers to resume Construction from the last STATE.md checkpoint. Any artifacts updated by the decision (architecture, test gates, roadmap) are automatically picked up on resume.
