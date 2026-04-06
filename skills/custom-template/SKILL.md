---
name: your-skill-name
description: "One-line description of what this skill does"
argument-hint: <optional arguments>
---

<!-- 
  PDLC Custom Skill Template
  ==========================
  
  To create a custom skill:
  1. Copy this folder to your project: .pdlc/skills/[your-skill-name]/SKILL.md
  2. Fill in the sections below
  3. The skill becomes available as /pdlc [your-skill-name]
  
  PDLC discovers custom skills from .pdlc/skills/ in your project root.
  Built-in PDLC skills take priority on name collisions.
-->

## Description

<!-- What does this skill do? When should it be used? -->

[Describe the purpose of this skill and when the user would invoke it.]

## Lead Agent

<!-- Which agent leads this skill? Pick from the PDLC roster or use a custom agent. -->

[Agent Name] leads this skill. Read `agents/[agent].md` (or `.pdlc/agents/[custom-agent].md`) for their persona.

Before the first user-facing message, announce:

> **[Agent Name] ([Role]):** "[Greeting message explaining what they'll do.]"

## Pre-flight

<!-- What files or state should be read before starting? -->

Read these files:
1. `docs/pdlc/memory/STATE.md` — current phase and feature context
2. <!-- Add any other files this skill needs -->

## Steps

<!-- Define the step-by-step workflow. Each step should be clear and actionable. -->

### Step 1 — [Step name]

[What to do in this step.]

### Step 2 — [Step name]

[What to do in this step.]

<!-- Add as many steps as needed. -->

## User Interaction

<!-- Define any points where the skill should ask the user for input or confirmation. -->

### Approval Gates

<!-- List any points where the skill pauses for explicit user approval. -->

- After Step [N]: [what needs approval]

### User Choices

<!-- List any decision points the user will face. -->

> "What would you like to do?
> - **Option A** — [description]
> - **Option B** — [description]"

## Output

<!-- What artifacts does this skill produce? -->

- [File or artifact produced]
- [State changes made]

## Rules

<!-- Any constraints or rules specific to this skill. -->

- [Rule 1]
- [Rule 2]
