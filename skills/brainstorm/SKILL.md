---
name: brainstorm
description: "Run the Inception phase for a feature (Discover → Define → Design → Plan)"
argument-hint: <feature-name>
---

You are running the Inception phase for a feature. The argument passed to this skill is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user: "What feature would you like to brainstorm? (Provide a short slug, e.g. `user-auth` or `billing-integration`)"

The feature name (slug) must be kebab-case (lowercase, hyphens, no spaces). If the user provides a name with spaces, convert it automatically (e.g. "user auth" → `user-auth`) and confirm with them.

Store the feature slug as `[feature-name]`. Use today's date as `[YYYY-MM-DD]` wherever dates appear in file names and metadata.

---

## Pre-flight: Load project context

Before anything else, read these two files completely:

1. `docs/pdlc/memory/CONSTITUTION.md` — for tech stack, architectural constraints, test gates, and coding standards
2. `docs/pdlc/memory/INTENT.md` — for the core problem, target user, and value proposition

If either file is missing, stop and tell the user:

> "PDLC memory files not found. Please run `/pdlc init` first to set up this project."

### Brainstorm log — create or resume

Store the brainstorm log path as `[brainstorm-log]` = `docs/pdlc/brainstorm/brainstorm_[feature-name]_[YYYY-MM-DD].md`

Check whether `[brainstorm-log]` already exists:

**If it exists:** Read it completely. Reconstruct the full context of what has been covered — which divergent ideas were generated, which Socratic questions were asked and answered, whether the adversarial review was run, what external context was ingested. Then tell the user:

> "Found an existing brainstorm log for `[feature-name]`. Resuming from where we left off.
> Last recorded section: [name the last populated section in the file]"

Skip any steps whose output is already captured in the log and resume from the first incomplete step.

**If it does not exist:** Create it now with this structure:

```markdown
---
feature: [feature-name]
date: [YYYY-MM-DD]
status: in-progress
last-updated: [now ISO 8601]
approved-by:
approved-date:
prd:
---

# Brainstorm Log: [Feature Name]

## Divergent Ideation
_Not run._

## Socratic Discovery
_In progress._

## Adversarial Review
_Not run._

## External Context
_None ingested._

## Discovery Summary
_Pending._
```

Run:
```bash
mkdir -p docs/pdlc/brainstorm
```

Save the file to `[brainstorm-log]`.

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Inception`
- **Current Feature**: `[feature-name]`
- **Current Sub-phase**: `Discover`
- **Last Checkpoint**: `Inception / Discover / [now ISO 8601]`

Update `docs/pdlc/memory/ROADMAP.md`: find the row matching `[feature-name]` and set its **Status** to `In Progress`. If no matching row exists, append a new row with the next available `F-NNN` ID, the feature name, status `In Progress`, and `—` for Shipped/Episode. Update the file's **Last updated** date.

---

## Lead Agent Assignments

Inception has two lead agents with a handoff at the Define→Design boundary:

| Sub-phases | Lead Agent | Why |
|------------|-----------|-----|
| Discover + Define (Steps 0–8) | **Oracle** (Product Manager) | Problem framing, user discovery, requirements, PRD writing |
| Design + Plan (Steps 9–19) | **Neo** (Architect) | Architecture, data model, API contracts, task decomposition |

Read the lead agent's full persona from `agents/oracle.md` or `agents/neo.md` and embody their perspective throughout their sub-phases.

Before the first user-facing message, read `skills/formatting.md` for the visual patterns, then output a **Phase Transition Banner** for "BRAINSTORM" (with the feature name) followed by:

> **Oracle (Product Manager):** "Oracle here again! Time to brainstorm `[feature-name]`. I'll be leading Discover and Define — we're going to dig into the problem, talk to the right people (that's you!), and shape this into a solid PRD. Let's figure out what we're really building."

---

## Inception Flow

The Inception phase runs four sub-phases in strict sequence. Each sub-phase is defined in its own file under `skills/brainstorm/steps/`. Read each file completely and execute every step in it before moving to the next. Do not skip a sub-phase. Do not move forward past an approval gate without explicit human confirmation.

### Sub-phase 1 — DISCOVER (Lead: Oracle)

Before starting, output a **Sub-phase Transition Header** (per `skills/formatting.md`) for "DISCOVER".

Read `skills/brainstorm/steps/01-discover.md` and execute every step completely (Steps 0–6, where Step 0 is optional divergent ideation and Step 4 is edge case analysis).

Return here when the discovery summary is confirmed and STATE.md shows `Define`.

### Sub-phase 2 — DEFINE (Lead: Oracle)

Output a **Sub-phase Transition Header** for "DEFINE".

Read `skills/brainstorm/steps/02-define.md` and execute every step completely (Steps 7–8).

Return here when the PRD is approved and STATE.md shows `Design`.

### — HANDOFF: Oracle → Neo —

After the PRD is approved and before starting Design, output an **Agent Handoff** block (per `skills/formatting.md`) with:

> **Oracle (Product Manager):** "The PRD is locked and approved — great work getting the requirements nailed down! I had a blast shaping this with you. I'm handing you over to Neo now — there's nobody better to turn these requirements into a rock-solid architecture. You're in excellent hands."
>
> **Neo (Architect):** "Thanks, Oracle. Hey — Neo here, your Architect. I've read the PRD and I'm excited to get my hands on this. Time to translate all those requirements into architecture, data models, and API contracts. Let's design something we'll be proud to build."

### Sub-phase 3 — DESIGN (Lead: Neo)

Output a **Sub-phase Transition Header** for "DESIGN".

Read `skills/brainstorm/steps/03-design.md` and execute every step completely (Steps 9–12).

Return here when the design docs are approved and STATE.md shows `Plan`.

### Sub-phase 4 — PLAN (Lead: Neo)

Output a **Sub-phase Transition Header** for "PLAN".

Read `skills/brainstorm/steps/04-plan.md` and execute every step completely (Steps 13–19).

Inception is complete when STATE.md shows `Inception Complete — Ready for /pdlc build`.

---

## Rules

- Never generate a PRD, design doc, or plan without completing the Discover phase first.
- Never proceed past an approval gate without explicit human confirmation. "Looks good" counts as approval; "not yet" or silence does not.
- Do not create the feature branch during Inception — that happens at the start of Construction.
- If the user wants to change scope mid-Inception (after PRD is approved), update the PRD first and re-obtain approval before updating the design docs.
- The visual companion server runs only during Inception. It must be stopped before Inception ends (Step 18).
- The user can issue `/pdlc decision <text>` at any point during Inception to record a decision. This pauses the current flow, runs a full Decision Review Party, and after the decision is recorded, offers to resume Inception from the last STATE.md checkpoint. Any artifacts updated by the decision (PRD, architecture, roadmap) are automatically picked up on resume.
