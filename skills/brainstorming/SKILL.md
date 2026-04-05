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

> "PDLC memory files not found. Please run `/init` first to set up this project."

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Inception`
- **Current Feature**: `[feature-name]`
- **Current Sub-phase**: `Discover`
- **Last Checkpoint**: `Inception / Discover / [now ISO 8601]`

---

## Inception Flow

The Inception phase runs four sub-phases in strict sequence. Each sub-phase is defined in its own file under `skills/brainstorming/steps/`. Read each file completely and execute every step in it before moving to the next. Do not skip a sub-phase. Do not move forward past an approval gate without explicit human confirmation.

### Sub-phase 1 — DISCOVER

Read `skills/brainstorming/steps/01-discover.md` and execute every step completely (Steps 0–5, where Step 0 is an optional divergent ideation phase).

Return here when the discovery summary is confirmed and STATE.md shows `Define`.

### Sub-phase 2 — DEFINE

Read `skills/brainstorming/steps/02-define.md` and execute every step completely (Steps 6–7).

Return here when the PRD is approved and STATE.md shows `Design`.

### Sub-phase 3 — DESIGN

Read `skills/brainstorming/steps/03-design.md` and execute every step completely (Steps 8–11).

Return here when the design docs are approved and STATE.md shows `Plan`.

### Sub-phase 4 — PLAN

Read `skills/brainstorming/steps/04-plan.md` and execute every step completely (Steps 12–18).

Inception is complete when STATE.md shows `Inception Complete — Ready for /build`.

---

## Rules

- Never generate a PRD, design doc, or plan without completing the Discover phase first.
- Never proceed past an approval gate without explicit human confirmation. "Looks good" counts as approval; "not yet" or silence does not.
- Do not create the feature branch during Inception — that happens at the start of Construction.
- If the user wants to change scope mid-Inception (after PRD is approved), update the PRD first and re-obtain approval before updating the design docs.
- The visual companion server runs only during Inception. It must be stopped before Inception ends (Step 18).
