## VERIFY

### Step 10 — Get the deployment URL

Check `docs/pdlc/memory/CONSTITUTION.md` for a deployment URL (look in §1 Hosting/Deploy row or §9 Additional Rules).

If not found, ask the user:

> "What is the URL of the deployed environment? (e.g. `https://your-app.fly.dev`)"

Store as `[deploy-url]`.

### Step 10a — Pre-deploy security check

Before verifying the deployment, run a final security scan against the merged main branch:

**Dependency audit:**
```bash
npm audit --json 2>/dev/null || true
```

If any `critical` vulnerabilities exist:
> "⚠️ Critical dependency vulnerabilities found on main:
> [list]
>
> These are now in production. **Fix immediately?** (yes/defer)"

If yes: run `npm audit fix`, commit, push, and re-trigger deployment.
If defer: log as Tier 1 event in STATE.md (critical vulnerability shipped to production).

**Secret scan on main:**
Quick scan of the full codebase on main for hardcoded secrets (same patterns as init Step 1g and test Layer 7b). If secrets are found that weren't caught earlier:
> "⚠️ Secrets detected on main branch — these are now in production:
> [list]
>
> Rotate these credentials immediately and move them to environment variables."

**Security headers check (if deploy URL is available):**
```bash
curl -sI [deploy-url] | grep -iE "strict-transport|content-security|x-frame|x-content-type"
```

Report which security headers are present and which are missing. This is INFO-level — not a blocker, but useful for Phantom's awareness.

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

**Write the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block with:

```json
{
  "phase_completed": "Operation / Verify",
  "next_phase": "Operation / Reflect",
  "feature": "[feature-name]",
  "key_outputs": [
    "docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md",
    "docs/pdlc/memory/CHANGELOG.md"
  ],
  "decisions_made": ["[e.g. 'Smoke tests passed', 'No critical vulnerabilities', 'Deployment verified at [url]']"],
  "next_action": "Generate the retrospective — read skills/ship/steps/03-reflect.md",
  "pending_questions": []
}
```

Then check context usage: run `cat /tmp/pdlc-ctx-*.json 2>/dev/null | sort -t'"' -k4 -r | head -1`. If `used_pct` is **65% or above**, strongly recommend clearing:

> "**Context is at ~[X]% — strongly recommend clearing now.**
> Deployment is verified. Type `/clear` and the next session will resume seamlessly from Reflect."

If below 65% or the bridge file doesn't exist, don't mention it.

---

Return to `SKILL.md` and proceed to **Sub-phase 3 — REFLECT**.
