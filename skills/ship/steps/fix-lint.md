# Fix Lint

**Topic slug:** `fix-lint`
**Trigger:** Ship Step 9.0 — Pulse's first action on takeover, before any deployment-artifact prompt or pipeline work.
**Purpose:** Auto-detect the project's tech stack and apply lint/format fixes (auto-fixable findings get applied; the rest are surfaced for the user) so the codebase ships clean.

---

## Scope options

Pulse selects scope based on context:

- *(default)* — fix staged files only (`git diff --cached --name-only --diff-filter=ACM`)
- `--all` — fix the entire codebase
- `--check` — report issues without applying any fixes
- `--files <pattern>` — fix files matching a glob (e.g. `src/api/**`)

---

## Execution Flow

### Step 1 — Determine Scope

Check flags passed:

- `--all`: target entire repository
- `--files <pattern>`: target files matching the provided glob
- *(default)*: run `git diff --cached --name-only --diff-filter=ACM` to get staged files
  - If result is empty: output `No staged files found. Use --all to fix the entire codebase, or stage files first.` and exit

### Step 2 — Detect Available Tools

Run the following checks in parallel. Record which tools are present:

**JavaScript / TypeScript:**
- ESLint: check for `.eslintrc*`, `eslint.config.*`, or `eslint` in `package.json` devDependencies
- Prettier: check for `.prettierrc*`, `prettier.config.*`, or `prettier` in `package.json`
- TypeScript: check for `tsconfig.json`

**Python:**
- Ruff: check for `ruff.toml` or `[tool.ruff]` section in `pyproject.toml`
- Black: check for `black` in `pyproject.toml` or `requirements*.txt`
- isort: check for `isort` in `pyproject.toml` or `requirements*.txt`
- Flake8: check for `.flake8` or `[flake8]` section in `setup.cfg`

**Go:**
- check for `go.mod` → use `gofmt`; check if `golangci-lint` is installed

**Java:**
- check for `pom.xml` → report checkstyle only (Java auto-fix is unsafe)
- check for `build.gradle*` → `gradle checkstyleMain` (report only)

**CSS / SCSS:**
- Stylelint: check for `.stylelintrc*` or `stylelint` in `package.json`

If no tools detected at all, output: `No linting tools detected.` and exit.

### Step 3 — Run Fixes

Skip any tool that is configured but not installed (warn inline, continue).

Run tools in this order for each detected stack:

**JavaScript / TypeScript:**
1. ESLint (if detected): `npx eslint --fix <files>`
2. Prettier (if detected): `npx prettier --write <files>`
3. TypeScript (if detected, `--check` mode only): `npx tsc --noEmit` — report errors, no auto-fix

**Python:**
1. Ruff (if detected): `ruff check --fix <files>` then `ruff format <files>`
2. Else Black: `black <files>`
3. isort (if detected and Ruff not used): `isort <files>`
4. Flake8 (if detected): `flake8 <files>` — report only, no auto-fix

**Go:**
1. `gofmt -w <files>`
2. `golangci-lint run --fix` (if installed)

**Java:**
1. `mvn checkstyle:check` or `gradle checkstyleMain` — report only

**CSS / SCSS:**
1. `npx stylelint --fix <files>`

In `--check` mode: replace all `--fix` / `--write` flags with their check-only equivalents. Do not modify any files.

**Note:** Run Prettier after ESLint — Prettier normalises formatting that ESLint may have partially modified.

### Step 4 — Check Remaining Issues

After fixes are applied, run a final read-only pass to capture what remains. Capture counts per tool.

### Step 5 — Report

Output summary with files targeted, files modified, issues fixed per tool, and remaining issues requiring manual fix.

---

## Key Rules

1. **Never modify files in `--check` mode** — read-only analysis only
2. **Staged files by default** — do not touch unstaged work
3. **Prettier runs after ESLint** — always last in the JS/TS chain
4. **Skip tools that aren't installed** — warn but continue with available tools
5. **TypeScript type errors are never auto-fixed** — report only
6. **Java linting is report-only** — auto-fix for Java is unsafe
7. **Always report both fixed and remaining** — never show only one side
