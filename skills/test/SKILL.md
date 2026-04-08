# Test Execution Protocol

## When this skill activates

Activate at the start of the **Test sub-phase** of Construction, after the Review sub-phase is complete and the human has approved the review file. This skill governs the full test execution run for a completed Beads task.

Before starting, read `docs/pdlc/memory/CONSTITUTION.md` — specifically the "Test gates" section. This defines which layers are required to pass before Operation can begin, and which layers (if any) are pre-configured as skipped.

---

## Protocol

Execute the six test layers below in order. Do not skip layers unless the Constitution explicitly marks them as skipped or the human issues an explicit skip instruction mid-run. If a layer is skipped, log it as a Tier 3 guardrail event in `docs/pdlc/memory/STATE.md`.

---

### Layer 1 — Unit Tests

**Purpose**: Confirm all TDD-written tests still pass after any refactoring or review-driven changes.

1. Run the full unit test suite using the project's configured test runner (check `package.json scripts`, `Makefile`, or `pyproject.toml` for the test command).
2. Capture: total tests, passed, failed, skipped, coverage percentage per module.
3. If any unit test fails: this is a regression introduced after the TDD cycle. Stop. Fix the regression before proceeding to Layer 2.
4. Record results.

---

### Layer 2 — Integration Tests

**Purpose**: Verify that service boundaries, database interactions, and external dependency contracts behave correctly when connected.

1. Identify integration test files (typically in a `tests/integration/`, `__tests__/integration/`, or `spec/integration/` directory).
2. Run integration tests. Ensure test databases or test-mode external services are active — do not run against production.
3. Capture: total tests, passed, failed, error messages for any failures.
4. If any integration test fails: diagnose. Check whether the failure is in the new code or in an existing contract that was inadvertently broken. Fix and re-run. Apply the 3-attempt auto-fix rule (same as TDD skill): after 3 failed attempts, surface to human with full diagnostics.
5. Record results.

---

### Layer 3 — End-to-End (E2E) Tests

**Purpose**: Test the complete user journey described in the PRD using a real browser instance, not a simulator or jsdom.

1. Read the PRD at `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`. Identify the user journey(ies) covered by this task.
2. Run E2E tests using a real Chromium instance:
   - Preferred command: `npx playwright test` (or `yarn playwright test`)
   - Alternative: `npx cypress run` if the project uses Cypress
   - Check `package.json scripts` for `e2e`, `test:e2e`, or `playwright` entries
3. E2E tests must exercise the actual UI or API surface against a running local server. Verify the dev server is running before executing.
4. Capture: test names, pass/fail status, screenshots on failure, video if configured.
5. If E2E tests fail: diagnose using screenshots and error output. Apply the 3-attempt auto-fix rule. After 3 attempts, surface to human.
6. Record results.

---

### Layer 4 — Performance Tests

**Purpose**: Ensure the new code does not degrade system performance beyond the budget defined in the Constitution.

1. Check `docs/pdlc/memory/CONSTITUTION.md` for a "Performance budget" or "Perf budget" section. Note any defined thresholds (e.g. p95 response time < 200ms, throughput > 500 req/s).
2. Run the project's load/performance benchmark suite. Check for:
   - `k6` scripts in a `perf/` or `load/` directory
   - `artillery` config files
   - `ab` (Apache Bench) scripts in the Makefile
   - `autocannon` or `wrk` commands in `package.json scripts`
3. If no performance test suite exists and the Constitution defines a perf budget: note this as an Advisory finding and log in the episode test summary.
4. Compare results against the Constitution's perf budget. Flag any threshold violations as Important findings.
5. Record results.

---

### Layer 5 — Accessibility Tests

**Purpose**: Ensure the UI changes in this task meet WCAG standards.

1. Only run this layer if the task includes UI changes (check affected files for components, pages, or views).
2. Run axe-core or equivalent:
   - If Playwright is active: use `@axe-core/playwright` within E2E tests, or run `npx axe [url]`
   - If Cypress is active: use `cypress-axe`
   - Standalone: `npx axe-cli [url]` against the running dev server
3. Capture: WCAG violation count, violation severity (critical / serious / moderate / minor), affected elements.
4. Critical and Serious violations are Important findings. Moderate/Minor are Advisory.
5. Record results.

---

### Layer 6 — Visual Regression Tests

**Purpose**: Detect unintended visual changes to UI components or pages.

1. Only run this layer if the task includes UI changes.
2. Run screenshot diff against the established baseline:
   - If Playwright is active: use `expect(page).toHaveScreenshot()` with an existing baseline
   - If Chromatic/Percy is configured: trigger the visual diff run
   - If no visual regression tooling is configured: note this as an Advisory finding
3. Capture: number of screenshots compared, number of diffs detected, percentage change per screenshot.
4. Any diff above the project's configured threshold (or 0.1% if not configured) is flagged as an Important finding and shown to the human with the diff image.
5. Record results.

---

### After all layers complete

1. Compile the full test summary:

```
## Test Summary — [task-id] — [YYYY-MM-DD]

| Layer               | Status  | Passed | Failed | Skipped | Notes                    |
|---------------------|---------|--------|--------|---------|--------------------------|
| Unit                | [Pass]  | X      | 0      | Y       |                          |
| Integration         | [Pass]  | X      | 0      | Y       |                          |
| E2E                 | [Pass]  | X      | 0      | Y       |                          |
| Performance         | [Pass]  | —      | —      | —       | p95: Xms (budget: Yms)   |
| Accessibility       | [Pass]  | —      | —      | —       | 0 critical violations    |
| Visual Regression   | [Pass]  | X      | 0      | —       | 0 diffs above threshold  |

Skipped layers: [list any, with reason]
Tier 3 guardrail events logged: [list any skips or accepts]
```

2. Write this summary into the active episode file at `docs/pdlc/memory/episodes/[episode-id].md` under the "Test Summary" section.

3. Check `docs/pdlc/memory/CONSTITUTION.md` test gates:
   - If all required layers pass: update `docs/pdlc/memory/STATE.md` — test gate status: passed.
   - If a required layer has failures: surface a soft warning to the human. Present the full failure output. Ask: "(A) Fix the failures now, (B) Accept and continue (logged as Tier 3 guardrail event), or (C) Defer — add to tech debt log."

4. Mark the Beads task as done: `bd close [task-id] --reason "All test layers complete"`

5. Update `docs/pdlc/memory/STATE.md`: task complete, test gate status, any open items.

---

## Rules

- Execute layers in order (1 → 6). Do not run Layer 3 before Layer 2, etc.
- A layer may only be skipped if: (a) `CONSTITUTION.md` explicitly marks it as skipped for this project, or (b) the human issues an explicit skip instruction during the run. Any skip is a Tier 3 guardrail event — log it.
- E2E tests must use a real Chromium instance. jsdom, happy-dom, or similar virtual DOM environments do not satisfy the E2E requirement.
- Do not run any test layer against a production database or production environment. Use test/staging environments only.
- The 3-attempt auto-fix rule applies per failing test per layer. After 3 attempts, escalate to human.
- Constitution test gates are soft: failures surface to human as warnings, not hard blocks. Human decides to fix, accept, or defer.
- All layer results must be written into the episode file — even for skipped layers. Record the reason for skipping.

---

## Output

- All six test layers executed (or explicitly skipped with logged rationale).
- Full test summary written into the episode file at `docs/pdlc/memory/episodes/[episode-id].md`.
- `docs/pdlc/memory/STATE.md` updated with test gate status (passed / failed / accepted with conditions).
- Beads task marked done via `bd done`.
- Any Tier 3 guardrail events (skipped layers, accepted failures) logged in `docs/pdlc/memory/STATE.md`.
- Task ready for: either the next task in `bd ready` queue, or (if queue is empty) episode file drafting and Construction completion.
