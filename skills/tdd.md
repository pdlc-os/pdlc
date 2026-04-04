# Test-Driven Development

## When this skill activates

Activate during the **Build sub-phase** of Construction whenever a Beads task is claimed and implementation work is about to begin. This skill governs every line of implementation code written during the Build sub-phase. It does not apply to scaffolding (e.g. `npm init`, directory creation) or config-only tasks, but applies to all logic, handlers, routes, components, services, hooks, and utilities.

If the task is infrastructure-only (e.g. setting up a CI pipeline, configuring environment variables, provisioning infra), pause before writing any code and ask the human for an explicit TDD override before proceeding.

---

## Protocol

### Before the first test

1. Read the active Beads task in full: title, description, acceptance criteria, epic and story labels.
2. Locate the PRD for this feature at `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`.
3. Find the BDD user story that maps to this task (match via the `story:[id]` label on the task). Read the full Given/When/Then block for that story.
4. Extract the exact Given, When, and Then language. These phrases become the basis for your test names and assertions. Do not paraphrase — use the exact nouns and verbs from the user story.
5. Identify which acceptance criteria from the task map to which Then clauses. Each Then clause should correspond to at least one test case.

### The TDD cycle (Red → Green → Refactor)

Repeat this cycle for each acceptance criterion:

**Step 1 — Red: Write a failing test.**

- Name the test using the Given/When/Then language from the PRD user story.
  - Format: `given [context], when [action], then [expected outcome]`
  - Example: `given unauthenticated user, when POST /login with valid credentials, then returns 200 with JWT`
- The test must be specific: it must call the exact function, module, component, or endpoint that will implement this criterion. Do not write a placeholder test against a stub you intend to replace later.
- Run the test. Confirm it fails with a meaningful failure (not a syntax error or missing import). If it fails for the wrong reason, fix the test setup before proceeding.
- Do not write implementation code at this step. If the module does not exist yet, create an empty export or stub just enough to make the test fail for the right reason (i.e. the logic is not implemented, not that the file is missing).

**Step 2 — Green: Write the minimal implementation to pass the test.**

- Write only the code required to make this specific test pass. Do not implement features not yet covered by a test.
- Run the test. It must pass.
- Run the full test suite. If any previously passing tests now fail, stop and fix the regression before continuing.

**Step 3 — Refactor: Clean up without breaking.**

- Improve naming, extract duplication, simplify logic — but make no functional changes.
- Run the full test suite again after refactoring. All tests must continue to pass.

**Repeat** for the next acceptance criterion.

### Auto-fix loop rule

If a test fails after implementation:

- **Attempt 1**: Diagnose and fix. Re-run the test.
- **Attempt 2**: If still failing, re-read the acceptance criterion and user story. Revise the implementation. Re-run the test.
- **Attempt 3**: If still failing, revise the approach more broadly — check assumptions, re-read the design docs at `docs/pdlc/design/[feature-name]/`. Re-run the test.
- **After 3 failed attempts**: Stop. Do not attempt a 4th fix automatically. Present the human with the following diagnostic info:
  - The test name and full test code
  - The current implementation being tested
  - The exact error output from all 3 attempts
  - Your hypothesis for why the test is failing
  - Two proposed approaches to resolve it
  - Ask: "(A) Continue automatically with approach 1, (B) Continue automatically with approach 2, or (C) Take the wheel — I'll guide you."

### After all acceptance criteria have tests passing

1. Run the full test suite one final time.
2. Confirm zero regressions.
3. Record in `docs/pdlc/memory/STATE.md`: task ID, tests written (count), tests passing (count).
4. Proceed to the Review sub-phase.

---

## Rules

- **No implementation code without a failing test first.** This is non-negotiable. If you find yourself writing logic before a test, stop and write the test.
- Infrastructure-only tasks require explicit human override before skipping TDD. State clearly: "This task appears to be infrastructure-only and may not be testable via unit/integration tests. Requesting TDD override to proceed."
- Test names must use the exact Given/When/Then language from the PRD user story. No generic names like `test1`, `should work`, or `handles error`.
- Each test must target a specific acceptance criterion. One criterion may have multiple tests; one test must not cover multiple criteria.
- The auto-fix loop cap is 3 attempts. Never attempt a 4th fix without human input.
- Refactoring is only permitted after the Green step. Never refactor during Red or during a failing auto-fix loop.
- Do not skip running the full suite after each Green step. Regressions found late cost more than regressions caught immediately.

---

## Output

- A set of test files co-located with (or in the standard test directory adjacent to) the implementation, covering all acceptance criteria for the active task.
- All tests passing when the suite is run.
- `docs/pdlc/memory/STATE.md` updated with task ID, test count, and pass status.
- A clean working tree on the feature branch, ready for the Review sub-phase.
