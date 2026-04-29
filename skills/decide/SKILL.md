---
name: decide
description: "Record an architectural or product decision in the PDLC Decision Registry"
argument-hint: <decision text>
---

You are recording a decision in the PDLC Decision Registry. The argument passed to this skill is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user: "What decision would you like to record? Describe it in a sentence or two."

## Lead Agent: mirrors current phase

The lead agent for the decision flow matches whoever is leading the current phase/sub-phase when `/pdlc decide` is issued. Read `docs/pdlc/memory/STATE.md` to determine the active phase and sub-phase, then select the lead:

| Phase | Sub-phase | Lead Agent |
|-------|-----------|-----------|
| Initialization | any | **Atlas** (Product Manager) |
| Inception | Discover, Define | **Atlas** (Product Manager) |
| Inception | Design, Plan | **Neo** (Architect) |
| Construction | any | **Neo** (Architect) |
| Operation | Ship, Verify | **Pulse** (DevOps) |
| Operation | Reflect | **Jarvis** (Tech Writer) |
| Idle / between phases | — | **Atlas** (Product Manager) |

Read the lead agent's full persona from their agent file and embody their perspective throughout the decision flow.

Before the first user-facing message, read `skills/formatting.md` for the visual patterns, then output a **Sub-phase Transition Header** for "DECISION REVIEW" followed by the lead agent's greeting:

> **[Lead Agent Name] ([Role]):** "[Agent-appropriate greeting]. I'll run a Decision Review with the full team to assess how this affects the project. Let me gather everyone."

---

## Pre-flight

Read these files:
1. `docs/pdlc/memory/DECISIONS.md` — to determine the next ADR number
2. `docs/pdlc/memory/STATE.md` — to capture the current phase, sub-phase, active feature, and last checkpoint

If `DECISIONS.md` does not exist, stop:
> "Decision Registry not found. Please run `/pdlc init` first."

### Check for interrupted decision

Check if `docs/pdlc/memory/.pending-decision.json` exists. If it does, a previous decision flow was interrupted before completing.

Read the file and present to the user:

> "Found an interrupted decision from a previous session:
>
> - **Decision:** [decision text from file]
> - **Started:** [timestamp from file]
> - **Phase at time:** [phase from file]
> - **Progress:** [last completed step from file]
>
> What would you like to do?
> - **Resume** — continue this decision from where it left off
> - **Restart** — start fresh (re-runs the full Decision Review)
> - **Discard** — cancel the old decision and proceed with the new one
> - **Discard all** — cancel the old decision without recording a new one"

If the user chooses **Resume**: read the pending decision file for any saved MOM or assessment state and skip to the appropriate step. If the MOM was already written, skip to Step 3 (present to user). If assessments were done but MOM not written, skip to Step 2c. Otherwise start from Step 2.

If the user chooses **Restart** or **Discard**: delete `.pending-decision.json` and proceed with the current decision.

If the user chooses **Discard all**: delete `.pending-decision.json` and stop.

---

## Step 1 — Checkpoint, persist, and classify

### 1a — Save decision to durable file

Write `docs/pdlc/memory/.pending-decision.json`:

```json
{
  "decision": "[the full decision text]",
  "source": "User (explicit)",
  "timestamp": "[now ISO 8601]",
  "phase": "[current phase from STATE.md]",
  "subPhase": "[current sub-phase]",
  "feature": "[current feature]",
  "lastCheckpoint": "[Last Checkpoint from STATE.md]",
  "resumeCommand": "[/pdlc brainstorm or /pdlc build or /pdlc ship, based on phase]",
  "progress": "started"
}
```

This file is the recovery mechanism. It survives session loss, network failures, and usage limits. It is deleted at the end of Step 6 when the decision is fully recorded.

### 1b — Display checkpoint to user

**If a phase is active** (not Idle, not a `Complete — Ready for` state):

> "Pausing **[phase] / [sub-phase]** at checkpoint `[last checkpoint value]`.
> Decision: *[decision text]*
>
> Your progress is saved. If this session is interrupted:
> - Run `/pdlc decide` — PDLC will detect the pending decision and offer to resume
> - Run `[resume command]` — resumes the [phase] workflow from its last checkpoint"

**If no phase is active:**

> "Decision: *[decision text]*
>
> Your progress is saved. If this session is interrupted:
> - Run `/pdlc decide` — PDLC will detect the pending decision and offer to resume"

### 1c — Classify

This decision was triggered by the user explicitly issuing `/pdlc decide`. Record:
- **Source**: `User (explicit)`
- **Phase**: current phase from STATE.md (or `Any` if STATE.md shows Idle)
- **Agent**: `—` (user-initiated, not agent-initiated)

---

## Step 2 — Impact Assessment (Decision Review Party)

Before committing the decision to the registry, convene a **Decision Review Party** — a party mode meeting where the full team (9 built-in agents plus any matching custom agents from `.pdlc/agents/`) assesses the impact of this decision on their owned artifacts. Read `skills/build/party/orchestrator.md` for spawn mode and agent roster.

### 2a — Individual agent assessment

Each agent reviews their owned artifacts and evaluates whether this decision has material impact. Spawn agents per the orchestrator protocol.

| Agent | Reviews | Checks |
|-------|---------|--------|
| **Neo** (Architect) | `docs/pdlc/design/[feature]/ARCHITECTURE.md`, data model, API contracts | Does this change the system architecture, component boundaries, data model, or API contracts? Does it introduce or remove a dependency? |
| **Atlas** (PM) | `docs/pdlc/memory/ROADMAP.md`, active PRD, `docs/pdlc/memory/INTENT.md`, brainstorm log | Does this affect feature priority/sequencing, requirements, acceptance criteria, scope, problem statement, or value proposition? Should features be resequenced? |
| **Bolt** (Backend) | Backend source code, `docs/pdlc/design/[feature]/api-contracts.md` | Does this require backend code changes — services, DB schema, migrations, business logic, API endpoints? What is the estimated blast radius? |
| **Friday** (Frontend) | Frontend source code, UI components, state management | Does this require frontend changes — components, state, routing, API client calls? |
| **Echo** (QA) | Existing test suites, test gates in CONSTITUTION.md | Does this require new tests, modifications to existing tests, or changes to test gates? Which test layers are affected? |
| **Phantom** (Security) | `docs/pdlc/memory/CONSTITUTION.md`, security constraints, auth flows | Does this change security constraints, introduce new attack surface, affect auth/authz, or require guardrail updates? |
| **Jarvis** (Tech Writer) | `docs/pdlc/memory/OVERVIEW.md`, `docs/pdlc/memory/CHANGELOG.md`, API docs, README | Does this change documented functionality, API documentation, or user-facing descriptions? |
| **Muse** (UX) | User flows, interaction design, wireframes | Does this change user-facing behavior, flows, or interaction patterns? |
| **Pulse** (DevOps) | CI/CD config, deployment scripts, environment config | Does this affect deployment, environment variables, feature flags, infrastructure, or CI/CD pipeline? |

**Custom agents:** any agents in `.pdlc/agents/` that are `always_on: true` or whose `auto_select_on_labels` match the decision context also participate. Each reviews the artifacts they own per their persona file and produces the same structured assessment format.

Each agent produces a structured assessment:
```
Agent: [name]
Impact: [Yes / No]
Artifacts affected: [list of specific files or areas, or "None"]
Changes needed: [specific description of what needs to change, or "—"]
Risk level: [None / Low / Medium / High]
Notes: [any caveats, dependencies, or concerns]
```

### 2b — Decision Review Party meeting

After individual assessments, convene the full team. All agents discuss:

1. **Cross-cutting concerns** — Where one agent's impact triggers another's (e.g., a backend schema change that requires frontend updates AND test modifications)
2. **Roadmap resequencing** — If Atlas identifies that this decision affects feature priority, the team discusses the new order. Priority in ROADMAP.md uses a separate integer column — resequencing just means updating Priority numbers, no ADR IDs change.
3. **Risk consensus** — Agents align on overall risk level: is this a minor tweak or a significant course correction?
4. **Disagreements** — If agents disagree on impact (e.g., Neo says architecture is fine but Bolt says the code impact is significant), surface the disagreement explicitly for the user.

### 2c — Write minutes of meeting

Write the MOM to: `docs/pdlc/mom/MOM_decision_[ADR-NNN]_[YYYY-MM-DD].md`

```markdown
# Decision Review: [Decision title]

**Date:** [today YYYY-MM-DD]
**Decision:** [full decision text]
**Trigger:** [User (explicit) via /pdlc decide | PDLC flow — [phase]/[sub-phase]/[agent]]

---

## Agent Assessments

[For each agent that found impact:]

### [Agent Name] ([Role])
- **Artifacts affected:** [list]
- **Changes needed:** [description]
- **Risk level:** [Low/Medium/High]
- **Notes:** [caveats]

[For agents with no impact:]
### [Agent Name] ([Role])
- No impact identified.

---

## Cross-cutting Concerns
[List any chain reactions identified during the team discussion]

## Roadmap Impact
[If resequencing is needed: show current vs proposed priority order. If not: "No resequencing needed."]

## Risk Consensus
**Overall risk:** [Low / Medium / High]
**Rationale:** [one sentence]

## Disagreements
[List any, or "None — team consensus reached."]

---

## Recommended Changes

| # | File / Area | Agent | Change Description | Risk |
|---|-------------|-------|--------------------|------|
| 1 | [file path or area] | [agent] | [what to change] | [L/M/H] |
[... one row per change ...]

## Roadmap Resequencing
[If applicable: table showing Feature ID, Feature Name, Old Priority, New Priority. If not: "No resequencing required."]
```

Update `.pending-decision.json`: set `"progress": "mom-written"` and add `"momFile": "[MOM file path]"`.

---

## Step 3 — Present to user

Present the MOM summary to the user. Include:

1. The number of agents who identified impacts
2. The recommended changes table
3. Any roadmap resequencing proposal
4. Any disagreements that need the user's judgment

> "**Decision Review complete.** [N] of [total participating] agents identified impacts.
>
> **Recommended changes:**
> [table from MOM]
>
> [If resequencing:] **Roadmap resequencing proposed:**
> [show old → new priority for affected features]
>
> [If disagreements:] **Needs your input:**
> [describe the disagreement]
>
> Shall I apply all recommended changes and record the decision? You can also:
> - **Apply selectively** — tell me which changes to apply and which to skip
> - **Modify the decision** — rephrase it and I'll re-assess
> - **Cancel** — discard without recording"

Wait for user response.

- **Apply all**: Apply every change in the recommended table. If resequencing was proposed, update Priority numbers in ROADMAP.md. Proceed to Step 4.
- **Apply selectively**: Apply only the user-approved changes. Proceed to Step 4.
- **Modify**: Re-run from Step 2 with the modified decision text.
- **Cancel**: Stop without recording. Delete the MOM file.

---

## Steps 4–6 — Record, Reconcile, and Resume

Read `skills/decide/steps/record-and-reconcile.md` and execute it completely (Steps 4–6: record the ADR, reconcile phase-specific impacts, present summary, and offer to resume).
