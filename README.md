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

PDLC can be installed **locally** (per-repo, recommended for teams) or **globally** (all projects on your machine). Both Beads (the task manager) and PDLC itself are installed with the same scope — you'll be prompted to approve Beads installation automatically.

### Local install (recommended)

Installs PDLC and Beads as devDependencies inside your repo. Hooks are written to `.claude/settings.local.json` so they only apply to this project.

```bash
cd your-repo
npm install --save-dev @pdlc-os/pdlc
```

The postinstall script auto-detects local context, registers hooks in `.claude/settings.local.json`, and prompts you to install Beads locally too.

Or install explicitly with the `--local` flag:

```bash
npx @pdlc-os/pdlc install --local
```

### Global install

Registers hooks in `~/.claude/settings.json` so PDLC is available across all projects. Beads is installed globally too.

```bash
npm install -g @pdlc-os/pdlc
```

Or without a global install:

```bash
npx @pdlc-os/pdlc install
```

Or directly from GitHub (always latest):

```bash
npm install -g pdlc-os/pdlc
```

### Install from source (offline / restricted networks)

If the npm registry is blocked (e.g., corporate firewalls), build a tarball from the Git repository and install from that in two steps — the tarball first, then the interactive setup:

```bash
# Clone the repo and build the tarball
git clone https://github.com/pdlc-os/pdlc.git
cd pdlc
npm pack
```

This produces a file like `pdlc-os-pdlc-2.6.1.tgz`.

**Step 1 — install the package** (pass `--ignore-scripts` to skip the non-interactive postinstall):

```bash
# Global
npm install -g /path/to/pdlc/pdlc-os-pdlc-2.6.1.tgz --ignore-scripts

# Or local (from your project directory)
cd /path/to/your-repo
npm install --save-dev /path/to/pdlc/pdlc-os-pdlc-2.6.1.tgz --ignore-scripts
```

**Step 2 — run the interactive setup** in your terminal. This prints the PDLC banner, registers hooks, and prompts for Beads/Dolt — the exact same experience as the `npx` install path:

```bash
# Global
pdlc install

# Or local
npx pdlc install --local
```

Why two steps? `npm install` runs its lifecycle scripts without a TTY, which suppresses the banner and makes the Beads/Dolt prompts silently no-op. Running `pdlc install` after the tarball install restores the full interactive flow.

> **If you skip `--ignore-scripts`**, the install still succeeds — hooks and slash commands get registered silently, and you'll see a follow-up block telling you to run `pdlc install` to complete the setup. Either path works; the two-step pattern above is cleaner.

> **Tip:** To share with teammates on the same restricted network, distribute the `.tgz` file via internal file share, Artifactory, or email. Each developer runs the two-step install against the tarball path.

### Verify installation

```bash
npx @pdlc-os/pdlc status
```

Shows install mode (local/global), plugin root path, hook registration, and Beads status.

### The `superclaude` shortcut

Installing PDLC also registers a `superclaude` command. It's a thin wrapper equivalent to:

```bash
claude --dangerously-skip-permissions "$@"
```

Use it when you want Claude Code to run tool calls (Bash, Edit, Write) **without per-command permission prompts** — e.g. a long-running PDLC session where you've decided to trust the workflow end-to-end.

```bash
superclaude                 # start Claude Code with prompts disabled
superclaude /pdlc ship      # launch directly into a slash command
```

If you want the default behavior where Claude asks before each tool call, just run `claude` as usual. The two commands coexist — `superclaude` doesn't change anything about `claude`.

**Install scope:**
- Global install → `superclaude` lands in your npm global bin (already on PATH).
- Local install → available via `npx superclaude` from inside the repo, or by adding `./node_modules/.bin` to PATH.

**Windows:** npm auto-generates a `.cmd` shim so `superclaude` works in PowerShell and cmd too.

**Removing it:** `superclaude` is removed automatically when you `npx @pdlc-os/pdlc uninstall` or `npm uninstall @pdlc-os/pdlc`.

> **Prerequisite:** the `claude` binary must be on your PATH. If Claude Code isn't installed yet, `superclaude` will exit with "command not found: claude" — install Claude Code first, then `superclaude` works immediately.

### Uninstall

**Local** (from inside the repo):

```bash
npx @pdlc-os/pdlc uninstall --local
```

Removes PDLC hooks from `.claude/settings.local.json` and slash commands from `.claude/commands/`. You'll be prompted to uninstall Beads as well.

**Global:**

```bash
npx @pdlc-os/pdlc uninstall
```

Removes PDLC hooks from `~/.claude/settings.json` and slash commands from `~/.claude/commands/`. You'll be prompted to uninstall Beads globally too.

> **Note on Beads:** If your repo is already tracking tasks in Beads (`.beads/` directory), uninstalling Beads removes the CLI but your task data remains on disk. You won't be able to query or manage those tasks without the `bd` command. The uninstaller warns you about this before proceeding and defaults to keeping Beads installed.
> 
> **Note on Dolt:** If you uninstall Beads, you'll also be prompted to uninstall Dolt (the SQL database Beads uses). Dolt is a system-level binary — other tools may depend on it, so the uninstaller defaults to keeping it.

### Upgrade

```bash
# Local
npx @pdlc-os/pdlc upgrade --local

# Global
npx @pdlc-os/pdlc upgrade
```

The `upgrade` command:

1. Upgrades PDLC to the latest version (matching your install scope)
2. Re-registers hooks and slash commands with updated paths
3. Prompts to upgrade Beads as well (defaults to yes)
4. Prompts to upgrade Dolt as well (defaults to yes)
5. **Migrates project templates** — detects new sections added to CONSTITUTION.md, STATE.md, METRICS.md, etc. and appends them without touching your customizations. Creates missing files (e.g., METRICS.md if upgrading from a version that didn't have it). Ensures archive directories exist.

Template versioning: each template has a `<!-- pdlc-template-version: X.Y.Z -->` comment. The upgrade command compares your file's version against the current template, finds missing sections, and appends them. Your customized content is never overwritten.

Re-running `install` is also idempotent — it strips old hook paths and re-registers with the current version. Switching from global to local (or vice versa) automatically cleans up the previous install.

### Team onboarding (new team member pulls the repo)

When another developer clones or pulls a repo that already has PDLC initialized, they need to install PDLC locally to activate the hooks and slash commands. The project's `docs/pdlc/` memory files are already in git — they just need the tooling.

**Step 1 — Install PDLC and dependencies:**

```bash
npm install
```

If `@pdlc-os/pdlc` is in `devDependencies`, this installs it and runs the postinstall hook automatically — registering PDLC hooks in `.claude/settings.local.json` and copying slash commands to `.claude/commands/`. You'll be prompted to install Dolt and Beads if they're not already on your machine.

**Step 2 — Verify:**

```bash
npx @pdlc-os/pdlc status
```

You should see:

```
Install mode : local (this repo)
Dolt         : ✓ installed
Beads (bd)   : ✓ installed
Hooks registered: statusLine, PostToolUse, PreToolUse, SessionStart
```

**Step 3 — Start a Claude Code session:**

PDLC reads `docs/pdlc/memory/STATE.md` on session start and resumes from wherever the project left off. You'll see the current phase, active feature, and any pending work. The full memory bank (Constitution, Intent, Roadmap, Decisions, etc.) is already in the repo — no need to re-run `/pdlc init`.

> **Note:** Each developer's `.claude/settings.local.json` is local to their machine (not committed to git). The hooks point to the PDLC package in their `node_modules/`, so each developer needs their own `npm install`. The project's `docs/pdlc/` files are shared via git — this is the team's shared memory.

---

## Quick Start

Once installed, open any project in Claude Code:

```
/pdlc init
```

PDLC first asks which **interaction mode** you prefer — **Sketch** (agent drafts answers from your context, questions batched per round; default) or **Socratic** (one question at a time, answered from scratch). Then it asks 7 questions about your project, scaffolds the memory bank, and **Oracle brainstorms a feature roadmap with you** — identifying, describing, and prioritizing 5-15 features in `ROADMAP.md`. Then start your first feature:

```
/pdlc brainstorm user-authentication
```

Work through Inception (discovery, PRD, design, plan), then:

```
/pdlc build
```

Build, review, and test the feature with TDD and multi-agent review. When ready:

```
/pdlc ship
```

Merge, deploy, reflect, and commit the episode record. Before triggering the deploy, Pulse asks whether you have a custom deploy/CI/CD/build artifact to use — if you do, the full team runs a **Deployment Review Party** to verify the composed plan from every angle (architecture, security, tests, ops, UX, PRD conformance) and presents a consolidated plan for your approval. Your preferences take precedence; Critical security findings (hardcoded secrets, exposed credentials) are Tier 1 blocks requiring explicit override. After shipping, **Oracle reviews the roadmap and offers the next feature** — you can continue, pause, or switch to something else. The cycle repeats until the roadmap is complete.

At any point during inception or construction, record a decision or explore a scenario:

```
/pdlc decision We should use PostgreSQL instead of MongoDB
```

This triggers a **Decision Review Party** where the full team — 9 built-in agents plus any custom agents you've added to `.pdlc/agents/` that match the context — assesses cross-cutting impacts, produces minutes of meeting, and reconciles downstream effects (Beads tasks, PRDs, design docs, tests, roadmap sequencing) — all with your approval before any changes are applied.

```
/pdlc whatif What if we switched from REST to GraphQL?
```

This runs a **read-only What-If Analysis** — the full team (built-in agents plus any matching custom agents) assesses the hypothetical without changing any files. You can explore further, discard, or accept it as a formal decision.

If a feature turns out to be unviable, abandon it cleanly:

```
/pdlc abandon
```

This closes all Beads tasks, marks the feature as Dropped in the roadmap, creates an abandonment episode, and hands off to the next feature. All artifacts (PRD, design docs, branch) are preserved for reference.

If a teammate's claim on a roadmap feature is stuck (they left the team, machine unavailable, long pause), another dev can force-release it:

```
/pdlc release F-005
```

The claim is released in Beads, the ROADMAP is updated, and an ADR captures who released it and why. `/pdlc release` refuses your own active claim — use `/pdlc abandon` for that. Because `/pdlc brainstorm` resolves claims through Beads (atomic), two developers can never accidentally start on the same priority-next feature in the first place.

Need to step away or switch context? Pause cleanly and resume later:

```
/pdlc pause
/pdlc resume
```

Pause saves your exact position (phase, sub-phase, active task). Resume rebases on main, reclaims your Beads task, and picks up where you left off.

If production is on fire:

```
/pdlc hotfix fix-login-crash
```

This **auto-pauses** your current feature, creates a hotfix branch, runs a compressed TDD build-ship cycle (no brainstorm/design), and after shipping the fix, **auto-resumes** your paused feature with an impact assessment and rebase.

If a shipped feature needs to be reverted:

```
/pdlc rollback user-authentication
```

This reverts the merge commit, runs a **Post-Mortem Party** with the full team (built-in agents plus any matching custom agents) to diagnose the root cause, and presents 3 ranked fix approaches. You can fix and re-ship, abandon the feature, or pause.

If something feels off — after pulling a teammate's changes, after a rollback, or after a long break:

```
/pdlc doctor
```

This runs a **comprehensive health check** — 8 checks covering state file integrity, ROADMAP/STATE consistency, Beads task graph (including `bd doctor` for internal Beads health), document-vs-code drift, git rollback and multi-user detection, and Constitution compliance. Read-only by default, with optional fix mode.

---

## Why PDLC?

### Smart-handling of Tokens & Context

- PDLC is built to minimize context window consumption. It estimates context usage by tracking tool calls and token accumulation, warning at ~50% estimated usage and auto-checkpointing STATE.md at ~65% so no work is lost (thresholds are configurable in CONSTITUTION.md).
- Different models are used for different tasks — Haiku for setup/install operations, Opus for complex reasoning, Sonnet for focused specialist work. 
- Skills are loaded as markdown files on demand (not kept in context), and Agent Teams mode is the default so multi-agent work happens in separate context windows rather than consuming a single one. 
- Completed features are automatically archived and Beads is purged/compacted to reduce context noise from stale artifacts.

### Sketch or Socratic — you pick the cadence

PDLC's Init and Brainstorm phases ask a lot of structured questions. You choose how they're delivered: **Sketch mode** (default) drafts proposed answers from your existing context (CONSTITUTION, INTENT, CLAUDE.md, prior episodes) and batches the questions per round — you confirm or edit each one in a single response. **Socratic mode** asks one question at a time and you answer from scratch. Both go equally deep; only the cadence differs. The choice is captured in CONSTITUTION.md §9 and you can change it anytime.

### Multi-developer ready

Multiple developers can work on the same PDLC-enabled repo. Every phase starts with a remote sync check — if local main is behind origin, a 6-agent team meeting assesses the remote changes for conflict risk before you proceed. The doctor command detects multi-user edits, rollbacks, and cross-session drift. Each developer runs their own local PDLC hooks via `npm install` — the shared state lives in `docs/pdlc/` in git.

### Scenario planning at any stage

Use `/pdlc whatif` at any point during inception or construction to explore hypothetical changes with a full 9-agent read-only analysis — no files are modified. If the analysis looks promising, convert it to a formal decision. Use `/pdlc decision` to pivot the design mid-flight — the team assesses blast radius across code, tests, architecture, roadmap, and documentation before anything changes.

### Full decision traceability

Every decision is recorded in the Decision Registry (DECISIONS.md) with who decided, when, why, and what was impacted. Every team meeting produces minutes (MOM files). Every shipped feature has an episode file with metrics, retro notes, and lessons learned. Tier 1 safety overrides are permanently logged. The entire project history is human-readable markdown in git.

### Visual brainstorming companion

During inception, PDLC can run a local browser-based UI (Material Design, light/dark toggle) for mockups, wireframes, architecture diagrams, and side-by-side comparisons. Users can click to select options in the browser or type feedback in the terminal — both inputs are merged. The server handles port conflicts, crashes gracefully, and falls back to text-only mode if it can't start.

### Plug-and-play extensibility

Add custom skills (`.pdlc/skills/<name>/SKILL.md`), custom agents (`.pdlc/agents/<name>.md`), and custom test layers (CONSTITUTION.md table) without forking. Templates are provided for both skills and agents. Custom agents are automatically included in team meetings when task labels match.

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
| [Dolt](https://github.com/dolthub/dolt)            | Prompted during PDLC install             | SQL database required by Beads; installed via Homebrew (macOS) or official script (Linux) |
| [Beads (bd)](https://github.com/gastownhall/beads) | Prompted during PDLC install             | Task manager; same scope (local/global) as PDLC                                           |
| Git                                                | Built into macOS/Linux                   |                                                                                           |
| [GitHub CLI (gh)](https://cli.github.com)          | Prompted during `/pdlc init` if needed   | Required for PR creation during `/pdlc ship`; setup guided during init                    |

---

## License

MIT (c) pdlc-os contributors
