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

**Layer 7: Security scan**

This layer always runs — it is not skippable.

**7a. Dependency audit:**
```bash
npm audit --json 2>/dev/null || true
```
Flag any `critical` or `high` severity vulnerabilities introduced by this feature branch. Compare against the baseline (main branch): `git stash && npm audit --json > /tmp/main-audit.json && git stash pop` — only report *new* vulnerabilities, not pre-existing ones.

**7b. Secret scan on the diff:**
Scan only the files changed on this feature branch for hardcoded secrets:
```bash
git diff main..HEAD --name-only
```
For each changed file, check for:
- Strings matching secret patterns (API keys, tokens, passwords) in assignment contexts
- New `.env` files or changes to existing ones
- AWS keys (`AKIA...`), GitHub tokens (`ghp_...`), Stripe keys (`sk_live_...`), generic long random strings near `secret`/`key`/`token` variables

**7c. OWASP dependency check (if available):**
If `dependency-check` CLI or `npm audit signatures` is available, run it. Otherwise skip with an INFO note.

Record results. Any new critical/high vulnerability or detected secret is flagged as a **required gate** — the user must fix, accept (Tier 1 override for secrets), or defer.

**Layer 8+: Custom test layers**

Read CONSTITUTION.md §7 "Custom Test Layers" table. For each row in the table:
- Run the specified command
- Record: passed, failed, skipped
- If `Required` is `yes`, treat it as a required gate (same as checked built-in layers)
- If `Required` is `no`, treat it as optional (reported but doesn't block)

If the custom test layers table is empty or doesn't exist, skip this step.

### Step 16 — Check Constitution test gates

Compare results against the required gates in CONSTITUTION.md §7 (both built-in and custom layers).

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
