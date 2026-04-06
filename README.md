# PDLC — Product Development Lifecycle

A Claude Code plugin that guides small startup-style teams (2-5 engineers) through the full arc of feature development — from raw idea to shipped, production feature — using structured phases, a named specialist agent team, persistent memory, and safety guardrails.

PDLC combines the best of four Claude Code workflows:
- **[obra/superpowers](https://github.com/obra/superpowers)** — TDD discipline, systematic debugging, visual brainstorming companion
- **[gstack](https://github.com/garrytan/gstack)** — specialist agent roles, sprint workflow, real browser automation
- **[get-shit-done-cc](https://github.com/gsd-build/get-shit-done)** — context-rot prevention, spec-driven execution, file-based persistent memory
- **[bmad-method](https://github.com/bmadcode/bmad-method)** — adversarial review, edge case analysis, divergent ideation, multi-agent party mode
- plus additional features missing from these workflows including what-if analysis, roadmap pivots, etc.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Documentation](#documentation)
4. [PDLC-OS Marketplace](#pdlc-os-marketplace)
5. [Prerequisites](#prerequisites)
6. [License](#license)

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

### Verify installation

```bash
npx @pdlc-os/pdlc status
```

Shows install mode (local/global), plugin root path, hook registration, and Beads status.

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

PDLC asks 7 questions about your project, scaffolds the memory bank, then **Oracle brainstorms a feature roadmap with you** — identifying, describing, and prioritizing 5-15 features in `ROADMAP.md`. Then start your first feature:

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

Merge, deploy, reflect, and commit the episode record. After shipping, **Oracle reviews the roadmap and offers the next feature** — you can continue, pause, or switch to something else. The cycle repeats until the roadmap is complete.

At any point during inception or construction, record a decision or explore a scenario:

```
/pdlc decision We should use PostgreSQL instead of MongoDB
```

This triggers a **Decision Review Party** where all 9 agents assess cross-cutting impacts, produce minutes of meeting, and reconcile downstream effects (Beads tasks, PRDs, design docs, tests, roadmap sequencing) — all with your approval before any changes are applied.

```
/pdlc whatif What if we switched from REST to GraphQL?
```

This runs a **read-only What-If Analysis** — all 9 agents assess the hypothetical without changing any files. You can explore further, discard, or accept it as a formal decision.

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

This reverts the merge commit, runs a **Post-Mortem Party** with all 9 agents to diagnose the root cause, and presents 3 ranked fix approaches. You can fix and re-ship, abandon the feature, or pause.

If something feels off — after pulling a teammate's changes, after a rollback, or after a long break:

```
/pdlc doctor
```

This runs a **comprehensive health check** — 8 checks covering state file integrity, ROADMAP/STATE consistency, Beads task graph (including `bd doctor` for internal Beads health), document-vs-code drift, git rollback and multi-user detection, and Constitution compliance. Read-only by default, with optional fix mode.

---

## Documentation

Detailed documentation is organized in the [docs/wiki](docs/wiki/) folder:

### Overview & Flow

| # | Document | What it covers |
|---|----------|---------------|
| 01 | [The PDLC Flow](docs/wiki/01-pdlc-flow.md) | Summary and detailed Mermaid flow diagrams, approval gates |
| 02 | [Feature Highlights](docs/wiki/02-feature-highlights.md) | Capabilities by phase: inception, construction, operation, decisions, what-if, cross-cutting |
| 03 | [Phases in Detail](docs/wiki/03-phases-in-detail.md) | Per-phase Mermaid diagrams, sub-phase tables, lead agents, pivot and scenario planning |

### Team & Meetings

| # | Document | What it covers |
|---|----------|---------------|
| 04 | [The Agent Team](docs/wiki/04-agent-team.md) | 9 specialist agents: roles, models (Opus/Sonnet), focus areas, lead agent assignments |
| 05 | [Party Mode](docs/wiki/05-party-mode.md) | 7 meeting types, meeting map across phases, spawn modes, announcements, durable checkpoints |
| 06 | [Deadlock Detection](docs/wiki/06-deadlock-detection.md) | 6 deadlock types with auto-resolution and human escalation paths |

### Architecture

| # | Document | What it covers |
|---|----------|---------------|
| 07 | [Skills Architecture](docs/wiki/07-skills-architecture.md) | Skill file structure, phase skills, supporting skills, directory layout |
| 08 | [Memory Bank](docs/wiki/08-memory-bank.md) | All `docs/pdlc/` files: memory, PRDs, design docs, reviews, brainstorm logs, MOMs |
| 09 | [Safety Guardrails](docs/wiki/09-safety-guardrails.md) | Tier 1 (hard block), Tier 2 (pause), Tier 3 (logged warning) definitions |

### Features

| # | Document | What it covers |
|---|----------|---------------|
| 10 | [Status Bar](docs/wiki/10-status-bar.md) | Live phase/task/context status bar in Claude Code |
| 11 | [Visual Companion](docs/wiki/11-visual-companion.md) | Browser-based Material Design UI for mockups and diagrams during Inception |
| 13 | [Doctor](docs/wiki/13-doctor.md) | Comprehensive health check: state consistency, doc/code drift, rollback detection, multi-user conflicts |
| 12 | [Design Decisions](docs/wiki/12-design-decisions.md) | Rationale for architectural choices: TDD, file-based memory, pivot/scenario planning, etc. |

---

## PDLC-OS Marketplace

| Resource | URL |
|----------|-----|
| GitHub org | https://github.com/pdlc-os |
| Core package | https://www.npmjs.com/package/@pdlc-os/pdlc |
| Registry index | https://github.com/pdlc-os/registry |
| Contribution guide | https://github.com/pdlc-os/registry/blob/main/CONTRIBUTING.md |

The `pdlc-os` GitHub organisation hosts community-contributed extensions:

| Type | Examples |
|------|---------|
| **Workflow templates** | `@pdlc-os/workflow-saas-mvp`, `@pdlc-os/workflow-api-service` |
| **Role packs** | `@pdlc-os/agent-fintech-security`, `@pdlc-os/agent-accessibility-auditor` |
| **Stack adapters** | `@pdlc-os/stack-nextjs-supabase`, `@pdlc-os/stack-rails-postgres` |
| **Integration plugins** | `@pdlc-os/integration-linear`, `@pdlc-os/integration-notion` |
| **Skill packs** | `@pdlc-os/skill-hipaa`, `@pdlc-os/skill-seo-audit` |

---

## Prerequisites

| Dependency | Install | Notes |
|-----------|---------|-------|
| Node.js >= 18 | [nodejs.org](https://nodejs.org) | |
| Claude Code | [claude.ai/code](https://claude.ai/code) | |
| [Dolt](https://github.com/dolthub/dolt) | Prompted during PDLC install | SQL database required by Beads; installed via Homebrew (macOS) or official script (Linux) |
| [Beads (bd)](https://github.com/gastownhall/beads) | Prompted during PDLC install | Task manager; same scope (local/global) as PDLC |
| Git | Built into macOS/Linux | |
| [GitHub CLI (gh)](https://cli.github.com) | Prompted during `/pdlc init` if needed | Required for PR creation during `/pdlc ship`; setup guided during init |

---

## License

MIT (c) pdlc-os contributors
