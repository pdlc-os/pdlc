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

If the user says `no`: stop and tell them to resolve whatever is blocking before re-running `/pdlc ship`.

### Step 4 — Merge to main

The merge, tag, and push are handled by a single script in Steps 7-8. First, generate the release notes and determine the version.

**TIER 1 HARD BLOCK**: Do not force-push to main under any circumstances. If a merge conflict arises, stop and tell the user:

> "Merge conflict detected. Please resolve the conflicts manually, then re-run `/pdlc ship`."

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

Apply the writing principles from `skills/writing-clearly-and-concisely/SKILL.md` to the CHANGELOG entry: active voice, concrete language, no filler. Each bullet should tell the reader exactly what changed and why it matters.

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

### Steps 7-8 — Merge, tag, and push

Run the ship-merge script which handles checkout, merge, tag, and push in a single operation:

```bash
bash scripts/ship-merge.sh [feature-name] v[X.Y.Z] "[one-line description from PRD Overview]"
```

**TIER 1 HARD BLOCK**: The script does not force-push. If the merge fails (conflict) or push is rejected (non-fast-forward), the script exits with an error. Tell the user:

> "Merge or push failed. Please resolve manually, then re-run `/pdlc ship`."

Do not attempt to force-push.

### Step 9 — Deploy (Pulse coordinates)

Pulse leads the deploy sub-phase: **lint the codebase first**, then ask the user about custom deployment artifacts, reconcile them with the default pipeline if provided, trigger the deploy, and record the outcome.

#### Step 9.0 — Lint the codebase (Pulse's first action on takeover)

Before any deployment-artifact prompt or pipeline work, Pulse runs a lint pass on the codebase to surface formatting, style, and static-analysis issues that should not ship to production. Pulse follows the instructions in `skills/ship/steps/fix-lint.md` to determine which linters to run, how to interpret findings, and what to fix vs. defer. Where the extension and this skill conflict on the same point, **the extension takes precedence**.

If `skills/ship/steps/fix-lint.md` does not exist, skip this sub-step with a one-line note to the user — *"Lint extension not configured — skipping. Add `skills/ship/steps/fix-lint.md` to enable a deploy-time lint pass."* — and proceed directly to Step 9.1.

When the lint pass completes (or once Pulse and the user have agreed which findings to defer), proceed to Step 9.1.

#### Step 9.1 — Custom deployment artifact prompt

Before the default CI/CD detection runs, Pulse asks the user whether they have a custom deployment, CI/CD, or build script to use for this deploy:

> **Pulse:** "Before I trigger the deploy, do you have a custom deployment, CI/CD, or build script you'd like me to use or layer into the pipeline for this feature?
>
> - Paste the script inline, or give me file paths (one per line)
> - It can be a full deploy script, a pre/post-deploy hook, a custom workflow, an IaC file, or a Makefile target — whatever you want run
> - Say `no` to use the default pipeline (auto-detected)
>
> Your preferences take precedence. If you provide an artifact, I'll compose it with PDLC's defaults, convene a short deployment review with the team to verify it from every angle (architecture, security, tests, ops, UX, docs), then present the consolidated plan for your approval before running anything."

Wait for the user's response.

**If the user says `no`** (or any equivalent): skip to **Step 9.3 — Detect CI/CD and trigger**.

**If the user provides one or more artifacts**: proceed to Step 9.2.

#### Step 9.2 — Compose plan and run Deployment Review

1. **Read every artifact in full.** Do not abbreviate. If the user pasted a shell script inline, save it to a temp file for agent review. If file paths were given, read each.

2. **Identify target environment(s).** If the user specified environments (e.g., "use this for prod only"), use those. If they didn't:
   - If `docs/pdlc/memory/DEPLOYMENTS.md` has a single registered environment, assume that one.
   - If multiple environments are registered, ask once: "Which environment(s) should these artifacts apply to? Your options: [list env names from DEPLOYMENTS.md]."

3. **Draft a composed plan.** Pulse produces a structured draft merging:
   - What the user's artifact(s) do
   - What PDLC's default pipeline for this deploy would do (semver tag, smoke tests, DEPLOYMENTS.md recording, episode drafting, rollback tag)
   - Where they overlap, complement, or conflict

4. **Convene the Deployment Review Party.** Read `skills/ship/steps/custom-deploy-review.md` and execute it completely. The full team (9 built-in agents + any matching custom agents) assesses the composed plan. Pulse leads and synthesizes a consolidated plan at the end. MOM is written to `docs/pdlc/mom/MOM_deployment_[feature-name]_[YYYY-MM-DD].md`.

5. **Present the consolidated plan to the user** (the review protocol does this — it returns here with the user's choice: `proceed`, `proceed as-is`, `modify`, or `abort`).

**If the user chose `abort`:** stop the deploy. Update STATE.md with a Phase History row: `| [now] | ship_aborted | Operation | Ship | [feature-name] |`. Tell the user: "Deploy aborted. Feature branch and merge commit remain; re-run `/pdlc ship` when ready."

**If the user chose `proceed`, `proceed as-is`, or `modify`:** the consolidated plan (with whatever modifications the user accepted) becomes the deploy plan for Step 9.3.

**Tier 1 check:** if the review identified Critical findings that constitute Tier 1 hard blocks (hardcoded secrets, exposed credentials, missing smoke-test gate when one is mandated by CONSTITUTION.md §7), the deploy must not proceed unless the user has explicitly run `/pdlc override`. The review protocol surfaces this; honor it here.

#### Step 9.3 — Detect CI/CD and trigger

If the user provided a custom artifact in Step 9.1 and the consolidated plan from Step 9.2 specifies the invocation, **use that invocation**. Otherwise, detect the CI/CD setup in this order:

1. Check for `npm run deploy` in `package.json` → if found, run `npm run deploy`
2. Check for `make deploy` in `Makefile` → if found, run `make deploy`
3. Check for `.github/workflows/` → if deploy workflows exist, trigger via:
   ```bash
   gh workflow run [workflow-filename] --ref main
   ```
   (requires GitHub CLI `gh` to be authenticated)
4. If none of the above are found, offer to scaffold a pipeline:

   > "No CI/CD pipeline detected. Would you like me to set one up?
   >
   > - **GitHub Actions** — I'll create a `.github/workflows/deploy.yml` tailored to your tech stack from CONSTITUTION.md
   > - **npm deploy script** — I'll add a `deploy` script to `package.json` that you can customize
   > - **Skip** — deploy manually this time; I'll ask again next ship"

   **If the user chooses GitHub Actions:**
   Read `docs/pdlc/memory/CONSTITUTION.md` for the tech stack. Generate a deployment workflow file at `.github/workflows/deploy.yml` that:
   - Triggers on push to `main`
   - Installs dependencies for the declared stack
   - Runs the Constitution's required test gates
   - Deploys (placeholder step the user customizes for their hosting provider)
   
   Commit the workflow file: `git add .github/workflows/deploy.yml && git commit -m "ci: add deployment workflow"`
   Push: `git push origin main`
   Then trigger: `gh workflow run deploy.yml --ref main`

   **If the user chooses npm deploy script:**
   Add a `deploy` script to `package.json` with a placeholder command. Tell the user to customize it for their deployment target.
   Run: `npm run deploy`

   **If the user chooses Skip:**
   > "No problem. Please trigger your deployment manually and confirm when it's complete."
   Wait for user confirmation before proceeding to Verify.

#### Step 9.4 — Record the deployment in DEPLOYMENTS.md (Pulse)

Open `docs/pdlc/memory/DEPLOYMENTS.md` and update it for this deploy. This is the single place where deployment memory accumulates — future sessions, teammates, and sub-agents read this to understand how the app runs.

**For a first-ever deploy to an environment** (no existing section with a matching name):
1. Clone the Environment block from the template structure.
2. Fill in: name (e.g. `production`, `staging`, `production-us-east`), Purpose, URL, Status, Deploy method/command/workflow file, Verification, Rollback, and the secrets table (names only, never values).
3. Fill in the **Tags** table. Ask the user for any tag values they want recorded — app-id, instance-id, region, cloud-provider, cloud-account-id, tenant, cost-center, compliance-scope, etc. Use kebab-case keys. Leave rows blank (or delete them) if not applicable.
4. Add an entry to the Deployment History table: today's date, version tag from Step 6, "Pulse", episode number, and any notes about this deploy (new migration step, env var added, etc.).
5. Append a row to the Change Log at the bottom of the file describing what was added.

**For a repeat deploy to an existing environment:**
1. Confirm URL, deploy method, secrets, and tags still match reality. If anything changed, update and log the change in the Change Log.
2. Append a new row to the Deployment History table for this deploy.
3. Update the `Last updated` date at the top of the file.

If any new tag key surfaces during this deploy (e.g. a new region, a new account-id), add it to the Tags table for the affected environment(s) and note it in the Change Log.

**If a custom deploy artifact was used** (Step 9.2 ran a Deployment Review): add a **Custom deploy artifact** line to the environment block (path to the user's artifact, e.g. `scripts/deploy-prod.sh`), and include a reference in the Deployment History Notes column: `"Custom artifact used — see docs/pdlc/mom/MOM_deployment_[feature]_[date].md"`. Any Tier 1 override that allowed the deploy to proceed despite Critical findings is also noted in the History row.

**Do not commit yet** — Jarvis commits DEPLOYMENTS.md alongside the episode file during Reflect.

Update `docs/pdlc/memory/STATE.md`:
- **Current Sub-phase**: `Verify`
- **Last Checkpoint**: `Operation / Verify / [now ISO 8601]`

**Write the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block with:

```json
{
  "phase_completed": "Operation / Ship",
  "next_phase": "Operation / Verify",
  "feature": "[feature-name]",
  "key_outputs": [
    "docs/pdlc/memory/CHANGELOG.md",
    "docs/pdlc/memory/DEPLOYMENTS.md",
    "docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md"
  ],
  "decisions_made": ["[e.g. 'Tagged v1.3.0', 'GitHub Actions deploy triggered', 'CHANGELOG prepended', 'DEPLOYMENTS.md recorded production-us-east']"],
  "next_action": "Run smoke tests against the deployment — read skills/ship/steps/02-verify.md",
  "pending_questions": []
}
```

Then check context usage: run `cat /tmp/pdlc-ctx-*.json 2>/dev/null | sort -t'"' -k4 -r | head -1`. If `used_pct` is **65% or above**, strongly recommend clearing:

> "**Context is at ~[X]% — strongly recommend clearing now.**
> Code is merged and deployed. Type `/clear` and the next session will resume seamlessly from Verify."

If below 65% or the bridge file doesn't exist, don't mention it.

---

Return to `SKILL.md` and proceed to **Sub-phase 2 — VERIFY**.
