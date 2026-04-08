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

### Step 9 — Trigger CI/CD (Pulse coordinates)

Pulse role: detect the CI/CD setup in this order:

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
    "docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md"
  ],
  "decisions_made": ["[e.g. 'Tagged v1.3.0', 'GitHub Actions deploy triggered', 'CHANGELOG prepended']"],
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
