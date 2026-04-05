---
name: decision
description: "Record an architectural or product decision in the PDLC Decision Registry"
argument-hint: <decision text>
---

You are recording a decision in the PDLC Decision Registry. The argument passed to this skill is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user: "What decision would you like to record? Describe it in a sentence or two."

---

## Pre-flight

Read these files:
1. `docs/pdlc/memory/DECISIONS.md` — to determine the next ADR number
2. `docs/pdlc/memory/STATE.md` — to capture the current phase, sub-phase, and active feature

If `DECISIONS.md` does not exist, stop:
> "Decision Registry not found. Please run `/pdlc init` first."

---

## Step 1 — Classify the decision

This decision was triggered by the user explicitly issuing `/pdlc decision`. Record:
- **Source**: `User (explicit)`
- **Phase**: current phase from STATE.md (or `Any` if STATE.md shows Idle)
- **Agent**: `—` (user-initiated, not agent-initiated)

---

## Step 2 — Impact assessment

Before committing the decision to the registry, all agents assess whether this decision has material impact on existing PDLC artifacts. Read the following files and evaluate each:

| File | Assessor | Check |
|------|----------|-------|
| `docs/pdlc/memory/CONSTITUTION.md` | **Phantom** | Does this decision change security constraints, test gates, safety guardrails, or coding standards? |
| `docs/pdlc/memory/INTENT.md` | **Oracle** | Does this decision change the problem statement, target user, or value proposition? |
| `docs/pdlc/design/[feature]/ARCHITECTURE.md` | **Neo** | Does this decision change the system architecture, data model, or API contracts? (Only if a feature is active and design docs exist.) |
| `docs/pdlc/memory/ROADMAP.md` | **Oracle** | Does this decision affect feature priority, scope, or introduce/remove features? |
| Active PRD (if any) | **Oracle** | Does this decision change requirements, acceptance criteria, or scope of the current feature? |
| `docs/pdlc/memory/OVERVIEW.md` | **Jarvis** | Does this decision change the description of shipped functionality or known tech debt? |

For each file where an agent identifies a material impact:
- Describe the specific change needed (what section, what the current text says, what it should say)
- Name the agent who identified it

---

## Step 3 — Present impact summary to user

**If no impacts found:**

> "No cross-cutting impacts detected. Ready to record this decision."

Proceed directly to Step 4.

**If impacts found:**

> "This decision has cross-cutting impacts on the following files:
>
> [For each impacted file:]
> - **[filename]** ([Agent]): [description of the change needed]
>
> Shall I apply these changes and record the decision? (yes/no)"

Wait for user confirmation.

- **If yes**: Apply all the identified changes to each affected file. Update their `Last updated` dates. Then proceed to Step 4.
- **If no**: Ask which changes to skip, or if the user wants to modify the decision. Iterate until the user confirms. If the user cancels entirely, stop without recording.

---

## Step 4 — Record in the Decision Registry

Determine the next ADR number by reading `docs/pdlc/memory/DECISIONS.md` and finding the highest existing `ADR-NNN`. Increment by 1. If no entries exist, start at `ADR-001`.

Append the following entry to `docs/pdlc/memory/DECISIONS.md`:

```markdown
---

### ADR-[NNN]: [Decision title — short summary]

**Date:** [today YYYY-MM-DD]
**Source:** [User (explicit) | PDLC flow]
**Phase:** [current phase from STATE.md]
**Sub-phase:** [current sub-phase, or — if none]
**Agent:** [agent name who initiated, or — if user-initiated]
**Feature:** [current feature from STATE.md, or — if none]
**Status:** Active

**Decision:** [The full decision text]

**Context:** [Why this decision was made — what problem it solves or what constraint it responds to]

**Alternatives considered:**
- [If known, list what was considered and rejected. If user-initiated and not discussed, write "Not discussed — user decision."]

**Impact:**
- [List each file that was updated as a result, or "No cross-cutting impacts."]
```

Update the `Last updated` date at the top of DECISIONS.md.

---

## Step 5 — Confirm to user

> "Decision recorded as **ADR-[NNN]**: [title]
> [If impacts were applied:] Updated: [list of files changed]"

---

## Rules

- Never skip the impact assessment. Even if the decision seems minor, check all files.
- Never modify files without user approval during the impact assessment.
- The decision registry is append-only. Never delete or modify existing entries. Mark superseded decisions as `[SUPERSEDED by ADR-NNN]` in their Status field.
- When called from within another skill (review Step 14, reflect Step 7), the Source and Agent fields are set by the calling skill, not by this one.
