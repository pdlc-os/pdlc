---
name: build
description: "Run the Construction phase (Build → Review → Test) for the current feature"
---

You are running the Construction phase. Follow every step in order. Do not skip steps.

---

## Pre-flight: Load state and context (Steps 1–3)

Read `skills/build/steps/pre-flight.md` and execute it completely.

Return here when STATE.md shows `Construction` and the feature branch is checked out.

## BUILD LOOP (Steps 4–11)

Read `skills/build/steps/build-loop.md` and execute it completely.

Return here when `bd ready` returns an empty list and all tasks are complete.

## REVIEW (Steps 12–14)

Read `skills/build/steps/review.md` and execute it completely.

Return here when the review is approved and STATE.md shows sub-phase `Test`.

## TEST (Steps 15–17)

Read `skills/build/steps/test.md` and execute it completely.

Return here when all test layers are resolved (passed, accepted, or deferred).

## WRAP-UP (Steps 18–20)

Read `skills/build/steps/wrap-up.md` and execute it completely.

Construction is complete when STATE.md shows `Construction Complete — Ready for /ship`.

---

## Rules

- TDD is enforced on every task. No implementation code without a failing test first. No exceptions without explicit human override.
- The auto-fix loop cap is 3 attempts per failing test. Never exceed this without human input.
- All review findings are soft warnings. Human decides: fix, accept, or defer. No finding auto-blocks the build.
- Human must approve the review file before PR comments are pushed. Never push automatically.
- Never merge to main during Construction. The feature branch is merged during `/ship`.
- If context is running low (≤35% remaining), update STATE.md immediately and wrap up the current task cleanly before context compacts.
