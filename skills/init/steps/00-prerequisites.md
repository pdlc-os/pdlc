# Prerequisites and Tooling
## Step 1

> **Model override:** Steps 1a–1e (all installation and setup tasks) use the **Haiku** model for speed and cost efficiency. These are straightforward CLI operations that don't require complex reasoning. After Step 1e completes, revert to the lead agent's assigned model (Oracle = Opus) for the rest of initialization.

---

## 1a. Verify a git repository exists.

Run: `git status`

If the command succeeds, skip to Step 1b.

If the command returns a "not a git repository" error, offer to initialize:

> "No git repository found in this directory. Want me to set one up? (Y/n)"

**If the user accepts:**

1. Run `git init`
2. Ask the user: "Any additional paths to exclude from git? (Enter paths separated by commas, or say **skip** to continue with defaults)"
3. Set up .gitignore with the required PDLC entries plus any user-provided paths:
   ```bash
   bash scripts/setup-gitignore.sh [extra paths as separate arguments, if any]
   ```
   For example, if the user said `tmp/, dist/`: `bash scripts/setup-gitignore.sh "tmp/" "dist/"`
   If no extra paths: `bash scripts/setup-gitignore.sh`
4. Stage and commit:
   ```bash
   git add .gitignore
   git commit -m "chore: initial commit with .gitignore"
   ```

**If the user declines:** stop and tell them to set up git manually before re-running `/pdlc init`.

Do not proceed until `git status` succeeds.

---

## 1b. Verify GitHub remote and connectivity.

Run: `git remote -v`

**If a remote named `origin` exists:**

Test connectivity:
```bash
gh auth status
```

If `gh` is authenticated, run a quick push test:
```bash
git push --dry-run origin HEAD 2>&1
```

If the dry-run succeeds:
> "GitHub remote verified: `[remote URL]` ✓"

If the dry-run fails (permissions, SSH keys, etc.), inform the user and offer to troubleshoot:
> "GitHub remote exists (`[remote URL]`) but push failed:
> `[error message]`
>
> Common causes:
> - SSH key not added to GitHub → run `ssh -T git@github.com` to test
> - Token expired → run `gh auth login` to re-authenticate
> - Repository doesn't exist on GitHub yet → see below to create it
>
> Want me to help troubleshoot? (yes/no)"

If yes, walk through the relevant fix based on the error.

**If no remote exists:**

First, detect the current GitHub state before prompting:

1. Check if `gh` CLI is installed: `gh --version`
2. If installed, check auth: `gh auth status`

**If `gh` is installed and authenticated:**

Parse the output of `gh auth status` to extract the authenticated account and hostname (github.com or GHE). Then:

> "No GitHub remote, but you're already authenticated as **[username]** on **[hostname]** ✓
>
> I'll create a repo and configure the remote. Defaults:
> - **Repo name:** `[current directory name]`
> - **Visibility:** private
> - **Account:** [username]
>
> Proceed with these defaults? (yes / change name / change visibility / skip)"

**If the user confirms** (yes, y, looks good):
→ Create the repo with defaults:
```bash
gh repo create [current-directory-name] --private --source=. --remote=origin --push
```

**If the user wants to change** (name or visibility):
→ Ask only for the specific thing they want to change, then create.

**If the user says skip:**
→ Skip GitHub setup (see below).

**If `gh` is installed but NOT authenticated:**

> "GitHub CLI is installed but not authenticated. Want me to set up GitHub for this project?
>
> - **Yes** — I'll walk you through login, then create the repo
> - **Skip** — set up GitHub later"

If yes: tell the user to run `! gh auth login` (interactive). Wait for confirmation, verify with `gh auth status`, then proceed to repo creation with defaults as above.

**If `gh` is NOT installed:**

> "No GitHub remote configured and GitHub CLI (`gh`) is not installed. Would you like to set up GitHub?
>
> - **GitHub.com** — I'll install `gh` (via Homebrew), authenticate, and create the repo
> - **GitHub Enterprise** — provide your GHE hostname and I'll configure it
> - **Skip** — set up GitHub later (PR creation during `/pdlc ship` requires a GitHub remote)"

If the user chooses GitHub.com or GitHub Enterprise: note that `gh` needs installing and proceed to Step 1c — Homebrew will be verified first, then `gh` installed via brew. After install, run `gh auth status`. If not authenticated, tell the user to run `! gh auth login`. Then proceed to repo creation with defaults as above.

For GitHub Enterprise, tell the user: `! gh auth login --hostname [their-ghe-hostname]`

**Repo creation (all paths converge here):**

```bash
gh repo create [repo-name] --[public|private] --source=. --remote=origin --push
```

Verify:
```bash
git remote -v
git push --dry-run origin HEAD
```

> "GitHub configured and verified: `[remote URL]` ✓"

**If the user chooses Skip (from any path):**

> "Skipping GitHub setup. You can configure it later — run `gh repo create` or add a remote manually. Note: PR creation during `/pdlc ship` requires a GitHub remote."

Proceed to the next step regardless — GitHub is recommended but not strictly required for init.

---

## 1c. Check Homebrew, Dolt, and Beads install status.

Run the dependency check script:
```bash
bash scripts/check-deps.sh
```

Parse the JSON output. For each tool, report its status:
- If the value is not `"missing"`: `"[Tool]: ✓ [version]"`
- If `brew` is `"missing"`: prompt to install Homebrew (tell user to run `! /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`). On Linux, Homebrew is optional — Dolt and gh can be installed via their official install scripts instead.

  **After Homebrew installation completes**, `brew` is not yet on the PATH for the current session. Source the brew shellenv before continuing:
  ```bash
  # macOS (Apple Silicon)
  eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null \
    || eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null \
    || true
  # Linux
  eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" 2>/dev/null || true
  ```
  Verify with `command -v brew`. If still not found, ask the user to confirm the Homebrew install location and source it manually.
- If `dolt` is `"missing"`: prompt to install (`brew install dolt` on macOS, or `sudo bash -c 'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash'` on Linux)
- If `bd` is `"missing"`: offer both installation methods:

  > "Beads (`bd`) is not installed. How would you like to install it?
  >
  > - **A — npm registry** (default) — `npm install -g @beads/bd`
  > - **B — Build from source** — clone from GitHub, build locally, and link (use this if npm registry access is blocked)"

  **If the user chooses A** (or accepts the default):
  ```bash
  npm install -g @beads/bd
  ```

  If the npm install fails (registry unreachable, 404, ETIMEOUT, EAI_AGAIN, or any network/registry error), **automatically fall back to option B** without asking again:

  > "npm registry install failed (`[error summary]`). Falling back to building from source..."

  **If the user chooses B** (or automatic fallback from A):
  ```bash
  git clone https://github.com/gastownhall/beads.git /tmp/beads-src
  cd /tmp/beads-src
  npm install
  npm run build
  npm pack
  npm install -g ./beads-bd-*.tgz
  cd -
  ```

  After either installation method, verify `bd` is on the PATH:
  ```bash
  command -v bd
  ```
  If not found, the global npm bin directory may not be on the PATH. Detect and add it:
  ```bash
  NPM_BIN="$(npm prefix -g)/bin"
  export PATH="$NPM_BIN:$PATH"
  ```
  Verify again with `command -v bd`. If still not found, tell the user:
  > "Beads installed but `bd` is not on your PATH. Your global npm bin directory is `[NPM_BIN]`. Add it to your shell profile (`export PATH=\"[NPM_BIN]:$PATH\"` in `~/.zshrc` or `~/.bashrc`) and restart your terminal, or continue — PDLC will use the full path for this session."
- If `gh` was flagged as missing in Step 1b and Homebrew is now available: `brew install gh`

Check the `beads_db` field:
- `"healthy"`: `"Beads database: ✓ healthy"`
- `"unhealthy"`: the database exists but has issues — Step 7 will repair it automatically
- `"not-initialized"`: normal for first-time init — Step 7 will create it
- `"none"`: `bd` is not installed, so no database check was possible

After all tools are resolved (installed or user declined), re-run `bash scripts/check-deps.sh` to confirm final state.

If any required tool (`dolt`, `bd`) is still missing after the user declined installation, warn them that PDLC cannot proceed without it.

---

## 1c-ii. Verify Agent Teams mode is enabled.

PDLC's installer (`npx @pdlc-os/pdlc`) automatically enables Agent Teams by adding `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` to the `env` block in the Claude Code settings file. This step verifies it's present — it should be unless the user modified their settings after install.

Check `.claude/settings.local.json` (project-local) and `~/.claude/settings.json` (global). Look for `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` inside the `env` block.

**If the env var is set to `"1"` in either file:**
> "Agent Teams: ✓ enabled"

**If it is missing or set to `"0"` (unexpected — may have been removed manually):**

> "Agent Teams isn't enabled — PDLC normally sets this up during install. It gives each agent its own context window so multi-agent meetings don't consume your main context.
>
> Re-enable Agent Teams now? (Y/n)"

**If the user accepts:**
Add `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` to the `env` block in `.claude/settings.local.json` (create the file and/or the `env` key if they don't exist). Do not overwrite other existing keys in the file.

> "Agent Teams: ✓ re-enabled"

**If the user declines:**
> "Agent Teams not enabled. PDLC will fall back to Subagent mode for all multi-agent meetings — agents will report to a primary agent instead of collaborating directly. You can enable it later by adding `\"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS\": \"1\"` to the `env` block in `.claude/settings.local.json`."

Record the user's choice: if declined, set `Party Mode` to `subagents` in STATE.md once it's created (Step 5c). This ensures the orchestrator uses Subagent mode throughout.

---

## 1d. Detect CI/CD pipeline.

Check for an existing CI/CD setup in this order:

1. `package.json` → does it have a `deploy` script? (`npm run deploy`)
2. `Makefile` → does it have a `deploy` target? (`make deploy`)
3. `.github/workflows/` → do any workflow files exist?
4. Other CI configs: `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/config.yml`, `bitbucket-pipelines.yml`

**If any CI/CD is found:**
> "CI/CD: ✓ detected ([what was found — e.g., 'GitHub Actions workflow', 'npm deploy script'])"

**If no CI/CD is found:**
> "CI/CD: not detected. That's fine for now — when you get to `/pdlc ship`, Pulse (DevOps) will help you set up a deployment pipeline. You can also set one up manually at any time."

This is informational only — no CI/CD is not a blocker for init. The finding is noted so that `/pdlc ship` Step 9 knows to offer scaffolding instead of just saying "deploy manually."

---

## 1e. Baseline security scan.

Run a baseline security audit to surface existing vulnerabilities before any features are built.

**Dependency audit:**
```bash
npm audit --json 2>/dev/null || true
```

If `npm audit` returns vulnerabilities, summarize them:
> "Baseline security scan found [N] vulnerabilities ([critical]/[high]/[moderate]/[low]).
>
> These are pre-existing in your dependencies — not introduced by PDLC. You can fix them now with `npm audit fix` or address them later."

If clean:
> "Dependency audit: ✓ no known vulnerabilities"

**Secret scan:**
Scan the codebase for potential hardcoded secrets. Check for patterns:
- API keys: strings matching `[A-Za-z0-9]{20,}` in assignment contexts near variables named `key`, `token`, `secret`, `password`, `api_key`
- `.env` files committed to git: `git ls-files | grep -i '\.env'`
- Common secret patterns: AWS keys (`AKIA...`), GitHub tokens (`ghp_...`), Stripe keys (`sk_live_...`)

If secrets found:
> "Potential secrets detected in the codebase:
> [list of files and patterns found]
>
> These should be moved to environment variables and added to `.gitignore`."

If clean:
> "Secret scan: ✓ no hardcoded secrets detected"

This is a baseline — Phantom will do deeper security reviews during Construction, and security scans run again before every ship.

> **End of model override.** Steps 1a–1e are complete. From this point forward, use Oracle's assigned model (Opus) for all remaining initialization steps.

---

**You must immediately return to `SKILL.md` and continue with the Initialization Flow.** Do not stop, do not wait for user input, and do not end your turn here. The prerequisites are complete — proceed to Steps 2–3 (Setup) without pausing.
