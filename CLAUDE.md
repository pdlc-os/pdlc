# PDLC — Product Development Lifecycle

You are operating within the PDLC (Product Development Lifecycle) framework, a structured Claude Code plugin designed for small startup-style teams (2–5 engineers). PDLC guides every feature from raw idea through shipping and retrospective across four phases: Initialization, Inception, Construction, and Operation. The framework combines methodology discipline (TDD, systematic debugging, subagent reviews), specialist agent roles, context-rot prevention, spec-driven execution, and file-based persistent memory. Every session begins by reading `docs/pdlc/memory/STATE.md` to determine where work left off, then resumes automatically from the last checkpoint. All rules, standards, and overrides live in `docs/pdlc/memory/CONSTITUTION.md` — the Constitution always wins.

---

## Phase Summary

| Phase | Command | Description |
|-------|---------|-------------|
| **Phase 0 — Initialization** | `/pdlc init` (alias: `/setup`) | First-time setup: Git/GitHub, Homebrew, Dolt, Beads, **Interaction Mode** (Sketch/Socratic), Constitution, Intent, Memory Bank, Roadmap ideation |
| **Phase 1 — Inception** | `/pdlc brainstorm` (alias: `/brainstorm`) | Resolves the roadmap claim via Beads (atomic — multi-dev safe) → Discover (grounded divergent ideation + Socratic + Progressive Thinking + Adversarial + Edge Case + UX Discovery on UI features) → Define → Design (Bloom's Taxonomy) → Plan. Every questioning step respects the Interaction Mode set in CONSTITUTION §9. |
| **Phase 2 — Construction** | `/pdlc build` (alias: `/build`) | Build (TDD) → Review (Party Review + Phantom sign-off) → Test (7 layers incl. security) |
| **Phase 3 — Operation** | `/pdlc ship` (alias: `/ship`) | Ship (merge, tag, optional Deployment Review for custom artifacts, CI/CD trigger) → Verify (security + smoke tests) → Reflect (metrics + archive) → Next Feature |
| **Decision** | `/pdlc decide` (alias: `/decide`) | Record a decision with full team impact assessment (any phase) |
| **What-If** | `/pdlc whatif` (alias: `/whatif`) | Read-only scenario exploration with team analysis (any phase) |
| **Doctor** | `/pdlc doctor` (alias: `/diagnose`) | Comprehensive health check: state, docs, code, Beads, git history |
| **Rollback** | `/pdlc rollback` (alias: `/rollback`) | Revert a shipped feature with post-mortem party |
| **Hotfix** | `/pdlc hotfix` (alias: `/hotfix`) | Emergency compressed build-ship with auto-pause/resume |
| **Pause / Resume** | `/pdlc pause` / `/pdlc resume` (aliases: `/pause` / `/continue`) | Save and restore feature state across sessions |
| **Abandon** | `/pdlc abandon` (alias: `/abandon`) | Drop an in-progress feature with cleanup and archival |
| **Release** | `/pdlc release` (alias: `/release`) | Force-release a stuck roadmap claim so another dev can pick it up |
| **Override** | `/pdlc override` (alias: `/override`) | Double-RED confirmation for Tier 1 safety overrides |
| *(resume)* | *(none)* | If no command given, read `docs/pdlc/memory/STATE.md` and resume from last checkpoint |

---

## Session Resume

When the session start hook injects a resume banner, Claude **must inform the user** about the resume state before doing anything else. Read `docs/pdlc/reference/session-resume.md` for the three resume scenarios (fresh handoff, stale handoff, no handoff) and the exact messages to display.

## Step Checkpoint

After completing each numbered step within a skill, Claude **must** update the Context Checkpoint in `docs/pdlc/memory/STATE.md` with the current progress. This ensures `/clear` recovery is precise — not just phase/sub-phase but the exact step.

Write only the JSON block under `## Context Checkpoint`:
```json
{
  "triggered_at": "<ISO timestamp>",
  "active_task": "<Beads task ID or null>",
  "sub_phase": "<current sub-phase>",
  "step": "<step number just completed, e.g. 'Step 7'>",
  "skill_file": "<path to the skill file being executed>",
  "work_in_progress": "<1-sentence: what was just completed>",
  "next_action": "<1-sentence: the exact next step to execute>",
  "files_open": ["<paths of files being actively worked on>"]
}
```

This write is lightweight (one small JSON block) and is **not** a Tier 3 logged warning — it is routine bookkeeping exempt from the STATE.md direct-edit rule.

---

## Key Rules

> **These rules are enforced by default. All can be overridden via `docs/pdlc/memory/CONSTITUTION.md`.**

| Rule | Default Behavior |
|------|-----------------|
| **TDD enforced** | Claude must write failing tests before any implementation code. No implementation without a failing test. |
| **Merge commit** | All PRs use merge commits (no squash, no rebase) to preserve full branch history. |
| **Soft warnings only** | Security findings (Phantom) and test coverage gaps (Echo) are flagged but do not hard-block progress. Human decides: fix now, accept, or defer to tech debt. |
| **Constitution overrides defaults** | Any rule in this document can be changed by editing `docs/pdlc/memory/CONSTITUTION.md`. The Constitution is the single source of truth for all project-specific rules. |
| **Tier 1 hard blocks** | Force-push to `main`, dropping DB tables without a migration file, deleting files not created on the current branch, deploying with failing smoke tests, hardcoded secrets, critical dependency vulnerabilities — override via `/pdlc override` (double-RED confirmation, permanently logged). |
| **Tier 2 pause & confirm** | `rm -rf`, `git reset --hard`, production DB migrations, editing `CONSTITUTION.md`/`DECISIONS.md` (via any tool — Bash, Edit, Write), closing all Beads tasks at once, any external API call that writes/posts/sends — PDLC stops and waits for explicit yes. |
| **Tier 3 logged warnings** | Skipping a test layer, overriding a Constitution rule, accepting a Phantom security warning without fixing, accepting an Echo coverage gap, editing `STATE.md`/`ROADMAP.md`/`INTENT.md`/`OVERVIEW.md`/`CHANGELOG.md` directly — PDLC proceeds and records the decision in `STATE.md`. |

---

## Reference

- **Flow diagram:** `docs/pdlc/reference/flow-diagram.md`
- **Agent roster (9 built-in + any custom agents from `.pdlc/agents/`):** `docs/pdlc/reference/agents.md` — full personas in `agents/*.md`
- **Approval gates & 3-Strike:** `docs/pdlc/reference/approval-gates.md`
- **Safety guardrails:** `skills/safety-guardrails/SKILL.md`
- **Interaction Mode (Sketch/Socratic) protocol:** `skills/interaction-mode.md`

## State & Configuration Pointers

- **Current project state:** `docs/pdlc/memory/STATE.md`
- **Constitution (rules, standards, overrides):** `docs/pdlc/memory/CONSTITUTION.md`
- **Intent (problem statement, target user, value prop):** `docs/pdlc/memory/INTENT.md`
- **Roadmap:** `docs/pdlc/memory/ROADMAP.md`
- **Decision registry:** `docs/pdlc/memory/DECISIONS.md`
- **Delivery metrics + trends:** `docs/pdlc/memory/METRICS.md`
- **Changelog:** `docs/pdlc/memory/CHANGELOG.md`
- **Aggregated delivery overview:** `docs/pdlc/memory/OVERVIEW.md`
- **Deployment register (environments, URLs, commands, tags, history):** `docs/pdlc/memory/DEPLOYMENTS.md`
- **Episode history:** `docs/pdlc/memory/episodes/index.md`
- **Archived feature artifacts:** `docs/pdlc/archive/`
- **State reconciliation protocol:** `skills/state-reconciliation.md`
