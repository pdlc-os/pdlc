---
name: init
description: "Initialize PDLC for this project (run once)"
---

You are initializing the PDLC (Product Development Lifecycle) plugin for this project. Follow every step below in order. Do not skip steps.

## Lead Agent: Oracle (Product Manager)

Oracle leads the entire Initialization phase. Embody Oracle's product-minded perspective — clear problem framing, explicit success criteria, and sharp prioritization — throughout all Init steps, especially the Socratic questions in Step 4. Read `agents/oracle.md` for Oracle's full persona.

Before the first user-facing message, read `skills/formatting.md` for the visual patterns, then output a **Phase Transition Banner** for "INIT" followed by:

> **Oracle (Product Manager):** "Hey there! Oracle here — your Product Manager. I'll be leading the setup for your project. We're going to nail down the problem statement, define your target user, choose the right tech stack, and set the team standards. Let's build a solid foundation together."

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
> Once that completes, re-run `/pdlc init` and we'll continue from here."

Then run `npm install -g @beads/bd` if the user confirms, or wait for them to install it manually. Re-run `bd --version` to confirm success before proceeding. Do not continue until `bd --version` succeeds.

**1b. Verify a git repository exists.**

Run: `git status`

If the command returns a "not a git repository" error, stop and tell the user:

> "No git repository found. Please run `git init` (and make at least one commit) before running `/pdlc init`."

Do not proceed until `git status` succeeds.

---

## Initialization Flow

The initialization runs five groups of steps in strict sequence. Each group is defined in its own file under `skills/init/steps/`. Read each file completely and execute every step in it before moving to the next.

### Steps 2–3 — Setup

Read `skills/init/steps/01-setup.md` and execute it completely.

Return here when directory structure is created.

### Step 4 — Socratic Initialization

Read `skills/init/steps/02-socratic-init.md` and execute it completely.

Return here when all answers are collected (or the user typed `skip`).

### Steps 5–6 — Generate Memory Files

Read `skills/init/steps/03-generate-memory.md` and execute it completely.

Return here when all memory files and the episodes index are created.

### Steps 6a–6c — Roadmap Ideation

Read `skills/init/steps/04-roadmap.md` and execute it completely.

Return here when the prioritized feature roadmap is captured in ROADMAP.md.

### Steps 7–9 — Finalize

Read `skills/init/steps/05-finalize.md` and execute it completely.

Return here when the initialization summary has been printed.

---

## Step 10 — Prompt for next phase

After printing the initialization summary, ask the user:

> "Would you like to start Inception now and brainstorm your first feature?
>
> - Say **yes** (or provide a feature name) to begin immediately
> - Or type `/pdlc brainstorm <feature-name>` at any time to start manually"

**If the user responds with "yes", "y", "sure", "go ahead", or any clear affirmative** (with or without a feature name):
→ Ask "What feature would you like to start with?" if no feature name was given, then immediately begin executing the `/pdlc brainstorm` flow.

**If the user provides a feature name directly** (e.g. "yes, user-auth" or just "user-auth"):
→ Immediately begin executing `/pdlc brainstorm user-auth` without any further prompting.

**If the user responds with "no", "not yet", "later", or any deferral**:
→ Acknowledge and stop:
> "No problem. When you're ready, run `/pdlc brainstorm <feature-name>` to start Inception."

---

## Safety notes

- This command is safe to run only once. If `docs/pdlc/memory/CONSTITUTION.md` already exists, warn the user: "PDLC appears to already be initialized (docs/pdlc/memory/CONSTITUTION.md exists). Re-running init will overwrite the memory files. Are you sure? (yes/no)" — wait for confirmation before proceeding.
- Changing `CONSTITUTION.md` after init is a Tier 2 safety event. Remind the user of this at the end of the summary if they asked to set non-default architectural constraints.
