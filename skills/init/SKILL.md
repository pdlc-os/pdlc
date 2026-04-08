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

## Step 1 — Check prerequisites and install tooling

Read `skills/init/steps/00-prerequisites.md` and execute it completely (Steps 1a–1e: git, GitHub, Homebrew, Dolt, Beads, Agent Teams, CI/CD detection, and baseline security scan).

**Do not stop or wait for user input after prerequisites complete.** Return here and immediately continue with the Initialization Flow below.

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

### Steps 6a–6d — Roadmap Ideation

**This step follows immediately after memory file generation — do not stop or wait for user input between Steps 5–6 and Steps 6a–6d.** The transition message at the end of `03-generate-memory.md` bridges the two; read `04-roadmap.md` and continue without pausing.

Read `skills/init/steps/04-roadmap.md` and execute it completely.

Return here when the prioritized feature roadmap is captured in ROADMAP.md.

### Steps 7–9 — Finalize

Read `skills/init/steps/05-finalize.md` and execute it completely.

Return here when the initialization summary has been printed.

---

## Step 10 — Launch first feature or prompt

**If the user already chose a feature in Step 6d** (during roadmap ideation):
→ The feature is already selected and ROADMAP.md is updated. Immediately begin executing `/pdlc brainstorm [chosen-feature]`. Do not prompt again.

**If the user deferred in Step 6d** (did not choose a feature yet):

Read `docs/pdlc/memory/ROADMAP.md` and find the priority-1 feature. Ask:

> "Ready to start your first feature?
>
> The top priority on your roadmap is **[F-001]: [feature-slug]** — [description].
>
> - Say **yes** to start brainstorming it now
> - Name a **different feature** from the roadmap to start with that instead
> - Say **later** to pause — run `/pdlc brainstorm <feature-name>` when you're ready"

**If the user confirms** (yes, y, sure, go ahead):
→ Update ROADMAP.md: set the feature's status to `In Progress`.
→ Immediately begin executing `/pdlc brainstorm [feature-slug]`.

**If the user names a different feature:**
→ If it's on the roadmap: update that feature's status to `In Progress` and begin `/pdlc brainstorm [that-feature]`.
→ If it's NOT on the roadmap: add it with the next `F-NNN` ID, set status to `In Progress`, and begin brainstorm.

**If the user defers** (no, not yet, later):
→ Acknowledge:
> "No problem. Your roadmap is ready with [N] features. Run `/pdlc brainstorm [feature-slug]` whenever you want to start."

---

## Safety notes

- This command is safe to run only once. If `docs/pdlc/memory/CONSTITUTION.md` already exists, warn the user: "PDLC appears to already be initialized (docs/pdlc/memory/CONSTITUTION.md exists). Re-running init will overwrite the memory files. Are you sure? (yes/no)" — wait for confirmation before proceeding.
- Changing `CONSTITUTION.md` after init is a Tier 2 safety event. Remind the user of this at the end of the summary if they asked to set non-default architectural constraints.
