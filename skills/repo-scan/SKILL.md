# Repo Scan — Brownfield Initialization

## When this skill activates

During `/pdlc init` when the repository contains existing source code (brownfield project). The goal is to deeply review the existing codebase and produce pre-populated drafts of all memory bank files, so initialization reflects reality rather than starting from blank templates.

---

## Protocol

Execute every step below in order. Do not skip any step. Collect all findings before writing any memory files.

---

### Step 1 — Map the repository structure

Run the following to understand the top-level layout:

```bash
git ls-files | head -200
```

Also run:
```bash
find . -maxdepth 3 \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './.beads/*' \
  -not -path './docs/pdlc/*' \
  -not -name '.DS_Store' \
  | sort
```

From this output, identify:
- Primary language(s) (file extensions)
- Framework indicators (`package.json`, `Gemfile`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, etc.)
- Entry points (`main.*`, `index.*`, `app.*`, `server.*`, `cmd/`)
- Test directories (`__tests__/`, `spec/`, `test/`, `tests/`, `*.test.*`, `*.spec.*`)
- Config files (`.env.example`, `docker-compose.yml`, `Dockerfile`, CI/CD configs)
- Existing documentation (`README*`, `docs/` excluding `docs/pdlc/`)

---

### Step 2 — Read key manifest and config files

Read every file from this list that exists:

- `package.json` / `package-lock.json` — for Node.js projects
- `Gemfile` — for Ruby projects
- `pyproject.toml` / `requirements.txt` / `setup.py` — for Python projects
- `go.mod` — for Go projects
- `Cargo.toml` — for Rust projects
- `pom.xml` / `build.gradle` — for Java/Kotlin projects
- `docker-compose.yml` / `Dockerfile` — for containerised stacks
- `.github/workflows/*.yml` — for CI/CD pipelines
- `README.md` / `README.rst` / `README.txt` — for existing documentation
- `.env.example` — for environment variable hints
- Any existing `ARCHITECTURE.md`, `CONTRIBUTING.md`, `DECISIONS.md`, or `ADR/` directory

Extract from these files:
- **Tech stack**: languages, frameworks, databases, cloud providers, key libraries
- **Scripts**: what `test`, `build`, `start`, `deploy` commands exist
- **Dependencies**: categorise into frontend, backend, testing, dev tools
- **Environment variables**: what external services are configured
- **CI/CD pipeline**: what stages run on merge/push

---

### Step 3 — Read entry points and core source files

Identify and read (or skim) up to 10 of the most important source files. Priority order:

1. Main entry point (`index.js`, `main.py`, `app.rb`, `main.go`, `src/main.*`, etc.)
2. Router or route definitions (`routes/`, `router.*`, `urls.py`, `routes.rb`)
3. Core models or data layer (`models/`, `schema.*`, `prisma/schema.prisma`, `db/schema.rb`)
4. Primary controllers or handlers (`controllers/`, `handlers/`, `views/`, `resolvers/`)
5. Auth layer if present (`auth.*`, `middleware/auth.*`, `lib/auth/`)
6. Existing API contract files (`openapi.yaml`, `swagger.json`, `graphql/schema.graphql`)

From these files, identify:
- **Core features**: what the application already does (be specific — list each distinct feature)
- **Data model**: main entities and their relationships
- **API surface**: existing endpoints or mutations
- **Business logic patterns**: where decisions are made, how data flows
- **Architectural style**: MVC, hexagonal, serverless functions, monolith, microservices

---

### Step 4 — Read existing tests

Find and skim up to 10 test files across different test types:

```bash
git ls-files | grep -E '\.(test|spec)\.' | head -20
git ls-files | grep -E '^(test|tests|spec|__tests__)/' | head -20
```

From test files, identify:
- What features are already covered by tests
- What testing libraries / frameworks are used
- Approximate test coverage (many tests = good coverage, few = sparse)
- Whether tests are unit, integration, or E2E style
- Any test conventions (naming, file co-location, fixtures)

---

### Step 5 — Read git history

Run the following to understand the project's timeline:

```bash
git log --oneline --no-merges -50
```

Also run:
```bash
git log --format="%ai %s" --no-merges -20
```

From the git log, identify:
- When the project started (first commit date)
- The main feature areas worked on (infer from commit messages)
- Recent areas of activity (last 10 commits)
- Any architectural pivots (e.g. "migrate to X", "replace Y with Z", "rewrite")
- Recurring contributors (for the team context)

---

### Step 6 — Synthesise findings

Before writing any file, compose a structured internal summary with these sections. You will use this summary to write all memory files:

```
REPO SCAN SUMMARY
=================

PROJECT
  Name: [inferred from package.json/README/directory name]
  Description: [1–2 sentence description of what it does]
  Started: [date of first commit]
  Primary language: [language]
  Tech stack: [framework + DB + infra]

EXISTING FEATURES (list each concrete feature the app currently has)
  1. [Feature name] — [1-sentence description]
  2. ...

DATA MODEL (main entities)
  - [Entity]: [fields / relationships in plain English]
  - ...

API SURFACE (if applicable)
  - [METHOD /path] — [what it does]
  - ...

ARCHITECTURAL PATTERNS
  - [Pattern observed, e.g. "MVC via Rails conventions", "Service objects for business logic"]

TEST COVERAGE
  - Frameworks: [list]
  - Covered: [features with tests]
  - Gaps: [features with little or no test coverage]

CI/CD
  - [What pipeline stages exist, what triggers them]

KEY DECISIONS (inferred from code and git history)
  1. [Decision inferred, e.g. "Chose PostgreSQL over MongoDB — evidenced by ActiveRecord schemas"]
  2. ...

TECH DEBT SIGNALS (code patterns suggesting debt)
  - [e.g. "TODO/FIXME comments found in N files", "No tests for auth module", "Deprecated dep X"]

RECENT ACTIVITY (last 10 commits summary)
  - [Area of focus, date range]
```

Print this summary to the user before proceeding, and ask: **"Does this look accurate? Any corrections before I generate the memory files?"** Wait for the user's response. Incorporate any corrections.

---

### Step 7 — Generate memory files from scan findings

Use the verified summary to write pre-populated versions of all memory files. Do not use blank template stubs — fill in real content wherever the scan produced findings.

#### `CONSTITUTION.md`

- **Tech Stack table**: fill in actual stack from scan
- **Architectural Constraints**: list observed patterns as constraints (e.g. "Service layer separates business logic from controllers — maintain this separation")
- **Coding Standards**: infer from code (e.g. linter config, consistent naming patterns found)
- **Test Gates**: check layers that already have tests; suggest enabling them
- Leave other sections as instructed defaults

#### `INTENT.md`

- **Project name**: from scan
- **Problem statement**: infer from README + features list. Write 2–4 sentences describing what problem the app solves
- **Target user**: infer from README or feature names. Mark clearly as "(inferred — please verify)"
- **Core value proposition**: draft from features and problem statement. Mark as "(inferred)"
- Leave success metrics and out-of-scope as placeholders — these need human input

#### `OVERVIEW.md`

This is the most important file to populate thoroughly:

- **Project Summary**: 2–3 sentences about what the app does today
- **Active Functionality**: list every feature identified in Step 3 as a bullet point with a 1-sentence description
- **Architecture Summary**: describe the architectural style and key layers from Step 3
- **Known Tech Debt**: list all tech debt signals from Step 6
- **Shipped Features table**: leave empty (no PDLC episodes yet, but note "Pre-PDLC functionality documented above")

#### `DECISIONS.md`

- Record each key decision from Step 6 as a lightweight ADR entry:

```markdown
## ADR-001 — [Decision title] *(pre-PDLC, inferred)*

**Date:** [inferred from git log or "unknown"]
**Status:** Accepted

**Decision:** [What was decided]

**Context:** [Why this decision makes sense given the codebase]

**Inferred from:** [git log / package.json / schema file / etc.]

---
```

Mark all pre-PDLC entries as `*(pre-PDLC, inferred)*` so the team knows these were reverse-engineered.

#### `CHANGELOG.md`

- Add a single entry for the pre-PDLC state:

```markdown
## Pre-PDLC baseline — [first commit date] to [today]

### Existing functionality
[List the features from the scan as bullet points under "Added"]

*Note: This entry documents the state of the repository before PDLC was introduced.
       Future entries will be generated by Jarvis during each Ship sub-phase.*
```

#### `ROADMAP.md` and `STATE.md`

- Populate with project name but leave feature planning sections as stubs
- Set STATE.md to `Initialization Complete — Ready for /pdlc brainstorm`

#### `CLAUDE.md` (project root)

Generate a project-level `CLAUDE.md` at the repository root. This file gives Claude persistent context about the project across all sessions — not just PDLC sessions. It should be concise, factual, and derived entirely from scan findings.

Structure:

```markdown
# [Project Name]

[1–2 sentence description of what the project does, from README or inferred from features]

## Tech Stack

- **Language:** [primary language(s)]
- **Framework:** [framework(s)]
- **Database:** [if detected]
- **Infrastructure:** [Docker, cloud provider, etc. if detected]
- **Key libraries:** [top 5–8 significant dependencies]

## Project Structure

[Brief description of directory layout — which directories contain what. Focus on the top 2 levels. Use a compact list, not a tree diagram.]

## Development

- **Install:** `[install command from package.json/Gemfile/etc.]`
- **Dev server:** `[start command]`
- **Build:** `[build command]`
- **Test:** `[test command(s)]`
- **Deploy:** `[deploy command, or "Not configured" if none found]`

## Architecture

[2–4 sentences describing the architectural style, key layers, and data flow. Reference specific directories where each layer lives.]

## Coding Conventions

[List 3–6 conventions observed in the codebase — naming patterns, file organization, import style, error handling approach, etc. Only include conventions that are clearly consistent across the codebase.]

## Key Files

[List 5–10 of the most important files for understanding the project — entry points, route definitions, schema files, config files. Use format: `path/to/file` — one-line description.]
```

**Rules for CLAUDE.md generation:**
- Keep it under 80 lines. Brevity is critical — this file is loaded into every Claude session.
- Only include facts evidenced by the scan. Do not speculate or add aspirational content.
- Do not duplicate PDLC-specific information (phases, agents, memory files) — that belongs in the PDLC CLAUDE.md installed by the plugin.
- If CLAUDE.md already exists in the repo, **do not overwrite it**. Instead, present the generated content to the user and ask: "A CLAUDE.md already exists. Want me to merge these findings into it, replace it, or skip?"

---

## Rules

- **Never invent functionality** that isn't evidenced in the code, README, or git history. If you're uncertain, mark findings with "(inferred — please verify)".
- **Prefer specificity over generality**. "User authentication with JWT via Devise" is better than "authentication exists".
- **Respect existing conventions**. If the codebase uses a specific naming convention or architecture, document it in CONSTITUTION.md as a constraint to preserve.
- **Flag gaps explicitly**. If a feature exists but has no tests, say so. If there's no README, say so. If the git history is sparse, say so.
- **Mark all inferred content clearly** so the team can verify and correct.

---

## Output

Seven fully populated memory files under `docs/pdlc/memory/` plus a project-root `CLAUDE.md`, all derived from real codebase analysis rather than blank templates.
