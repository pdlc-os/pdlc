# Constitution
<!-- This file is the single source of truth for how this project is built.
     PDLC reads it before every phase. Strong defaults are already set.
     Override only what your team explicitly agrees to change.
     Changing this file is a Tier 2 safety event — PDLC will pause and confirm. -->

**Version:** 1.0.0
**Last updated:** <!-- YYYY-MM-DD — update whenever this file changes -->
**Project:** <!-- Your project name -->

---

## 1. Tech Stack Decisions

<!-- Lock in your chosen technologies here. Once set, PDLC treats these as constraints
     and will flag any agent output that deviates from them.
     Format: Technology — chosen option — brief rationale.
     Example:
       - Language: TypeScript (strict mode) — team familiarity, type safety
       - Runtime: Node.js 22 LTS — long-term support, performance
       - Frontend framework: Next.js 14 App Router — SSR, file-based routing
       - Database: PostgreSQL 16 — relational, battle-tested
       - ORM: Drizzle — lightweight, type-safe
       - Styling: Tailwind CSS v4 — utility-first, no runtime overhead
       - Auth: Supabase Auth — managed, supports OAuth flows
       - Hosting: Fly.io — simple deploy, affordable egress
-->

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | <!-- e.g. TypeScript 5, strict mode --> | <!-- why --> |
| Runtime / Framework | <!-- e.g. Node.js 22 LTS, Next.js 14 --> | <!-- why --> |
| Database | <!-- e.g. PostgreSQL 16 --> | <!-- why --> |
| ORM / Query layer | <!-- e.g. Drizzle ORM --> | <!-- why --> |
| Styling | <!-- e.g. Tailwind CSS v4 --> | <!-- why --> |
| Auth | <!-- e.g. Supabase Auth --> | <!-- why --> |
| Testing | <!-- e.g. Vitest + Playwright --> | <!-- why --> |
| Hosting / Deploy | <!-- e.g. Fly.io, Vercel, AWS --> | <!-- why --> |
| CI/CD | <!-- e.g. GitHub Actions --> | <!-- why --> |

---

## 2. Coding Standards & Style

<!-- Define the rules that all code in this project must follow.
     Claude will apply these during Build and flag violations during Review. -->

### Linting & Formatting

<!-- Specify your linter/formatter and the configuration file location.
     Example:
       - Linter: ESLint with config at .eslintrc.json
       - Formatter: Prettier with config at .prettierrc
       - Pre-commit: lint-staged via .lintstagedrc
-->

- Linter: <!-- tool + config file path -->
- Formatter: <!-- tool + config file path -->
- Pre-commit hook: <!-- lint-staged / husky / none -->

### Naming Conventions

<!-- Fill in your agreed conventions. Examples shown.
     Delete rows that don't apply to your stack. -->

| Construct | Convention | Example |
|-----------|-----------|---------|
| Files (components) | <!-- e.g. PascalCase --> | <!-- UserCard.tsx --> |
| Files (utilities) | <!-- e.g. kebab-case --> | <!-- format-date.ts --> |
| Variables / functions | <!-- e.g. camelCase --> | <!-- getUserById --> |
| Constants | <!-- e.g. SCREAMING_SNAKE_CASE --> | <!-- MAX_RETRY_COUNT --> |
| Types / Interfaces | <!-- e.g. PascalCase, no I-prefix --> | <!-- UserProfile --> |
| Database tables | <!-- e.g. snake_case, plural --> | <!-- user_profiles --> |
| Database columns | <!-- e.g. snake_case --> | <!-- created_at --> |
| CSS classes | <!-- e.g. Tailwind utilities only --> | <!-- n/a --> |
| Environment variables | <!-- e.g. SCREAMING_SNAKE_CASE --> | <!-- DATABASE_URL --> |
| Branch names | <!-- e.g. feature/[slug] --> | <!-- feature/user-auth --> |

### General Rules

<!-- Add any project-wide coding rules here. Examples:
       - No `any` in TypeScript without explicit justification comment
       - All functions must have JSDoc comments
       - Max file length: 300 lines
       - No magic numbers — use named constants
       - No commented-out code in committed files
       - All async operations must have error handling
-->

-
-
-

---

## 3. Architectural Constraints

<!-- Document design decisions that shape the system structure.
     These are guardrails — not just preferences. Claude will flag deviations.
     Examples:
       - All business logic lives in service layer, never in route handlers or components
       - Database access only through the repository pattern — no raw SQL in services
       - No shared mutable state between modules
       - All external API calls must go through a dedicated adapter/client module
       - Feature flags managed via environment variables only
       - No circular dependencies between modules
-->

-
-
-

---

## 4. Security & Compliance Requirements

<!-- List security standards and compliance obligations.
     Phantom will verify these during every Review sub-phase.
     Examples:
       - OWASP Top 10 must be checked before any feature ships
       - All user input must be validated and sanitized at the service boundary
       - Secrets must never appear in source code or logs — use environment variables
       - All API endpoints require authentication unless explicitly marked public
       - PII must not be written to application logs
       - HTTPS enforced in all environments
       - Dependencies audited via `npm audit` before each release
       - GDPR: user data deletion must be supported
-->

-
-
-

---

## 5. Definition of Done

<!-- A task is not complete until ALL of the following are true.
     PDLC checks this list before allowing Construction to transition to Operation.
     Adjust to match your team's standards. -->

- [ ] Code is committed on the feature branch with a conventional commit message
- [ ] All unit tests pass (`npm test` or equivalent)
- [ ] All integration tests pass
- [ ] Code has been reviewed by Neo, Echo, Phantom, and Jarvis
- [ ] Review file (`docs/pdlc/reviews/REVIEW_*.md`) exists and is human-approved
- [ ] No `console.log` / debug statements left in committed code
- [ ] All public functions/methods have inline documentation
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Linter passes with zero errors
- [ ] PR description is complete and references the Beads task ID
- [ ] Episode file drafted and human-approved
<!-- Add project-specific requirements below: -->
-
-

---

## 6. Git Workflow Rules

<!-- Define your branch strategy and commit message format.
     PDLC enforces these during Build and Ship sub-phases. -->

### Branch Strategy

<!-- Choose one and delete the others, or define your own: -->

- **Feature branch model (default)**: One branch per feature (`feature/[feature-name]`), single PR to `main` at end of Construction.
- <!-- Alternative: Gitflow (main + develop + feature branches) -->
- <!-- Alternative: Trunk-based (short-lived branches, merge to main daily) -->

**Default branch:** `main`
**Feature branch naming:** `feature/[kebab-case-feature-name]`
**Merge strategy:** Merge commit (preserves full branch history)

### Commit Message Format

<!-- PDLC defaults to Conventional Commits. Change only if your team prefers otherwise. -->

Format: `<type>(<scope>): <description>`

Types: `feat` | `fix` | `chore` | `docs` | `test` | `refactor` | `perf` | `ci`

Examples:
- `feat(auth): add OAuth2 login with GitHub`
- `fix(api): handle null user ID in profile endpoint`
- `test(billing): add integration tests for Stripe webhook`

**Breaking changes:** append `!` after type, e.g. `feat(api)!: rename /users endpoint to /accounts`

### Protected Branches

<!-- List branches that require PR review before merging.
     Force-pushing to these is a Tier 1 hard block. -->

- `main` — requires PR + human approval
<!-- - `develop` — requires PR + human approval -->

---

## 7. Test Gates

<!-- Check the boxes for test layers that MUST pass before Operation phase can begin.
     Unchecked layers are still run and reported — they just don't hard-block the ship.
     You can also skip a layer entirely via human instruction during Test sub-phase
     (this is a Tier 3 logged warning). -->

- [x] Unit tests
- [x] Integration tests
- [ ] E2E tests (real Chromium)
- [ ] Performance / load tests
- [ ] Accessibility checks
- [ ] Visual regression tests

<!-- Notes on gates: e.g. "E2E gate required for all features touching auth or checkout" -->

---

## 8. Safety Guardrail Overrides

<!-- Tier 2 items that your team has deliberately downgraded to Tier 3 (logged, not blocking).
     For each override: state the item, the reason, and the date agreed.
     LEAVE THIS TABLE EMPTY unless your team has explicitly agreed to downgrade an item.

     Default Tier 2 items (do NOT move here without team agreement):
       - Any `rm -rf` or bulk delete
       - `git reset --hard`
       - Running DB migrations in production
       - Changing CONSTITUTION.md
       - Closing all open Beads tasks at once
       - Any external API call that writes/posts/sends (Slack, email, webhooks)
-->

| Tier 2 Item | Downgraded Reason | Date Agreed | Agreed By |
|-------------|-------------------|-------------|-----------|
| <!-- item --> | <!-- reason --> | <!-- YYYY-MM-DD --> | <!-- initials --> |

<!-- If no overrides, leave the table with the placeholder row above or delete the row entirely. -->

---

## 9. Additional Rules

<!-- Anything that doesn't fit the sections above. Examples:
       - Feature flags must be cleaned up within 2 sprints of full rollout
       - All database migrations must be reversible (include down migration)
       - Third-party packages require team discussion before adding
       - Max bundle size: 200kb gzipped for initial page load
       - All API responses follow the { data, error, meta } envelope format
-->

-
-
-
