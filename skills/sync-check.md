# Remote Sync Check Protocol

Reusable protocol for detecting and resolving divergence between local and remote main branches. Referenced by brainstorm, build, ship, hotfix, and rollback pre-flight steps.

---

## When to run

Run this check at the start of any phase that depends on main being current:
- `/pdlc brainstorm` — before creating brainstorm log
- `/pdlc build` — before creating/switching to feature branch
- `/pdlc ship` — before the merge gate
- `/pdlc hotfix` — before branching from main
- `/pdlc rollback` — before reverting on main

---

## Step 1 — Fetch and compare

```bash
git fetch origin main 2>/dev/null
```

Count how many commits local is behind remote:
```bash
git rev-list HEAD..origin/main --count 2>/dev/null
```

Also count how many commits local is ahead:
```bash
git rev-list origin/main..HEAD --count 2>/dev/null
```

**If 0 commits behind:** proceed silently. No sync issue.

**If behind (1+ commits):** continue to Step 2.

---

## Step 2 — Inform the user

> "Your local `main` is **[N] commits behind** `origin/main`. Changes were pushed to the remote while you were working.
>
> I'm convening a quick team meeting to assess the remote changes before we proceed."

---

## Step 3 — Sync Assessment Meeting

The lead agent for the current phase convenes a lightweight team meeting. Read `skills/build/party/orchestrator.md` for spawn mode and durable checkpoint protocol.

Write `.pending-party.json` with `meetingType: "sync-assessment"`.

### Meeting announcement

Output a **Meeting Announcement Block** per `skills/formatting.md`:
- **Called by:** [Lead Agent Name] ([Role])
- **Participants:** Neo, Oracle, Bolt, Friday, Echo, Phantom — 6 agents (skip Muse, Jarvis, Pulse unless the phase specifically needs them)
- **Purpose:** Assess [N] remote commits on main before proceeding with [phase]
- **Estimated time:** ~1–2 minutes

### Context gathering

Before spawning agents, gather the remote diff:
```bash
git log --oneline origin/main..HEAD  # local-only commits (if any)
git log --oneline HEAD..origin/main  # remote-only commits
git diff HEAD..origin/main --stat    # files changed on remote
```

If on a feature branch, also check overlap:
```bash
git diff HEAD..origin/main --name-only > /tmp/remote-changes.txt
git diff main..HEAD --name-only > /tmp/local-changes.txt
comm -12 <(sort /tmp/remote-changes.txt) <(sort /tmp/local-changes.txt)  # overlapping files
```

### Agent assessment

Each agent evaluates from their domain:

| Agent | Assesses |
|-------|----------|
| **Neo** | Do the remote changes affect architecture? Are there new components, changed boundaries, or modified design docs? |
| **Oracle** | Do the remote changes affect the roadmap, PRDs, or feature scope? Did someone ship a feature that changes priorities? |
| **Bolt** | Do the remote changes conflict with backend code we're working on? Schema changes, API modifications? |
| **Friday** | Do the remote changes conflict with frontend code? Component changes, state management updates? |
| **Echo** | Do the remote changes include new tests or modify existing ones that overlap with our work? |
| **Phantom** | Do the remote changes introduce security implications? New dependencies, auth changes? |

Each agent produces:
```
Agent: [name]
Conflict risk: [None / Low / Medium / High]
Overlapping files: [list or "none"]
Impact summary: [1-2 sentences]
Recommendation: [pull now / review first / proceed with caution]
```

### Synthesize and write MOM

Write to: `docs/pdlc/mom/sync-assessment_[date].md`

The MOM includes:
- Remote commit summary ([N] commits by [authors])
- File overlap analysis
- Per-agent assessments
- Conflict risk consensus (None / Low / Medium / High)
- Team recommendation

Update `.pending-party.json`: set `"progress": "mom-written"`.

---

## Step 4 — Present options to user

Based on the team's assessment, present recommendations:

### If conflict risk is None or Low:

> "**Sync assessment complete.** [N] commits on remote, **low conflict risk**.
>
> Team recommendation: pull and continue.
>
> - **Pull and continue** — `git pull --rebase origin main` then proceed
> - **Review changes first** — show the full diff before deciding
> - **Proceed without pulling** — risk merge conflicts later"

### If conflict risk is Medium:

> "**Sync assessment complete.** [N] commits on remote, **medium conflict risk**.
>
> [List overlapping files]
>
> Team recommendation: review before pulling.
>
> - **Review and pull** — show the diff, then pull if it looks safe
> - **Pull and resolve** — pull now, resolve any conflicts immediately
> - **Proceed without pulling** — risk harder merge conflicts at ship time"

### If conflict risk is High:

> "**Sync assessment complete.** [N] commits on remote, **high conflict risk**.
>
> [List overlapping files and specific concerns from agents]
>
> Team recommendation: review carefully before proceeding.
>
> - **Review changes** — show the full diff and agent concerns
> - **Pull and resolve** — pull now, but expect conflicts in [files]
> - **Pause and investigate** — stop the current flow and examine what changed
> - **Proceed anyway** — risk significant merge conflicts (not recommended)"

---

## Step 5 — Execute the user's choice

### Pull and continue / Pull and resolve

```bash
git pull --rebase origin main
```

If rebase has conflicts:
> "Rebase has conflicts in [files]. Please resolve them, then I'll continue."

Wait for resolution. After clean rebase, proceed with the phase.

If on a feature branch during build:
```bash
git checkout feature/[feature-name]
git rebase main
```

### Review changes first / Review and pull

Show the diff:
```bash
git log --oneline HEAD..origin/main
git diff HEAD..origin/main
```

After the user reviews, ask: "Pull these changes? (yes/no)"

If yes: execute the pull. If no: proceed without pulling (user accepts the risk).

### Proceed without pulling

Log a Tier 3 warning in STATE.md:
```
| [now] | sync_skipped | [phase] | [sub-phase] | [feature] |
```

Proceed with the phase. The user will encounter the divergence at push time during ship.

### Pause and investigate

Set STATE.md to current checkpoint. Stop. The user examines the changes manually and decides what to do.

---

## Step 6 — Clean up

Delete `.pending-party.json`.

Proceed with the phase's normal flow.

---

## Rules

- The sync check is a **pre-flight** operation — it runs before the phase starts, not during.
- The meeting is lightweight (6 agents, ~1-2 minutes) — not a full 9-agent Decision Review.
- If `git fetch` fails (no network), proceed silently with a warning: "Couldn't reach remote — proceeding with local state."
- The sync check does NOT run during `/pdlc decision`, `/pdlc whatif`, `/pdlc doctor`, `/pdlc pause`, or `/pdlc resume` — these are non-phase operations.
- If the user chooses "proceed without pulling," the divergence is logged but not blocked — it's the user's choice.
