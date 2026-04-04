---
name: ship
description: "Run the Operation phase (Ship → Verify → Reflect) for the current feature"
---

You are running the Operation phase. Follow every step in order. Do not skip steps.

---

## Pre-flight: Load state and context

### Step 1 — Read STATE.md

Read `docs/pdlc/memory/STATE.md` completely.

Extract:
- **Current Phase**: must be `Construction Complete — Ready for /ship`
- **Current Feature**: the `[feature-name]` slug
- **Episode file path**: look in `docs/pdlc/memory/episodes/` for a draft file matching `[NNN]_[feature-name]_[YYYY-MM-DD].md`

If the phase is not `Construction Complete — Ready for /ship`, warn the user:

> "STATE.md shows the current phase is `[phase]`, not `Construction Complete`. Running `/ship` before Construction is complete may cause issues.
>
> Continue anyway? (yes/no)"

Wait for confirmation before proceeding.

### Step 2 — Verify test gates

Read `docs/pdlc/memory/CONSTITUTION.md` §7 (Test Gates).

Read the episode file draft at `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`.

Check the Test Summary table in the episode file against the required gates in CONSTITUTION.md.

If any required gate shows `fail` in the episode file, warn the user:

> "Required test gate `[layer]` shows as failed in the episode file. Shipping with failing required gates is a Tier 3 logged warning.
>
> Proceed anyway? (yes/no)"

Log the response in STATE.md as a Tier 3 event if the user proceeds with a failed gate.

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Operation`
- **Current Sub-phase**: `Ship`
- **Last Checkpoint**: `Operation / Ship / [now ISO 8601]`

---

## SHIP

### Step 3 — Merge approval gate

Tell the user:

> "Ready to merge and deploy `[feature-name]` to main.
>
> Feature branch: `feature/[feature-name]`
> Episode: `[NNN]_[feature-name]_[YYYY-MM-DD].md`
>
> **Confirm merge commit to main?** (yes/no)"

Wait for explicit `yes`. Do not merge without it.

If the user says `no`: stop and tell them to resolve whatever is blocking before re-running `/ship`.

### Step 4 — Merge to main

Switch to main and merge:
```bash
git checkout main
git merge --no-ff feature/[feature-name] -m "feat([feature-name]): [one-line feature description from the PRD Overview section]"
```

**TIER 1 HARD BLOCK**: Do not force-push to main under any circumstances. If a merge conflict arises, stop and tell the user:

> "Merge conflict detected. Please resolve the conflicts manually, then re-run `/ship`."

### Step 5 — Generate release notes and CHANGELOG entry

Jarvis role: read all commits on the feature branch since it diverged from main:
```bash
git log main..[feature branch before merge] --oneline
```

Generate a CHANGELOG entry in Conventional Changelog format. Draft it as:

```markdown
## v[X.Y.Z] — [today's date]

### Added
- [bullet for each new feature or capability]

### Changed
- [bullet for each modified behavior]

### Fixed
- [bullet for each bug fixed, if any]

### Breaking Changes
- [only if applicable — feature or API that is not backward compatible]
```

Prepend this entry to `docs/pdlc/memory/CHANGELOG.md`.

### Step 6 — Determine semantic version

Read the current latest tag:
```bash
git describe --tags --abbrev=0
```

If no tags exist, the next version is `v0.1.0`.

Analyze the commits on the feature branch:
- Any commit message contains `BREAKING CHANGE` or a `!` after the type (e.g. `feat(api)!:`) → **major** bump
- Any commit message starts with `feat` → **minor** bump
- All commits are `fix`, `docs`, `chore`, `test`, `refactor`, `perf`, or `ci` only → **patch** bump

If the bump type is ambiguous (e.g. mix of `feat` and `fix` with no breaking changes), default to **minor**.

If you are unsure, ask the user:

> "Commits on this branch include features and fixes. Is this a **minor** release (new feature, backward-compatible) or a **patch** release (fixes only)? Type `minor` or `patch`:"

Increment the version accordingly. Example: `v1.2.3` → minor bump → `v1.3.0`.

### Step 7 — Tag the commit

```bash
git tag v[X.Y.Z] -m "[feature-name] — [one-line description from PRD Overview]"
```

### Step 8 — Push to origin

```bash
git push origin main
git push origin v[X.Y.Z]
```

**TIER 1 HARD BLOCK**: Do not use `--force` on `git push origin main`. If the push is rejected (non-fast-forward), stop and tell the user:

> "Push rejected — main has diverged. Please pull and resolve manually:
> `git pull --rebase origin main`
> Then re-run `/ship`."

Do not attempt to force-push.

### Step 9 — Trigger CI/CD (Pulse coordinates)

Pulse role: detect the CI/CD setup in this order:

1. Check for `npm run deploy` in `package.json` → if found, run `npm run deploy`
2. Check for `make deploy` in `Makefile` → if found, run `make deploy`
3. Check for `.github/workflows/` → if deploy workflows exist, trigger via:
   ```bash
   gh workflow run [workflow-filename] --ref main
   ```
   (requires GitHub CLI `gh` to be authenticated)
4. If none of the above are found, tell the user:
   > "No CI/CD deployment command detected. Please trigger your deployment manually and confirm when the deployment is complete."
   > Wait for user confirmation before proceeding to Verify.

Update `docs/pdlc/memory/STATE.md`:
- **Current Sub-phase**: `Verify`
- **Last Checkpoint**: `Operation / Verify / [now ISO 8601]`

---

## VERIFY

### Step 10 — Get the deployment URL

Check `docs/pdlc/memory/CONSTITUTION.md` for a deployment URL (look in §1 Hosting/Deploy row or §9 Additional Rules).

If not found, ask the user:

> "What is the URL of the deployed environment? (e.g. `https://your-app.fly.dev`)"

Store as `[deploy-url]`.

### Step 11 — Run smoke tests

Run basic health checks against `[deploy-url]`:

**11a. HTTP health check:**
Fetch the root URL and key routes. Check for HTTP 200 responses. Run:
```bash
curl -s -o /dev/null -w "%{http_code}" [deploy-url]
curl -s -o /dev/null -w "%{http_code}" [deploy-url]/[key-route-from-PRD]
```

Report the results. Flag any non-200 response.

**11b. Critical user journey:**
Read the PRD at `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`. Identify the primary acceptance criterion (AC-1).

Describe the manual steps the user should take to verify the primary user journey works in production. Example:

> "Please verify AC-1 manually: [Given/When/Then steps from the BDD user story]. Confirm the behavior matches the acceptance criterion."

Wait for the user to perform the check and report back.

**11c. Auth flow (if applicable):**
If the feature includes authentication (check PRD and design docs for `auth`, `login`, `OAuth`), ask the user to verify the auth flow works end-to-end in the deployed environment.

### Step 12 — Smoke test approval gate

Present a summary of smoke test results:

> "Smoke test results:
>
> - HTTP health check: [pass/fail — [N] routes checked]
> - Primary user journey (AC-1): [pass/fail — user-reported]
> - Auth flow: [pass/fail / N/A]
>
> **Manual sign-off required. Does the deployment look correct?** (yes/no)"

Wait for explicit `yes`. If the user says `no`: help them diagnose the issue. Do not proceed to Reflect until the user confirms the deployment is good.

Update `docs/pdlc/memory/STATE.md`:
- **Current Sub-phase**: `Reflect`
- **Last Checkpoint**: `Operation / Reflect / [now ISO 8601]`

---

## REFLECT

### Step 13 — Generate the retro

Following the gstack-style retrospective approach, generate a Reflect Notes section for the episode file. Cover:

**Per-agent contributions** (list which agents participated and what they contributed):
- Neo: [architectural work done]
- Echo: [test strategy and coverage work]
- Phantom: [security checks performed, issues found/resolved]
- Jarvis: [docs written, CHANGELOG authored]
- [Auto-selected agents]: [their contributions]

**What went well:**
Analyze the Construction phase: tasks completed without issue, tests that passed cleanly, design decisions that worked out, agent collaboration that was effective. List 3–5 specific observations.

**What broke or slowed us down:**
Review the STATE.md Phase History and episode file: how many auto-fix attempts were needed, which tests failed initially, which review findings required fixing. List 2–4 specific observations.

**What to improve next time:**
Based on the above, list 2–3 actionable improvements for the next feature cycle.

**Metrics snapshot:**
- Cycle time: calculate from first Inception entry in Phase History to today's date
- Test pass rate: calculate from the episode file Test Summary (total passed / total run × 100%)
- Tasks completed: count from Beads
- Review findings: count from the review file (Important / Recommended / Advisory)

### Step 14 — Update the episode file

Open `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`.

Append the Reflect Notes section with all content from Step 13.

Update:
- **Date delivered**: today's date (the actual merge date)
- **Status**: keep as `Draft` — it becomes `Approved` after human sign-off below
- **Links → PR**: fill in the PR link if one was created (check `gh pr list` or ask the user)

### Step 15 — Episode file approval gate

Tell the user:

> "Episode file is complete at `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`
>
> Please review the full episode file — the What Was Built summary, decisions, test results, tech debt, and retro notes.
>
> **Approve to commit this episode to the repository?** (approve / request changes)"

Wait for explicit approval. If the user requests changes: make them, re-save the file, and re-present.

When approved: update the **Approval** section in the episode file with the approver's name and today's date. Set **Status** to `Approved`.

### Step 16 — Commit the episode and update memory files

After approval, run these commands sequentially:

**16a. Update the episodes index:**

Append a row to `docs/pdlc/memory/episodes/index.md`:
```
| [NNN] | [Feature Name] | [today's date] | [[NNN]_[feature-name]_[date].md]([NNN]_[feature-name]_[date].md) | [#PR or —] | Shipped |
```

**16b. Update OVERVIEW.md:**

Read `docs/pdlc/memory/OVERVIEW.md`. Update:
- **Active Functionality**: add a bullet for the new capability shipped (e.g. "Users can now [feature description]")
- **Shipped Features table**: add a row for this feature with episode and PR links
- **Architecture Summary**: update if this feature changed the architecture meaningfully (new service, new DB table, new integration)
- **Known Tech Debt**: append any tech debt items recorded in the episode file
- **Last updated**: today's date

**16c. Commit everything:**

```bash
git add docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md
git add docs/pdlc/memory/episodes/index.md
git add docs/pdlc/memory/OVERVIEW.md
git add docs/pdlc/memory/CHANGELOG.md
git commit -m "docs(pdlc): add episode [NNN] — [feature-name]"
git push origin main
```

**TIER 2 action**: this is a direct push to main (not a PR). Since this is a docs-only commit (episode file), it is acceptable — but confirm with the user if their workflow requires a PR even for docs.

### Step 17 — Final STATE.md update

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Idle — Ready for next /brainstorm`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Operation / Complete / [now ISO 8601]`

Append to Phase History:
```
| [now] | operation_complete | Idle | — | none |
```

### Step 18 — Print completion message

> "[feature-name] shipped. Episode [NNN] committed.
>
> - Version: v[X.Y.Z]
> - Episode: docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md
> - CHANGELOG updated: docs/pdlc/memory/CHANGELOG.md
> - OVERVIEW updated: docs/pdlc/memory/OVERVIEW.md
>
> Ready for the next feature — run `/brainstorm <next-feature>` to start."

---

## Rules

- Never force-push to `main`. This is a Tier 1 hard block with no override.
- Never push PR comments or tags without human approval at the ship gate (Step 3).
- Never proceed to Reflect without human sign-off on smoke tests (Step 12).
- Never commit the episode file without human approval (Step 15).
- If the deployment URL is unknown, ask — do not guess or skip smoke tests.
- The merge strategy is always `--no-ff` (merge commit). Do not squash or rebase feature branches.
- If any step fails due to an external service (GitHub, CI, deploy target), describe the failure clearly and give the user the manual steps to resolve it. Do not silently skip.
