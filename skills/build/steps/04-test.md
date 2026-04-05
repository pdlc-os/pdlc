## TEST

### Step 15 — Run each test layer

Run the test layers per `skills/test/SKILL.md` (when available). Check CONSTITUTION.md §7 for which gates are required.

Run each layer in this order:

**Layer 1: Unit tests**
Run the project's unit test command (e.g. `npm test`, `yarn test`, `pytest`, as appropriate for the tech stack in CONSTITUTION.md). Record: passed, failed, skipped.

**Layer 2: Integration tests**
Run integration tests (e.g. `npm run test:integration`). If no integration test command exists, note: "No integration test command found — check package.json or Makefile." Record results.

**Layer 3: E2E tests (real Chromium)**
Run E2E tests (e.g. `npx playwright test`, `npm run test:e2e`). These use a real Chromium instance. Record results.

**Layer 4: Performance / load tests**
Run if a performance test command exists (e.g. `npm run test:perf`, `k6 run`). Skip with a logged Tier 3 warning if no command exists.

**Layer 5: Accessibility checks**
Run if an accessibility check command exists (e.g. `npm run test:a11y`, `axe`). Skip with a logged Tier 3 warning if no command exists.

**Layer 6: Visual regression tests**
Run if a visual regression test command exists (e.g. `npm run test:visual`, Percy, Chromatic). Skip with a logged Tier 3 warning if no command exists.

### Step 16 — Check Constitution test gates

Compare results against the required gates in CONSTITUTION.md §7.

For each required gate (checkbox is checked in CONSTITUTION.md):
- If the layer **passed**: continue.
- If the layer **failed**: surface a warning. Human decides: fix, accept, or defer.

For each non-required layer that failed: surface a soft warning. Human decides — do not block.

### Step 17 — Human decides on failures

For any failing layer (required or not), present:

> "[Layer] tests: [N] passed, [N] failed, [N] skipped.
>
> Failing tests: [list]
>
> This layer [IS / IS NOT] a required gate per CONSTITUTION.md.
>
> Options: **(A) Fix** — I address the failures and re-run, **(B) Accept** — ship with this known failure (Tier 3 logged), **(C) Defer** — log to tech debt, address in next episode."

Wait for the human's choice. Repeat until all failures are resolved or explicitly accepted/deferred.

---

Return to `SKILL.md` and proceed to the WRAP-UP section.
