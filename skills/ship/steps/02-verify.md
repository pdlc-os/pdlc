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

Return to `SKILL.md` and proceed to **Sub-phase 3 — REFLECT**.
