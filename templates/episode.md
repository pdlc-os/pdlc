# Episode [ID]: [Feature Name]
<!-- pdlc-template-version: 2.1.0 -->
<!-- Replace [ID] with the zero-padded episode number (e.g. 001) and [Feature Name] with the feature title.
     File naming convention: [ID]_[feature-slug]_[YYYY-MM-DD].md
     This file lives at: docs/pdlc/memory/episodes/[ID]_[feature-slug]_[YYYY-MM-DD].md
     Claude drafts this file at the end of Construction. Human reviews and approves before it is committed.
     After commit, PDLC updates docs/pdlc/memory/OVERVIEW.md and docs/pdlc/memory/episodes/index.md. -->

**Episode ID:** <!-- e.g. 001 -->
**Feature name:** <!-- Human-readable feature name, e.g. "User Auth — GitHub OAuth" -->
**Feature slug:** <!-- kebab-case slug used in file paths, e.g. user-auth-github-oauth -->
**Date delivered:** <!-- YYYY-MM-DD — date of merge to main -->
**Phase delivered in:** Construction
**Status:** Draft <!-- Change to "Approved" after human sign-off -->

---

## What Was Built

<!-- A paragraph (3–6 sentences) summarising what was designed, built, and shipped.
     Written by Claude; reviewed and edited by human before commit.
     Should be readable by someone coming to the codebase fresh.
     Example:
       This episode delivered GitHub OAuth login as an alternative authentication method.
       Users can now click "Sign in with GitHub" on the login page, authorize the app via
       the standard OAuth 2.0 PKCE flow, and be redirected to their dashboard — all in under
       3 seconds. New accounts are created automatically on first login; if the GitHub email
       matches an existing account the identities are linked. The implementation uses the
       existing auth session infrastructure from ep-001 and adds a new oauth_accounts join
       table to support multiple identity providers in future episodes. -->

<!-- Auto-drafted by Claude at end of Construction. Review and edit as needed. -->

---

## Links

- **PRD:** <!-- [PRD_feature-name_YYYY-MM-DD.md](../../prds/PRD_feature-name_YYYY-MM-DD.md) -->
- **PR:** <!-- [#42](https://github.com/org/repo/pull/42) -->
- **Review file:** <!-- [REVIEW_bd-a1b2_YYYY-MM-DD.md](../../reviews/REVIEW_bd-a1b2_YYYY-MM-DD.md) -->
- **Design docs:** <!-- [ARCHITECTURE.md](../../design/feature-name/ARCHITECTURE.md) | [data-model.md](../../design/feature-name/data-model.md) -->

---

## Key Decisions & Rationale

<!-- Numbered list of significant decisions made during this feature's lifecycle.
     Each entry should explain: what was decided, why, and what was rejected/considered.
     These feed into docs/pdlc/memory/DECISIONS.md (ADR log).
     Example:
       1. Used PKCE flow instead of implicit flow for OAuth — PKCE is the current best practice
          for public clients; implicit flow is deprecated in OAuth 2.1. Rejected server-side
          flow because it adds complexity without benefit at current scale.
       2. Stored OAuth access tokens encrypted at rest, not in plaintext — Phantom flagged
          plaintext storage as a Tier 1 security risk. AES-256-GCM encryption added with
          key managed via environment variable.
       3. Did not implement account unlinking in this episode — out of scope per PRD.
          Deferred to ep-004. Tech debt ticket: td-007.
-->

1.
2.
3.

---

## Files Created

<!-- List every new file added in this feature's branch that was merged.
     Format: - `path/from/project/root` — one-line description of the file's purpose
     Example:
       - `src/lib/auth/github-oauth.ts` — GitHub OAuth PKCE flow implementation
       - `src/app/api/auth/github/route.ts` — API route handler for OAuth callback
       - `src/app/api/auth/github/callback/route.ts` — redirect target after GitHub authorization
       - `db/migrations/0003_add_oauth_accounts.sql` — adds oauth_accounts table
       - `src/components/auth/GitHubLoginButton.tsx` — "Sign in with GitHub" button component
       - `tests/unit/auth/github-oauth.test.ts` — unit tests for OAuth flow helpers
       - `tests/e2e/auth/github-login.spec.ts` — E2E test for full OAuth login journey
-->

-

---

## Files Modified

<!-- List every pre-existing file changed in this feature's branch.
     Format: - `path/from/project/root` — one-line description of what changed and why
     Example:
       - `src/lib/auth/session.ts` — extended session type to include oauth_provider field
       - `src/app/(auth)/login/page.tsx` — added GitHub login button below email form
       - `src/middleware.ts` — added /auth/github/* to public routes list
       - `db/schema.ts` — added oauth_accounts table definition to Drizzle schema
       - `docs/pdlc/memory/OVERVIEW.md` — updated active functionality and shipped features
-->

-

---

## Test Summary

<!-- Filled in by Claude from the Test sub-phase results. Edit if numbers are wrong. -->

| Layer | Status | Passed | Failed | Skipped | Notes |
|-------|--------|--------|--------|---------|-------|
| Unit | <!-- pass / fail / skip --> | <!-- n --> | <!-- n --> | <!-- n --> | <!-- e.g. all core logic covered --> |
| Integration | <!-- pass / fail / skip --> | <!-- n --> | <!-- n --> | <!-- n --> | <!-- e.g. DB interactions verified --> |
| E2E | <!-- pass / fail / skip --> | <!-- n --> | <!-- n --> | <!-- n --> | <!-- e.g. full login journey via Chromium --> |
| Performance | <!-- pass / fail / skip --> | <!-- — --> | <!-- — --> | <!-- — --> | <!-- e.g. OAuth round-trip p95 = 1.2s --> |
| Accessibility | <!-- pass / fail / skip --> | <!-- — --> | <!-- — --> | <!-- — --> | <!-- e.g. WCAG 2.1 AA — 0 violations --> |
| Visual Regression | <!-- pass / fail / skip --> | <!-- — --> | <!-- — --> | <!-- — --> | <!-- e.g. login page diff approved --> |

**Constitution gates:** <!-- All required gates passed / [list any that failed and how resolved] -->

---

## Deployment Record

<!-- Filled by Pulse during Ship/Verify and quoted by Jarvis when drafting the episode.
     Captures what changed about the deployment for THIS feature so that
     DEPLOYMENTS.md evolves visibly over time.

     Leave this section as "Not applicable — no deployment changes" for features
     that ship behind a feature flag or are infrastructure-only.

     Example:
       - **Deployed to:** production (v1.3.0)
       - **CI/CD method:** GitHub Actions — `.github/workflows/deploy.yml`
       - **Config changes introduced:** added `STRIPE_WEBHOOK_SECRET` env var;
         deploy.yml gained a `db-migrate` step before the serve step
       - **New tags recorded:** none (production-us-east was already registered)
       - **Rollback tested:** yes — dry-run on staging via `rollback.yml`
       - **DEPLOYMENTS.md updated:** yes (secret list + deploy history row)
-->

- **Deployed to:** <!-- environment name(s) from DEPLOYMENTS.md, with version -->
- **CI/CD method:** <!-- e.g. GitHub Actions workflow, npm deploy script, manual -->
- **Custom deploy artifact used:** <!-- path to user's artifact if supplied during ship, e.g. scripts/deploy-prod.sh; or "no — default pipeline" -->
- **Deployment Review Party:** <!-- MOM path if convened, e.g. docs/pdlc/mom/MOM_deployment_[feature]_[date].md; or "not convened — default pipeline" -->
- **Config changes introduced:** <!-- new env vars, workflow steps, infra resources, tags -->
- **New tags recorded:** <!-- any new tag key/values added to DEPLOYMENTS.md for this env -->
- **Rollback tested:** <!-- yes / no / n/a — if yes, how was it verified -->
- **Tier 1 overrides used:** <!-- list any /pdlc override invocations during this ship, or "none" -->
- **DEPLOYMENTS.md updated:** <!-- yes / no — if no, why -->

---

## Known Tradeoffs & Tech Debt Introduced

<!-- Honest record of shortcuts taken, things deferred, or imperfections knowingly accepted.
     Each item will be tracked in docs/pdlc/memory/OVERVIEW.md under "Known Tech Debt".
     Format: - [TD-nnn] Description — why accepted — planned resolution (if known)
     Example:
       - [TD-012] Access tokens encrypted with a single app-wide key instead of per-user keys
         — accepted for v1 simplicity; move to per-user key derivation before SOC 2 audit
       - [TD-013] No rate limiting on /api/auth/github/callback — deferred until after launch;
         add before scaling past 1k users
       - [TD-014] GitHub avatar URL stored as-is (external URL) — should proxy/cache before launch
         to avoid broken images if GitHub changes URL structure
-->

<!-- None. -->

---

## Agent Team

<!-- List all agents that participated in this feature's delivery.
     Always-on agents are pre-filled. Remove any that did not participate.
     Add auto-selected agents (Bolt, Friday, Muse, Oracle, Pulse) that were activated. -->

**Always-on:**
- **Neo** (Architect) — architecture review and PRD conformance
- **Echo** (QA Engineer) — test strategy and coverage review
- **Phantom** (Security Reviewer) — OWASP and auth security review
- **Jarvis** (Tech Writer) — inline docs, API docs, episode draft

**Auto-selected for this feature:**
- <!-- **Bolt** (Backend Engineer) — API routes, business logic, DB migrations -->
- <!-- **Friday** (Frontend Engineer) — UI components, state management -->
- <!-- **Muse** (UX Designer) — interaction design, accessibility -->
- <!-- **Oracle** (PM) — requirements clarity, acceptance criteria -->
- <!-- **Pulse** (DevOps) — CI/CD, deployment, environment config -->

---

## Reflect Notes

<!-- Retro observations generated by Claude during the Reflect sub-phase.
     Covers: what went well, what broke, what to improve, and metrics snapshot.
     Auto-drafted by Claude; human edits before commit. -->

**What went well:**
<!-- Auto-drafted by Claude -->

**What broke or slowed us down:**
<!-- Auto-drafted by Claude -->

**What to improve next time:**
<!-- Auto-drafted by Claude -->

**Cycle time:** <!-- e.g. Inception to merge: 3 days -->
**Test pass rate:** <!-- e.g. 94% (48/51 tests passed; 3 skipped) -->

---

## Approval

<!-- Do not commit this episode file until a human has reviewed and approved it. -->

**Reviewed by:** <!-- Name / initials -->
**Date approved:** <!-- YYYY-MM-DD -->
**Notes:** <!-- Any edits made or observations about this episode -->
