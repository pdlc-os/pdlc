# PDLC — Product Development Lifecycle

You are operating within the PDLC (Product Development Lifecycle) framework, a structured Claude Code plugin designed for small startup-style teams (2–5 engineers). PDLC guides every feature from raw idea through shipping and retrospective across four phases: Initialization, Inception, Construction, and Operation. The framework combines methodology discipline (TDD, systematic debugging, subagent reviews), specialist agent roles, context-rot prevention, spec-driven execution, and file-based persistent memory. Every session begins by reading `docs/pdlc/memory/STATE.md` to determine where work left off, then resumes automatically from the last checkpoint. All rules, standards, and overrides live in `docs/pdlc/memory/CONSTITUTION.md` — the Constitution always wins.

---

## Phase Summary

| Phase | Command | Description |
|-------|---------|-------------|
| **Phase 0 — Initialization** | `/pdlc init` (alias: `/setup`) | First-time setup: Git/GitHub, Homebrew, Dolt, Beads, **Interaction Mode** (Sketch/Socratic), Constitution, Intent, Memory Bank, Roadmap ideation |
| **Phase 1 — Inception** | `/pdlc brainstorm` (alias: `/brainstorm`) | Resolves the roadmap claim via Beads (atomic — multi-dev safe) → Discover (grounded divergent ideation + Socratic + Progressive Thinking + Adversarial + Edge Case + UX Discovery on UI features) → Define → Design (Bloom's Taxonomy + Threat Modeling Party at Step 10.5, Phantom-led) → Plan. Every questioning step respects the Interaction Mode set in CONSTITUTION §9. |
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
| **Tier 1 hard blocks** | Force-push to `main`, dropping DB tables without a migration file, deleting files not created on the current branch, deploying with failing smoke tests, hardcoded secrets, critical dependency vulnerabilities — override via `/pdlc override` (double-RED confirmation, permanently logged). *Exception:* `rm -rf` on subpaths of `/tmp/`, `/var/tmp/`, `/var/folders/`, and their `/private/`-prefixed canonical forms is exempt (ephemeral system temp). Bare temp roots are not exempt. |
| **Tier 2 pause & confirm** | `rm -rf`, `git reset --hard`, production DB migrations, editing `CONSTITUTION.md`/`DECISIONS.md` (via any tool — Bash, Edit, Write), closing all Beads tasks at once, any external API call that writes/posts/sends — PDLC stops and waits for explicit yes. *Exceptions:* (1) first-time `Write` of `CONSTITUTION.md` / `DECISIONS.md` (file does not yet exist on disk) is allowed as Tier 3 — `/setup` creates these from templates and there is no prior state to drift from; (2) `rm -rf` on subpaths of system temp roots passes through silently (same temp-path exemption as Tier 1); (3) `git reset --hard` and Bash-redirection writes to `docs/pdlc/memory/CONSTITUTION.md` / `DECISIONS.md` pass through silently when `cwd` is a subpath of a system temp root (test-fixture scenario). |
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

---

## Release process (maintainer reference)

This section documents how releases of PDLC itself are cut. Not relevant to consumers using PDLC in their own projects.

### Three install paths, all maintained

Every release must keep all three paths working. Feature work on `bin/pdlc.js`, `install.sh`, skills, and docs moves in lockstep.

1. **npmjs (default for public users):**
   ```bash
   npm install -g @pdlc-os/pdlc
   ```
2. **GitHub via npm (corporate-friendly fallback):**
   ```bash
   npm install -g github:pdlc-os/pdlc
   ```
3. **Local clone (fully air-gapped — clones over HTTPS, no registry):**
   ```bash
   git clone https://github.com/pdlc-os/pdlc.git ~/.pdlc && bash ~/.pdlc/install.sh
   ```
   Subsequent updates use `pdlc upgrade` — no need to re-run the one-liner.

### Release flow

For every shipped change:

1. **Commit the work** as `feat:` / `fix:` / `refactor:` / `docs:` / `chore:` (Conventional Commits) with a multi-paragraph body explaining the *why*, ending with the trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
2. **Bump `package.json` version** per semver:
   - `patch` (e.g. 2.13.0 → 2.13.1) — bug fixes, doc-only changes, minor tweaks
   - `minor` (e.g. 2.13.0 → 2.14.0) — new features (new commands, new skills, new agent capabilities)
   - `major` (e.g. 2.13.0 → 3.0.0) — breaking changes to user-facing behavior
3. **Commit the bump** as `chore: release vX.Y.Z` (with the same Co-Authored-By trailer).
4. **Tag** with `git tag vX.Y.Z`.
5. **Push** main and the tag: `git push origin main && git push origin vX.Y.Z`.
6. **GitHub release** via `gh release create vX.Y.Z --title "vX.Y.Z — <one-line summary>" --notes "$(cat <<'EOF' ... EOF)"`. Notes use markdown sections like Changes / Files updated / Upgrade note.
7. **`npm publish`** — mandatory, do not skip. PDLC's npmjs distribution is one of the three supported install paths; skipping this step leaves public users on a stale version. The first publish requires `npm login` (one-time per machine); subsequent publishes are non-interactive. If `npm publish` is skipped on a release, npm shows non-contiguous versions — the missed version is not backfilled later, so users who installed during the gap stay on the prior version until the next published one.

The pattern is: one feat/fix/refactor commit + one chore: release commit per release. All seven steps run for every release; none are optional.

### Hard rules

- **Never skip hooks.** `--no-verify`, `--no-gpg-sign`, etc. are forbidden unless the user explicitly authorizes for a specific commit.
- **Never run destructive git operations** (`push --force`, `reset --hard`, `branch -D`, `checkout .`) without explicit authorization.
- **Doc parity:** any change to skills, agents, hooks, or wiki must update every doc surface that references the changed thing — skill files, `docs/wiki/*`, `README.md`, `CLAUDE.md`, and any flow diagrams — in the same commit.
