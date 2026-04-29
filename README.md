# PDLC — Product Development Lifecycle

A Claude Code plugin that guides small startup-style teams (2-5 engineers) through the full arc of feature development — from raw idea to shipped, production feature — using structured phases, a named specialist agent team, persistent memory, and safety guardrails.

PDLC brings together TDD discipline, systematic debugging, a visual brainstorming companion, specialist agent roles, a sprint workflow with real browser automation, context-rot prevention, spec-driven execution, file-based persistent memory, adversarial review, edge case analysis, divergent ideation, multi-agent party mode, what-if analysis, roadmap pivots, and more — in a single integrated lifecycle.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Why PDLC?](#why-pdlc)
4. [Documentation](#documentation)
5. [PDLC-OS Marketplace](#pdlc-os-marketplace)
6. [Prerequisites](#prerequisites)
7. [License](#license)

---

## Installation

PDLC can be installed three ways. Pick the first one your network allows — they all end at the same place: PDLC + the `superclaude` shortcut on your PATH and hooks registered with Claude Code. Project prerequisites like Beads and Dolt are installed later when you run `/setup` inside Claude Code, so the tool install itself stays fast and network-friendly.

### Option 1 — From npmjs (recommended for most users)

If your network can reach npmjs.com, this is the simplest path.

**Global** (one install, used across all projects):

```bash
npm install -g @pdlc-os/pdlc
```

**Local** (per-repo dev dependency — for teams that want every developer to install PDLC the same way via the project's `package.json`):

```bash
cd your-repo
npm install --save-dev @pdlc-os/pdlc
```

In either case, the postinstall scaffolds Claude Code settings and registers hooks. Project prerequisites (Beads, Dolt) are installed when you run `/setup` from inside any Claude Code session — they aren't part of this install. To re-run the interactive tool setup later, use `npx @pdlc-os/pdlc install` (add `--local` for the local variant).

### Option 2 — From GitHub via npm (corporate-friendly fallback)

If npmjs.com is blocked but `npm install -g github:user/repo` still works (most corporate networks fall here):

```bash
npm install -g github:pdlc-os/pdlc
```

Same setup as Option 1, just sourced from GitHub instead of the npm registry.

### Option 3 — From a local clone (fully air-gapped, GitHub HTTPS only)

If both above are blocked but you can clone GitHub repos over HTTPS, clone PDLC and run the installer:

```bash
git clone https://github.com/pdlc-os/pdlc.git ~/.pdlc && bash ~/.pdlc/install.sh
```

The installer creates `~/.local/bin/pdlc` and `~/.local/bin/superclaude` symlinks pointing at the clone, then runs the same Claude Code setup as Options 1 and 2 (settings, hooks, slash commands). Beads and Dolt are installed when you run `/setup` inside Claude Code afterward.

After install, **upgrade with `pdlc upgrade`** — no need to re-run the one-liner. `pdlc upgrade` runs `git pull` inside the clone and re-applies the setup. Flags: `--check` (dry-run), `--force` (discard local changes), `--to vX.Y.Z` (pin to a specific tag), `--unpin` (clear pin).

You can pick any clone location; `~/.pdlc/` is just the convention (similar to `~/.nvm/` or `~/.cargo/`). To install elsewhere, clone wherever you like and run `bash <clone-path>/install.sh`. PDLC stays out of any project's git tree because the clone lives in your home directory, not inside your app repos.

### Verify installation

```bash
npx @pdlc-os/pdlc status
```

Shows install mode (local/global), plugin root path, hook registration, and Beads status.

### Check for plugin / skill conflicts

```bash
npx @pdlc-os/pdlc check-conflicts
```

Scans for other Claude Code plugins or raw skill clones whose slash commands could shadow PDLC's. Today it detects [`obra/superpowers`](https://github.com/obra/superpowers) — a separate skill collection that ships its own `/brainstorm` command. The check distinguishes:

- **Proper plugin install** (via `claude plugins install`) — informational only; commands are auto-namespaced as `/<plugin>:<cmd>` so PDLC's `/brainstorm` and `/superpowers:brainstorm` coexist without collision. Exits 0.
- **Raw-clone install** (files copied directly into `~/.claude/commands/` or `~/.claude/skills/`) — real conflict. Same-name commands shadow each other unpredictably. Exits 2 and prints resolution options.

The check runs automatically at the end of `pdlc install` and as Check 9 of `/diagnose`. Run it manually any time you suspect a conflict.

### The `superclaude` shortcut

Installing PDLC also registers a `superclaude` command. It's a thin wrapper equivalent to:

```bash
claude --permission-mode bypassPermissions "$@"
```

Use it when you want Claude Code to run tool calls (Bash, Edit, Write) **without per-command permission prompts** — e.g. a long-running PDLC session where you've decided to trust the workflow end-to-end.

```bash
superclaude                 # start Claude Code with prompts disabled
superclaude /ship      # launch directly into a slash command
```

If you want the default behavior where Claude asks before each tool call, just run `claude` as usual. The two commands coexist — `superclaude` doesn't change anything about `claude`.

**Install scope:**
- **Every install — global OR local — symlinks `superclaude` into `~/.local/bin/`** so it's reachable from any shell, regardless of how you installed PDLC. A local install no longer traps the binary inside `./node_modules/.bin/`.
- Global installs additionally get the standard npm bin symlink (e.g. in your nvm/Homebrew bin dir). The two symlinks coexist — whichever your `$PATH` finds first wins.
- **If `~/.local/bin` isn't already on `$PATH`, the installer offers to add it for you.** In an interactive terminal you'll see a prompt like:
  ```text
  /Users/you/.local/bin is not on your PATH — `superclaude` will not resolve in a new shell until it is.
  Add `export PATH="$HOME/.local/bin:$PATH"` to /Users/you/.zshrc? (Y/n)
  ```
  Hit Enter (or `y`) and a commented sentinel block is appended to your detected shell rc (`~/.zshrc` for zsh, `~/.bashrc`/`~/.bash_profile` for bash). Then run `source ~/.zshrc` (or open a new terminal) to activate it. Answer `n` and you'll get the manual-add instructions instead. A child process cannot reload the parent shell's env, so the `source` step is always yours to run.
- In non-interactive / headless installs (CI, `npm install` without a TTY) the installer just prints the `export` line for you to paste.

**Windows:** npm auto-generates a `.cmd` shim so `superclaude` works in PowerShell and cmd too. The `~/.local/bin` symlink and PATH prompt are skipped on Windows.

**Removing it:** `superclaude` is removed automatically when you `npx @pdlc-os/pdlc uninstall` — the uninstaller deletes the `~/.local/bin/superclaude` symlink *and* strips the sentinel block from your shell rc file(s). `npm uninstall @pdlc-os/pdlc` removes the package but does not run our uninstaller, so run `pdlc uninstall` first if you want the PATH cleanup.

> **Prerequisite:** the `claude` binary must be on your PATH. If Claude Code isn't installed yet, `superclaude` will exit with "command not found: claude" — install Claude Code first, then `superclaude` works immediately.

### Uninstall

`pdlc uninstall` is install-mode-aware — the same command handles npm-installed and clone-installed PDLC, doing the right cleanup for each.

**Local** (from inside the repo):

```bash
pdlc uninstall --local
```

**Global:**

```bash
pdlc uninstall
```

(You can also use `npx @pdlc-os/pdlc uninstall` if you reach npmjs — same command, npm-cached copy. For clone installs in restricted networks, use `pdlc uninstall` from PATH.)

**What gets cleaned up, regardless of install path:**

- PDLC hooks + statusLine in `~/.claude/settings.json` (or `.claude/settings.local.json` for local installs)
- Slash commands in `~/.claude/commands/` (or `.claude/commands/`)
- `~/.local/bin/superclaude` symlink
- `~/.local/bin/pdlc` symlink (if it points at a PDLC binary)
- The PATH sentinel block in your shell rc file

**Additional cleanup for clone installs only:**

- The `.install-meta.json` pin file inside the clone (silent — irrelevant once the clone is removed)
- An interactive prompt asking whether to also delete the clone directory itself (defaults to no — the directory is yours and you may want to inspect or move it). If you say yes, the clone is removed via `rm -rf` after a sanity check (refuses to delete `/`, `$HOME`, or empty paths).

> **Beads and Dolt are left alone.** PDLC uninstall does not touch them — Beads's `bd` CLI stays installed, Dolt stays installed, and the `.beads/` task data in your project is preserved as-is. If you reinstall PDLC later (via npm, GitHub, or the local clone path), your task graph and Dolt data are right where you left them. Beads and Dolt belong to your project, not to the PDLC tool install — they are managed by `/setup`, not by `pdlc install` / `pdlc uninstall`.
>
> If you genuinely want to remove Beads or Dolt, do it directly with `npm uninstall -g @beads/bd` and `brew uninstall dolt` (or your platform equivalent). PDLC won't get in the way.

### Upgrade

`pdlc upgrade` auto-detects how PDLC was installed and upgrades it accordingly — no flags needed in the common case.

```bash
# Local (per-repo install via npm devDependency)
npx @pdlc-os/pdlc upgrade --local

# Global (works for both npm-installed and clone-installed)
pdlc upgrade
```

**What it does, regardless of install mode:**

1. Upgrades PDLC to the latest version (`npm install -g @pdlc-os/pdlc@latest` for npm installs; `git pull --ff-only origin main` for clone installs).
2. Re-registers hooks and slash commands with the updated paths.
3. Prompts to upgrade Beads (defaults to yes).
4. Prompts to upgrade Dolt (defaults to yes).
5. **Migrates project templates** — detects new sections added to CONSTITUTION.md, STATE.md, METRICS.md, etc. and appends them without touching your customizations. Creates missing files (e.g., METRICS.md if upgrading from a version that didn't have it). Ensures archive directories exist.

**Clone-install-only flags** (refused for npm installs):

- `pdlc upgrade --check` — dry run. Shows the version delta and exits without applying.
- `pdlc upgrade --force` — discards local changes in the clone (`git reset --hard origin/main`). Use only if you've intentionally edited the clone and want to throw it away.
- `pdlc upgrade --to vX.Y.Z` — checks out a specific tag/branch/commit and pins to it. Subsequent `pdlc upgrade` calls without args refuse to silently un-pin.
- `pdlc upgrade --unpin` — clears the pin so `pdlc upgrade` returns to pulling latest main.

**Refusals on clone installs** (skipped if `--force` or `--to` is given):

- Refuses if the clone has uncommitted changes — commit, stash, or use `--force`.
- Refuses if the clone is not on `main` — checkout main first, or use `--to <ref>` to upgrade to a specific tag without leaving the branch.

Template versioning: each template has a `<!-- pdlc-template-version: X.Y.Z -->` comment. The upgrade command compares your file's version against the current template, finds missing sections, and appends them. Your customized content is never overwritten.

Re-running `install` is also idempotent — it strips old hook paths and re-registers with the current version. Switching from global to local (or vice versa) automatically cleans up the previous install.

### Team onboarding (new team member pulls the repo)

When another developer clones or pulls a repo that already has PDLC initialized, they need to install PDLC locally to activate the hooks and slash commands. The project's `docs/pdlc/` memory files are already in git — they just need the tooling.

**Step 1 — Install PDLC and dependencies:**

```bash
npm install
```

If `@pdlc-os/pdlc` is in `devDependencies`, this installs it and runs the postinstall hook automatically — registering PDLC hooks in `.claude/settings.local.json` and copying slash commands to `.claude/commands/`. Project prerequisites like Beads and Dolt are not installed at this point; the project's existing `/setup` history will have already prompted those when the project was first initialized, but if a teammate is on a fresh machine, running `/setup` again is a no-op for already-completed steps and a fast path through any missing prerequisites.

**Step 2 — Verify:**

```bash
npx @pdlc-os/pdlc status
```

You should see:

```
Install mode : local (this repo)
Hooks registered: statusLine, PostToolUse, PreToolUse, SessionStart
```

If `bd` or `dolt` is missing on the machine (e.g. a brand-new dev workstation), `pdlc status` will report it. Run `/setup` from inside Claude Code to install them.

**Step 3 — Start a Claude Code session:**

PDLC reads `docs/pdlc/memory/STATE.md` on session start and resumes from wherever the project left off. You'll see the current phase, active feature, and any pending work. The full memory bank (Constitution, Intent, Roadmap, Decisions, etc.) is already in the repo — no need to re-run `/setup`.

> **Note:** Each developer's `.claude/settings.local.json` is local to their machine (not committed to git). The hooks point to the PDLC package in their `node_modules/`, so each developer needs their own `npm install`. The project's `docs/pdlc/` files are shared via git — this is the team's shared memory.

---

## Quick Start

Once installed, open any project in Claude Code:

```
/setup
```

PDLC first asks which **interaction mode** you prefer — **Sketch** (agent drafts answers from your context, questions batched per round; default) or **Socratic** (one question at a time, answered from scratch). Then it asks 7 questions about your project, scaffolds the memory bank, and **Oracle brainstorms a feature roadmap with you** — identifying, describing, and prioritizing 5-15 features in `ROADMAP.md`. Then start your first feature:

```
/brainstorm user-authentication
```

Work through Inception (discovery, PRD, design, plan), then:

```
/build
```

Build, review, and test the feature with TDD and multi-agent review. When ready:

```
/ship
```

Merge, deploy, reflect, and commit the episode record. Before triggering the deploy, Pulse asks whether you have a custom deploy/CI/CD/build artifact to use — if you do, the full team runs a **Deployment Review Party** to verify the composed plan from every angle (architecture, security, tests, ops, UX, PRD conformance) and presents a consolidated plan for your approval. Your preferences take precedence; Critical security findings (hardcoded secrets, exposed credentials) are Tier 1 blocks requiring explicit override. After shipping, **Oracle reviews the roadmap and offers the next feature** — you can continue, pause, or switch to something else. The cycle repeats until the roadmap is complete.

At any point during inception or construction, record a decision or explore a scenario:

```
/decide We should use PostgreSQL instead of MongoDB
```

This triggers a **Decision Review Party** where the full team — 9 built-in agents plus any custom agents you've added to `.pdlc/agents/` that match the context — assesses cross-cutting impacts, produces minutes of meeting, and reconciles downstream effects (Beads tasks, PRDs, design docs, tests, roadmap sequencing) — all with your approval before any changes are applied.

```
/whatif What if we switched from REST to GraphQL?
```

This runs a **read-only What-If Analysis** — the full team (built-in agents plus any matching custom agents) assesses the hypothetical without changing any files. You can explore further, discard, or accept it as a formal decision.

If a feature turns out to be unviable, abandon it cleanly:

```
/abandon
```

This closes all Beads tasks, marks the feature as Dropped in the roadmap, creates an abandonment episode, and hands off to the next feature. All artifacts (PRD, design docs, branch) are preserved for reference.

If a teammate's claim on a roadmap feature is stuck (they left the team, machine unavailable, long pause), another dev can force-release it:

```
/release F-005
```

The claim is released in Beads, the ROADMAP is updated, and an ADR captures who released it and why. `/release` refuses your own active claim — use `/abandon` for that. Because `/brainstorm` resolves claims through Beads (atomic), two developers can never accidentally start on the same priority-next feature in the first place.

Need to step away or switch context? Pause cleanly and resume later:

```
/pause
/continue
```

Pause saves your exact position (phase, sub-phase, active task). Resume rebases on main, reclaims your Beads task, and picks up where you left off.

If production is on fire:

```
/hotfix fix-login-crash
```

This **auto-pauses** your current feature, creates a hotfix branch, runs a compressed TDD build-ship cycle (no brainstorm/design), and after shipping the fix, **auto-resumes** your paused feature with an impact assessment and rebase.

If a shipped feature needs to be reverted:

```
/rollback user-authentication
```

This reverts the merge commit, runs a **Post-Mortem Party** with the full team (built-in agents plus any matching custom agents) to diagnose the root cause, and presents 3 ranked fix approaches. You can fix and re-ship, abandon the feature, or pause.

If something feels off — after pulling a teammate's changes, after a rollback, or after a long break:

```
/diagnose
```

This runs a **comprehensive health check** — 8 checks covering state file integrity, ROADMAP/STATE consistency, Beads task graph (including `bd doctor` for internal Beads health), document-vs-code drift, git rollback and multi-user detection, and Constitution compliance. Read-only by default, with optional fix mode.

### Shortform aliases

Every `/pdlc <subcommand>` has a top-level alias so you can skip the `/pdlc` prefix. Both forms are equivalent and stay in lockstep — use whichever feels natural. All args forward through unchanged.

| Alias | Equivalent |
|---|---|
| `/setup` | `/pdlc init` |
| `/brainstorm` | `/pdlc brainstorm [F-NNN]` |
| `/build` | `/pdlc build` |
| `/ship` | `/pdlc ship` |
| `/decide` | `/pdlc decide <text>` |
| `/whatif` | `/pdlc whatif <text>` |
| `/diagnose` | `/pdlc doctor` (renamed to avoid Claude Code's built-in `/doctor`) |
| `/rollback` | `/pdlc rollback [feature]` |
| `/hotfix` | `/pdlc hotfix [name]` |
| `/abandon` | `/pdlc abandon [feature]` |
| `/release` | `/pdlc release [F-NNN]` |
| `/pause` | `/pdlc pause` |
| `/continue` | `/pdlc resume` (renamed to avoid Claude Code's built-in `/resume`) |
| `/override` | `/pdlc override "<blocked command>"` |

Custom skills you add under `.pdlc/skills/<name>/` remain as `/pdlc <name>` only — top-level namespace is reserved for built-ins.


---

## Why PDLC?

### Smart-handling of Tokens & Context

- PDLC is built to minimize context window consumption. It estimates context usage by tracking tool calls and token accumulation, warning at ~50% estimated usage and auto-checkpointing STATE.md at ~65% so no work is lost (thresholds are configurable in CONSTITUTION.md).
- Different models are used for different tasks — Haiku for setup/install operations, Opus for complex reasoning, Sonnet for focused specialist work. 
- Skills are loaded as markdown files on demand (not kept in context), and Agent Teams mode is the default so multi-agent work happens in separate context windows rather than consuming a single one. 
- Completed features are automatically archived and Beads is purged/compacted to reduce context noise from stale artifacts.
- Large markdown artifacts (PRDs, design docs, OVERVIEW, DECISIONS, episodes) auto-distill into inline digests that sub-agents read in place of the full prose. Two-pass compression — a `condense` syntactic pass (drops articles, filler, hedging, imperative softeners; preserves code/paths/IDs/numbers verbatim) followed by a structural digest pass — cuts re-read tokens 4–6× with round-trip fact verification (zero info loss) and sha256 staleness detection. See [`skills/distill/SKILL.md`](skills/distill/SKILL.md) and [`skills/condense/SKILL.md`](skills/condense/SKILL.md).

### Sketch or Socratic — you pick the cadence

PDLC's Init and Brainstorm phases ask a lot of structured questions. You choose how they're delivered: **Sketch mode** (default) drafts proposed answers from your existing context (CONSTITUTION, INTENT, CLAUDE.md, prior episodes) and batches the questions per round — you confirm or edit each one in a single response. **Socratic mode** asks one question at a time and you answer from scratch. Both go equally deep; only the cadence differs. The choice is captured in CONSTITUTION.md §9 and you can change it anytime.

### Multi-developer ready

Multiple developers can work on the same PDLC-enabled repo. Every phase starts with a remote sync check — if local main is behind origin, a 6-agent team meeting assesses the remote changes for conflict risk before you proceed. The doctor command detects multi-user edits, rollbacks, and cross-session drift. Each developer runs their own local PDLC hooks via `npm install` — the shared state lives in `docs/pdlc/` in git.

### Scenario planning at any stage

Use `/whatif` at any point during inception or construction to explore hypothetical changes with a full 9-agent read-only analysis — no files are modified. If the analysis looks promising, convert it to a formal decision. Use `/decide` to pivot the design mid-flight — the team assesses blast radius across code, tests, architecture, roadmap, and documentation before anything changes.

### Full decision traceability

Every decision is recorded in the Decision Registry (DECISIONS.md) with who decided, when, why, and what was impacted. Every team meeting produces minutes (MOM files). Every shipped feature has an episode file with metrics, retro notes, and lessons learned. Tier 1 safety overrides are permanently logged. The entire project history is human-readable markdown in git.

### Visual brainstorming companion

During inception, PDLC can run a local browser-based UI (Material Design, light/dark toggle) for mockups, wireframes, architecture diagrams, and side-by-side comparisons. Users can click to select options in the browser or type feedback in the terminal — both inputs are merged. The server handles port conflicts, crashes gracefully, and falls back to text-only mode if it can't start.

### Plug-and-play extensibility

Add custom skills (`.pdlc/skills/<name>/SKILL.md`), custom agents (`.pdlc/agents/<name>.md`), and custom test layers (CONSTITUTION.md table) without forking. Templates are provided for both skills and agents. Custom agents are automatically included in team meetings when task labels match.

PDLC also supports two extension patterns for layering behavior onto built-in agents and skills:

- **Agent-wide extensions** at `agents/extensions/<agent>-<topic>.md` load on every invocation of the named agent. *Example: a project's stack-aware security audit catalog extending Phantom.*
- **Phase / step-specific extensions** alongside the owning step file load only when a specific step references them. *Example: a deploy-time lint pass invoked at Ship Step 9.0 as Pulse's first action.*

Agent `model:` declarations use **tier aliases** (`opus` / `sonnet` / `haiku`) rather than version-pinned IDs, so agents stay current as Anthropic ships new models without requiring a PDLC release. See [Agent & Skill Extensions](docs/wiki/21-agent-extensions.md) for the authoring guide.

### Security is paramount — five layers, no single point of failure

Security in PDLC is enforced through a **layered defense model** rather than a single checkpoint. A feature shipped through PDLC passes through five independent security mechanisms — and the layers are intentionally redundant so that a missed check in any one layer is caught by another:

1. **Configuration** — `CONSTITUTION.md` §1 / §4 / §7 / §8 capture the security contract once at init time; `DECISIONS.md` ADRs record every accepted-risk decision.
2. **Dedicated lifecycle stops** — Brainstorm Design **Step 10.5 Threat Modeling Party** (Phantom-led STRIDE-per-trust-boundary analysis with Neo↔Phantom handoffs and Skip/Lite/Full triage); Build Review **security pillar** (Phantom one of 4 always-on parallel reviewers); Build Test **Layer 7 Security tests** (dep audit + secret scan + OWASP); Ship **Step 9.2 Deployment Review Party** (when custom artifact provided) and **pre-deploy security check** (dep audit + secret scan + headers).
3. **Continuous agent participation** — Phantom is `always_on: true` and contributes to every task, every meeting, every decision, every retro. Per-task: OWASP Top 10, auth/authz layer audit, input validation, secrets management, dependency CVE check.
4. **Hook layer** — `hooks/pdlc-guardrails.js` fires on every Bash / Edit / Write tool call. Tier 1 hard-blocks (force-push to main, DROP TABLE without migration, rm -rf outside project, deploy with failing tests, hardcoded secrets, critical dep vulnerabilities). Tier 2 pause-and-confirm (rm -rf, git reset --hard, prod DB commands, external write API calls, editing CONSTITUTION/DECISIONS).
5. **Lifecycle-of-findings** — threats found at Step 10.5 propagate forward through Plan / Build / Ship / Reflect with named owners and re-evaluation triggers. Nothing accepted at design time is silently forgotten by ship time.

Phantom's audit catalog covers OWASP Web Top 10, OWASP API Security Top 10, OWASP LLM Top 10 (with emerging concerns: MCP server security, RAG isolation, cost amplification), Mobile (iOS/Android/RN/Flutter), Cryptography correctness (JWT alg-confusion, password-hashing parameters, TLS config), 6 backend stacks (Java/Spring, Node, Python, Go, Ruby/Rails, .NET), Cloud & IaC (Terraform/CloudFormation/AWS/GCP), Tech currency & EOL, Software supply chain integrity (SBOM, SLSA, signed artifacts), and 9 compliance regimes (GDPR, CCPA/CPRA, PCI DSS v4.0, SOC 2, HIPAA, COPPA/GDPR-K/AADC, BIPA, DORA, NIS2).

See [Security in PDLC](docs/wiki/20-security.md) for the full lifecycle walkthrough, frequency table, threat-modeling deep dive, and rationale.

---

## Documentation

Detailed documentation is organized in the [docs/wiki](docs/wiki/) folder:

### Overview & Flow

| #   | Document                                                 | What it covers                                                                                          |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 01  | [The PDLC Flow](docs/wiki/01-pdlc-flow.md)               | Summary and detailed Mermaid flow diagrams, approval gates                                              |
| 02  | [Feature Highlights](docs/wiki/02-feature-highlights.md) | Capabilities by phase: inception, construction, operation, decisions, what-if, cross-cutting            |
| 03  | [Phases in Detail](docs/wiki/03-phases-in-detail.md)     | Per-phase Mermaid diagrams, sub-phase tables, lead agents, pivot and scenario planning                  |
| 04  | [Doctor](docs/wiki/04-doctor.md)                         | Comprehensive health check: state consistency, doc/code drift, rollback detection, multi-user conflicts |
| 05  | [Pause & Resume](docs/wiki/05-pause-resume.md)           | Save and restore feature state, Beads task reclaim, rebase on resume                                    |
| 06  | [Hotfix](docs/wiki/06-hotfix.md)                         | Emergency compressed build-ship, auto-pause/resume, impact assessment                                   |
| 07  | [Rollback](docs/wiki/07-rollback.md)                     | Revert shipped features, post-mortem party, 3 ranked fix approaches                                     |
| 08  | [Abandon](docs/wiki/08-abandon.md)                       | Drop in-progress features, clean up tasks/artifacts, abandonment episode                                |

### Team & Meetings

| #   | Document                                                 | What it covers                                                                              |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 09  | [The Agent Team](docs/wiki/09-agent-team.md)             | 9 built-in specialist agents plus custom-agent extensibility via `.pdlc/agents/`            |
| 10  | [Party Mode](docs/wiki/10-party-mode.md)                 | 8 meeting types, meeting map across phases, spawn modes, announcements, durable checkpoints |
| 11  | [Deadlock Detection](docs/wiki/11-deadlock-detection.md) | 6 deadlock types with auto-resolution and human escalation paths                            |

### Architecture

| #   | Document                                                   | What it covers                                                                                      |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 12  | [Skills Architecture](docs/wiki/12-skills-architecture.md) | Skill file structure, phase skills, supporting skills, directory layout                             |
| 13  | [Memory Bank](docs/wiki/13-memory-bank.md)                 | All `docs/pdlc/` files: memory, PRDs, design docs, reviews, brainstorm logs, MOMs, metrics, archive |
| 14  | [Safety Guardrails](docs/wiki/14-safety-guardrails.md)     | Tier 1 (hard block), Tier 2 (pause), Tier 3 (logged warning) definitions                            |

### Features

| #   | Document                                             | What it covers                                                                             |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 15  | [Status Bar](docs/wiki/15-status-bar.md)             | Live phase/task/context status bar with configurable thresholds                            |
| 16  | [Visual Companion](docs/wiki/16-visual-companion.md) | Browser-based Material Design UI for mockups and diagrams during Inception                 |
| 17  | [Design Decisions](docs/wiki/17-design-decisions.md) | Rationale for architectural choices: TDD, file-based memory, pivot/scenario planning, etc. |
| 18  | [Extensibility](docs/wiki/18-extensibility.md)       | Custom skills, custom agents, custom test layers — extend PDLC without forking             |
| 19  | [Release a stuck claim](docs/wiki/19-release-claim.md) | When and how to force-release a stuck roadmap-level Beads claim with `/release`       |
| 20  | [Security in PDLC](docs/wiki/20-security.md) | The layered security model — configuration / lifecycle stops / continuous agent participation / hook layer / lifecycle-of-findings. Covers Brainstorm Design Step 10.5 (Threat Modeling Party), Build Review security pillar, Layer 7 security tests, Ship Step 9.2 (Deployment Review), pre-deploy security checks, and Tier 1/2/3 always-on guardrails |
| 21  | [Agent & Skill Extensions](docs/wiki/21-agent-extensions.md) | Two extension patterns (agent-wide vs phase-specific), authoring conventions, tier-aliased model declarations, existing extensions catalog |

---

## PDLC-OS Marketplace

| Resource           | URL                                                           |
| ------------------ | ------------------------------------------------------------- |
| GitHub org         | https://github.com/pdlc-os                                    |
| Core package       | https://www.npmjs.com/package/@pdlc-os/pdlc                   |
| Registry index     | https://github.com/pdlc-os/registry                           |
| Contribution guide | https://github.com/pdlc-os/registry/blob/main/CONTRIBUTING.md |

The `pdlc-os` GitHub organisation hosts community-contributed extensions:

| Type                    | Examples                                                                  |
| ----------------------- | ------------------------------------------------------------------------- |
| **Workflow templates**  | `@pdlc-os/workflow-saas-mvp`, `@pdlc-os/workflow-api-service`             |
| **Role packs**          | `@pdlc-os/agent-fintech-security`, `@pdlc-os/agent-accessibility-auditor` |
| **Stack adapters**      | `@pdlc-os/stack-nextjs-supabase`, `@pdlc-os/stack-rails-postgres`         |
| **Integration plugins** | `@pdlc-os/integration-linear`, `@pdlc-os/integration-notion`              |
| **Skill packs**         | `@pdlc-os/skill-hipaa`, `@pdlc-os/skill-seo-audit`                        |

---

## Prerequisites

| Dependency                                         | Install                                  | Notes                                                                                     |
| -------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Node.js >= 18                                      | [nodejs.org](https://nodejs.org)         |                                                                                           |
| Claude Code                                        | [claude.ai/code](https://claude.ai/code) |                                                                                           |
| Python 3                                           | Prompted during PDLC install             | Used by the session-start hook for handoff parsing, roadmap-claim reconciliation, progress rendering, and conflict detection. Auto-installed via Homebrew on macOS/Linux-with-brew; distro/Windows package command is printed otherwise. Hook degrades gracefully if Python 3 is missing. |
| [Dolt](https://github.com/dolthub/dolt)            | Prompted during `/setup`                 | SQL database required by Beads; installed via Homebrew (macOS) or official script (Linux) |
| [Beads (bd)](https://github.com/gastownhall/beads) | Prompted during `/setup`                 | Task manager; installed globally via npm registry, with a clone-from-source fallback if the registry is restricted |
| Git                                                | Built into macOS/Linux                   |                                                                                           |
| [GitHub CLI (gh)](https://cli.github.com)          | Prompted during `/setup` if needed   | Required for PR creation during `/ship`; setup guided during init                    |

---

## License

MIT (c) pdlc-os contributors
