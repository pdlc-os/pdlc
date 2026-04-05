---
name: init
description: "Initialize PDLC for this project (run once)"
---

You are initializing the PDLC (Product Development Lifecycle) plugin for this project. Follow every step below in order. Do not skip steps.

---

## Step 1 — Check prerequisites

**1a. Verify Beads is installed.**

Run: `bd --version`

If the command is not found, tell the user:

> "Beads (`bd`) is not installed — it's required for PDLC's task management.
>
> **Install it now?**
> Run: `npm install -g @beads/bd`
>
> Once that completes, re-run `/init` and we'll continue from here."

Then run `npm install -g @beads/bd` if the user confirms, or wait for them to install it manually. Re-run `bd --version` to confirm success before proceeding. Do not continue until `bd --version` succeeds.

**1b. Verify a git repository exists.**

Run: `git status`

If the command returns a "not a git repository" error, stop and tell the user:

> "No git repository found. Please run `git init` (and make at least one commit) before running `/init`."

Do not proceed until `git status` succeeds.

---

## Step 2 — Detect brownfield repository

Check whether this is an existing repository with pre-existing source code, or a brand new empty project.

Run:
```bash
git log --oneline -1 2>/dev/null && git ls-files | grep -v '^docs/pdlc/' | grep -v '^\.' | head -20
```

**If the output shows no files** (empty repo or only dotfiles/config): this is a **greenfield project**. Skip to Step 3.

**If the output shows existing source files** (any `.js`, `.ts`, `.py`, `.rb`, `.go`, `.rs`, `.java`, `.cs`, `.html`, `.css`, or similar): this is a **brownfield project**.

For a brownfield project, tell the user:

> "I can see this repository already contains code. I can perform a deep scan of the existing codebase to automatically generate your memory bank with real content — existing features, architecture, decisions, and tech debt — rather than starting from blank templates.
>
> **Would you like me to scan the existing repository before we continue?** (yes/no)
>
> - **Yes** — I'll analyse the codebase and pre-populate your memory files. You'll review and approve my findings before anything is written.
> - **No** — We'll continue with the standard Socratic questions and blank templates."

**If the user says yes:** run the full `skills/repo-scan/SKILL.md` protocol now. The repo scan will:
1. Map the repo structure and read key files
2. Synthesise findings into a structured summary
3. Present the summary for your review and approval
4. Use approved findings to pre-populate all memory files in Step 5

After the repo scan completes and the user approves the findings, **skip Step 4 (Socratic questions) and go directly to Step 5**, using the scan-generated files instead of template stubs. The scan findings are treated as pre-filled answers.

**If the user says no:** continue to Step 3 as normal.

---

## Step 3 — Create the directory structure

Create the following directories (use `mkdir -p` to create all levels at once):

```
docs/pdlc/memory/episodes/
docs/pdlc/prds/plans/
docs/pdlc/design/
docs/pdlc/reviews/
```

Run these commands:
```bash
mkdir -p docs/pdlc/memory/episodes
mkdir -p docs/pdlc/prds/plans
mkdir -p docs/pdlc/design
mkdir -p docs/pdlc/reviews
mkdir -p docs/pdlc/brainstorm
mkdir -p docs/pdlc/mom
```

Confirm each directory was created. Tell the user which directories were created.

---

## Step 4 — Socratic initialization

> **Skip this step if the user accepted the brownfield repo scan in Step 2.** The scan already generated the memory files. Jump to Step 6.

Before asking the first question, print this notice in blue text using ANSI escape codes:

```
\x1b[34mTip: You can type 'skip' at any time to stop the questions and proceed with whatever information has been collected so far.\x1b[0m
```

Ask the user the following questions **one at a time**. Wait for a complete answer before asking the next question. Do not batch questions together.

After each answer, check: **if the user's response is exactly `skip` (case-insensitive), stop asking questions immediately and proceed to Step 5 using whatever answers have been collected.** Leave unanswered fields as placeholders in the generated files.

Ask each question exactly as written:

1. "What is the name of your project?"
2. "In one sentence, what problem does it solve?"
3. "Who is your primary target user? (Describe them in 2–3 sentences: who they are, what they want, what frustrates them.)"
4. "What tech stack are you using? (e.g. Next.js + PostgreSQL + Vercel, or Rails + React + Heroku)"
5. "What are your non-negotiable architectural constraints, if any? (e.g. 'all business logic in service layer', 'no raw SQL in controllers', or 'none' if you have no constraints yet)"
6. "Which test layers do you want to enforce as required gates — meaning Construction cannot move to Operation unless these pass? Choose from: Unit, Integration, E2E, Performance, Accessibility, Visual Regression. (Default: Unit + Integration. You can change this later in CONSTITUTION.md.)"
7. "Are there any Tier 2 safety actions you want to auto-approve for your team? These normally pause and wait for explicit confirmation before proceeding. The full list of Tier 2 actions is:
   - `rm -rf` or bulk deletes
   - `git reset --hard`
   - Running DB migrations in production
   - Changing CONSTITUTION.md
   - Closing all open Beads tasks at once
   - External API calls that write/post/send (Slack, email, webhooks)
   
   List which of these (if any) you want to downgrade to Tier 3 (logged warning, no pause), or say 'none'."

Store all answers. You will use them to fill in the memory files below.

---

## Step 5 — Generate memory files

Using the answers from Step 4, create all 7 memory files. Use today's date (ISO format: YYYY-MM-DD) wherever a date is required.

### 5a. `docs/pdlc/memory/CONSTITUTION.md`

Create this file based on the `templates/CONSTITUTION.md` structure. Fill in the following from the user's answers:

- **Project name** (header and metadata): from question 1
- **Tech Stack table** (Section 1): parse the tech stack answer from question 4 and fill in rows. Infer reasonable layer labels. Leave rationale cells blank if none given.
- **Architectural Constraints** (Section 3): use the answer from question 5. If "none", leave the placeholder bullets.
- **Test Gates** (Section 7): check the boxes the user selected in question 6. Uncheck all others.
- **Safety Guardrail Overrides** (Section 8): populate the table with any items from question 7. If "none", leave the placeholder row.
- Set `Last updated:` to today's date.

Leave all other sections with their default placeholder text — do not remove comments or examples.

### 5b. `docs/pdlc/memory/INTENT.md`

Create this file based on the `templates/INTENT.md` structure. Fill in:

- **Project name**: from question 1
- **Problem Statement**: expand the one-sentence answer from question 2 into a 2–4 sentence description. Stay faithful to the user's answer — do not invent new problems.
- **Target User (Persona)**: use the answer from question 3. Format as "**Primary: [persona label]**" followed by the description.
- **Core Value Proposition**: draft one sentence in the "Only [product] lets [user] [achieve outcome]" format, derived from questions 1–3.
- **Created** and **Last updated**: today's date.

Leave the success metrics table and out-of-scope / constraints sections with placeholder text.

### 5c. `docs/pdlc/memory/STATE.md`

Create this file based on the `templates/STATE.md` structure. Set:

- **Current Phase**: `Initialization`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Initialization / — / [today's date]T00:00:00Z`
- **Phase History table**: one row — today's timestamp, event `init`, Phase `Initialization`, Sub-phase `—`, Feature `none`
- **Last updated**: today's date and time (ISO 8601)

### 5d. `docs/pdlc/memory/ROADMAP.md`

Create this file with stub content:

```markdown
# Roadmap

**Project:** [project name from question 1]
**Last updated:** [today's date]

---

## Current Focus

<!-- Populated after first /brainstorm session. -->

---

## Planned Features

<!-- Add features here as they are defined via /brainstorm. -->

| # | Feature | Status | Target |
|---|---------|--------|--------|
| — | — | — | — |

---

## Completed Features

<!-- Auto-populated from docs/pdlc/memory/episodes/index.md after each ship. -->

<!-- None yet. -->
```

### 5e. `docs/pdlc/memory/DECISIONS.md`

Create this file with stub content:

```markdown
# Architectural Decision Log

**Project:** [project name from question 1]
**Last updated:** [today's date]

<!-- Decisions recorded here use a lightweight ADR format.
     Each entry: what was decided, why, what was considered and rejected.
     PDLC agents (Neo, Phantom, Jarvis) append entries here during Build and Review.
     Do not delete entries — mark superseded decisions as [SUPERSEDED by ADR-NNN]. -->

---

<!-- No decisions recorded yet. The first entries will appear after /brainstorm. -->
```

### 5f. `docs/pdlc/memory/CHANGELOG.md`

Create this file with stub content:

```markdown
# Changelog

**Project:** [project name from question 1]

<!-- Format: Conventional — newest entries at top.
     Each entry added by Jarvis during the Ship sub-phase.
     Format per release:

     ## v[X.Y.Z] — [YYYY-MM-DD]
     ### Added
     - ...
     ### Changed
     - ...
     ### Fixed
     - ...
     ### Breaking Changes
     - ... (only if applicable)
-->

---

<!-- No releases yet. -->
```

### 5g. `docs/pdlc/memory/OVERVIEW.md`

Create this file based on the `templates/OVERVIEW.md` structure. Fill in:

- **Project name**: from question 1
- **Project Summary**: a 1–2 sentence description derived from questions 1–3.
- **Last updated**: today's date

Leave the Active Functionality, Shipped Features, Architecture Summary, Known Tech Debt, and Decision Log Summary sections with their default placeholder text.

---

## Step 6 — Create the episodes index

Create `docs/pdlc/memory/episodes/index.md` with this content:

```markdown
# Episode Index

**Project:** [project name from question 1]
**Last updated:** [today's date]

<!-- This file is the searchable index of all PDLC feature episodes.
     Each row is auto-appended by PDLC during the Reflect sub-phase after a feature ships.
     Do not edit manually. -->

| # | Feature | Date Shipped | Episode File | PR | Status |
|---|---------|-------------|--------------|-----|--------|
| — | — | — | — | — | — |
```

---

## Step 7 — Initialize Beads

Run: `bd init --quiet`

This creates the `.beads/` directory in the project root, which stores the task graph locally.

If `bd init` fails, show the user the error output and tell them:

> "Beads initialization failed. Check the error above. Common causes: permissions issue in the project directory, or `bd` version mismatch. Re-run `bd init` manually to debug."

If `bd init` succeeds, continue.

---

## Step 8 — Update STATE.md

Update `docs/pdlc/memory/STATE.md`:

- **Current Phase**: `Initialization Complete — Ready for /brainstorm`
- **Last Checkpoint**: `Initialization / Complete / [today's datetime ISO 8601]`
- **Last updated**: now

Append a row to the Phase History table:
```
| [now] | init_complete | Initialization Complete | — | none |
```

---

## Step 9 — Print initialization summary

Print a clear summary to the user.

**For greenfield projects (no repo scan):**

```
PDLC initialized successfully. ✓

Files created:
  docs/pdlc/memory/CONSTITUTION.md
  docs/pdlc/memory/INTENT.md
  docs/pdlc/memory/STATE.md
  docs/pdlc/memory/ROADMAP.md
  docs/pdlc/memory/DECISIONS.md
  docs/pdlc/memory/CHANGELOG.md
  docs/pdlc/memory/OVERVIEW.md
  docs/pdlc/memory/episodes/index.md

Directories created:
  docs/pdlc/memory/episodes/
  docs/pdlc/prds/plans/
  docs/pdlc/design/
  docs/pdlc/reviews/

Beads initialized: .beads/ created in project root.

Next step: run /brainstorm <feature-name> to start your first feature.
```

**For brownfield projects (repo scan ran):**

```
PDLC initialized successfully with repo scan. ✓

Memory bank pre-populated from existing codebase:
  docs/pdlc/memory/CONSTITUTION.md  ← tech stack + observed constraints filled in
  docs/pdlc/memory/INTENT.md        ← inferred from README + code (review & verify)
  docs/pdlc/memory/STATE.md
  docs/pdlc/memory/ROADMAP.md
  docs/pdlc/memory/DECISIONS.md     ← [N] pre-PDLC decisions recorded (inferred)
  docs/pdlc/memory/CHANGELOG.md     ← pre-PDLC baseline entry added
  docs/pdlc/memory/OVERVIEW.md      ← existing features documented
  docs/pdlc/memory/episodes/index.md

Beads initialized: .beads/ created in project root.

  ⚠  Inferred content is marked "(inferred — please verify)" throughout.
     Review INTENT.md and OVERVIEW.md before your first /brainstorm session.

Next step: run /brainstorm <feature-name> to start your first feature.
```

Replace counts (e.g. `[N] decisions`) with actual numbers from the scan.

---

## Step 10 — Prompt for next phase

After printing the initialization summary, ask the user:

> "Would you like to start Inception now and brainstorm your first feature?
>
> - Say **yes** (or provide a feature name) to begin immediately
> - Or type `/brainstorm <feature-name>` at any time to start manually"

**If the user responds with "yes", "y", "sure", "go ahead", or any clear affirmative** (with or without a feature name):
→ Ask "What feature would you like to start with?" if no feature name was given, then immediately begin executing the `/brainstorm` flow.

**If the user provides a feature name directly** (e.g. "yes, user-auth" or just "user-auth"):
→ Immediately begin executing `/brainstorm user-auth` without any further prompting.

**If the user responds with "no", "not yet", "later", or any deferral**:
→ Acknowledge and stop:
> "No problem. When you're ready, run `/brainstorm <feature-name>` to start Inception."

---

## Safety notes

- This command is safe to run only once. If `docs/pdlc/memory/CONSTITUTION.md` already exists, warn the user: "PDLC appears to already be initialized (docs/pdlc/memory/CONSTITUTION.md exists). Re-running init will overwrite the memory files. Are you sure? (yes/no)" — wait for confirmation before proceeding.
- Changing `CONSTITUTION.md` after init is a Tier 2 safety event. Remind the user of this at the end of the summary if they asked to set non-default architectural constraints.
