# Party Mode Orchestrator

Shared protocol for all PDLC party mode meetings (Wave Kickoff, Design Roundtable, Party Review, Strike Panel, Decision Review).
Read this file once at the start of any party session before loading the specific scenario file.

---

## Durable Checkpoint Protocol

Party meetings involve multi-agent spawning, cross-talk, and MOM generation — any of which can be interrupted by network failures, usage limits, or the user exiting. Every party meeting must use this checkpoint protocol to ensure recovery.

### Before starting: write pending file

At the very start of the meeting (before spawning any agents), write `docs/pdlc/memory/.pending-party.json`:

```json
{
  "meetingType": "[wave-kickoff | design-roundtable | party-review | strike-panel | decision-review]",
  "feature": "[current feature from STATE.md]",
  "taskId": "[active Beads task ID, or — if not task-specific]",
  "timestamp": "[now ISO 8601]",
  "phase": "[current phase]",
  "subPhase": "[current sub-phase]",
  "lastCheckpoint": "[Last Checkpoint from STATE.md]",
  "resumeCommand": "[/pdlc build or /pdlc brainstorm or /pdlc ship]",
  "progress": "started",
  "momFile": null
}
```

### At milestones: update progress

Update the `progress` field at each key milestone:

| Progress value | Meaning |
|---------------|---------|
| `started` | Meeting initiated, agents not yet spawned |
| `round-1-complete` | First round responses collected |
| `cross-talk-complete` | Cross-talk round done (or skipped) |
| `mom-written` | MOM file written to disk |
| `presented` | Results presented to user, awaiting response |

When the MOM file is written, also set `"momFile": "[path]"`.

### On completion: delete pending file

After the meeting is fully complete (MOM written, results presented, user has responded, and the calling skill has resumed), delete `docs/pdlc/memory/.pending-party.json`.

### On session start: detect interrupted meetings

The session-start hook checks for `.pending-party.json`. If found, it warns the user. The calling skill (build, decision, etc.) is responsible for checking on entry and offering recovery.

### On re-entry: check for interrupted meeting

When any party meeting starts, check if `.pending-party.json` exists AND its `meetingType` matches the current meeting type:

- **If `progress` is `mom-written` or `presented`**: the meeting was nearly done. Read the MOM file, present it to the user, and skip directly to the post-meeting actions. Do not re-run the agents.
- **If `progress` is `round-1-complete` or `cross-talk-complete`**: partial agent work was done but the MOM wasn't written. Re-run the meeting from scratch — agent responses from a prior session cannot be reliably recovered.
- **If `progress` is `started`**: nothing was saved. Re-run from scratch.

If the `meetingType` does NOT match (e.g., a decision review was pending but we're now in a wave kickoff), leave the file alone — the decision flow will handle it when it runs.

---

## Meeting Announcement

Before spawning any agents, announce the meeting to the user. This sets expectations about what's happening, who's involved, and how long it will take. Read `skills/formatting.md` and output a **Meeting Announcement Block** (magenta borders with the meeting details):

- **Called by**: the lead agent who convened the meeting
- **Participants**: names and roles, with total count
- **Purpose**: one sentence — what this meeting will decide or produce
- **Estimated time**: from the table below

Follow the exact visual pattern defined in the "Meeting Announcement Block" section of `skills/formatting.md` — magenta dotted borders, labeled fields, yellow estimated time.

### Time estimates by meeting type

| Meeting | Typical duration | Why |
|---------|-----------------|-----|
| Wave Kickoff | ~30 seconds | Quick standup — dependency check and wave plan |
| Design Roundtable | ~1–2 minutes | Multi-round design debate with cross-talk |
| Party Review | ~2–3 minutes | Full parallel review with cross-talk and linked findings |
| Strike Panel | ~1 minute | Focused diagnosis of a specific failure |
| Decision Review | ~2–4 minutes | All 9 agents assess impacts across all artifacts |

These are estimates — actual time depends on complexity and spawn mode (solo is fastest, subagents is slowest). If the meeting takes noticeably longer than the estimate, output a brief progress update:

> "Still discussing — [what's happening: e.g., 'cross-talk round in progress', 'Neo and Phantom are debating the security implications']..."

---

## Spawn Mode

### Runtime Agent Teams check

Before determining spawn mode, verify that Agent Teams is actually available:

1. Check Claude Code settings (`~/.claude/settings.json` or `.claude/settings.local.json`) for Agent Teams being enabled.
2. Check `STATE.md` `Party Mode` field — if it's already set to `subagents` (user declined Agent Teams during init), skip the check.

**If Agent Teams is not enabled and STATE.md doesn't already say `subagents`:**

> "Agent Teams is not enabled in your Claude Code settings. PDLC works best with Agent Teams — agents get their own context windows and can collaborate directly.
>
> Falling back to Subagent mode for this meeting. To enable Agent Teams, update your Claude Code settings or re-run `/pdlc init`."

Set `Party Mode` in STATE.md to `subagents` so this message isn't repeated every meeting.

### Mode selection

Determine spawn mode using this priority order:

1. **STATE.md `Party Mode` field** — if set, use it. This is the session-level preference established at init or the first Wave Kickoff standup.
2. **Step 7 execution mode** — if no `Party Mode` in STATE.md and a task execution mode has been chosen, use it.
3. **Default** — Agent Teams mode (if enabled; otherwise Subagent mode).

| Party Mode value | Behaviour |
|-----------------|-----------|
| `agent-teams` | **Agent Teams mode** (default): Each agent is a separate agent with its own context window. Agents can talk to each other and the user can talk to any agent directly. Best for complex multi-perspective discussions. |
| `subagents` | **Subagent mode**: Primary agent spawns sub-agents via the Agent tool. Sub-agents report back to the primary agent only — they cannot talk to each other. Primary agent synthesizes. Faster but less interactive. |
| `solo` | **Solo mode**: Single LLM roleplays all agents in one response. Fastest, but lowest fidelity. Emergency fallback or when spawning fails. |

The user can override for any single meeting by saying "run this one as solo" or similar.

---

## Agent Roster

### Built-in agents

| Name | Role | Focus | Style |
|------|------|-------|-------|
| **Neo** | Architect | High-level design, cross-cutting concerns, tech debt radar | Decisive, big-picture, challenges scope creep |
| **Echo** | QA Engineer | Test strategy, edge cases, regression coverage | Methodical, pessimistic about happy-path assumptions |
| **Phantom** | Security Reviewer | Auth, input validation, OWASP Top 10, secrets | Paranoid, precise, never lets "we'll fix it later" slide |
| **Jarvis** | Tech Writer | Docs, API contracts, CHANGELOG, README | Clear, audience-aware, flags ambiguous naming |
| **Bolt** | Backend Engineer | APIs, services, DB, business logic | Pragmatic, performance-aware, opinionated about data models |
| **Friday** | Frontend Engineer | UI components, state management, UX implementation | Detail-oriented, accessibility-conscious |
| **Muse** | UX Designer | User flows, interaction design, mental models | Empathetic, non-technical framing, pushes back on dev-centric thinking |
| **Oracle** | PM | Requirements clarity, scope, acceptance criteria | Scope guardian, pushes for testable definitions |
| **Pulse** | DevOps | CI/CD, infra, deployment, environment config | Ops-first, questions anything that doesn't deploy cleanly |

### Custom agents

Before spawning agents for any meeting, check if `.pdlc/agents/` exists in the project root. If it does, read each `.md` file in that directory and parse its frontmatter:

- **`name`**: display name for the agent
- **`role`**: role title
- **`always_on`**: if `true`, include in every meeting (same as Neo/Echo/Phantom/Jarvis)
- **`auto_select_on_labels`**: comma-separated labels — include this agent when any task in the current context has a matching label
- **`model`**: which Claude model to use

Add matching custom agents to the participant list alongside built-in agents. Custom agents use the same spawn prompt template as built-in agents — their `.md` file provides the persona context. Built-in agents take priority on name collisions.

---

## Agent Spawn Failures

If any Agent tool call returns empty content, an error, or only "I have nothing to add", a spawn failure has occurred. Read `skills/build/party/deadlock-protocol.md` and apply **Deadlock Type 2** (Agent Spawn Failure). In summary:

- **1 of N agents fails** — continue the round without them; note the absence in the MOM
- **Majority fail** — switch to Solo mode for this meeting only
- **All fail** — abort the party round entirely; write a minimal MOM noting the failure; do not block build progress

Retry once with a stripped-down prompt before applying the tiers above. Never retry more than once per agent per round.

---

## Spawn Protocol

### Agent Teams mode (default)

Each agent is created as a separate agent with its own context window. All agents can communicate with each other directly and the user can interact with any agent.

The lead agent (whoever called the meeting):
- Opens each round with a framing statement
- Facilitates cross-talk — agents respond to each other directly
- Closes the discussion with a synthesis and conclusion
- Writes the MOM file

This is the highest fidelity mode — agents maintain independent reasoning and can challenge each other in real time.

### Subagent mode

The primary agent spawns sub-agents via the Agent tool. Sub-agents can only report back to the primary agent — they cannot talk to each other. The primary agent:
- Spawns all participants in parallel
- Collects all responses
- Routes relevant responses between agents manually for cross-talk (one round max)
- Synthesizes conclusion

Faster than Agent Teams but cross-talk is mediated rather than direct.

### Solo mode

Generate all agent responses yourself in a single message. Clearly separate each with `**[Name] ([Role]):**`. Stay faithful to each persona's focus and style. Do not let them all agree — if expertise warrants disagreement, write it. Conclude as orchestrator.

Fastest but lowest fidelity — risk of false consensus since one LLM is maintaining all personas.

---

## Agent Spawn Prompt Template

Use this template for each spawned subagent. Fill in the bracketed fields:

```
You are [Name] ([Role]), a PDLC agent participating in a [meeting type] for feature '[feature-name]'.

## Your Persona
Role: [Role]
Focus: [Focus from roster above]
Style: [Style from roster above]

## Meeting Context
[200–300 word summary: what is being discussed, what triggered this meeting,
what the task/problem is, any relevant constraints from CONSTITUTION.md or the PRD]

## What Others Said
[Include verbatim responses from agents who already spoke this round, labelled by name.
Omit this section on the first round.]

## Your Contribution
[Specific question this agent should address — e.g. "What architectural risks do you see?"
or "React to what Phantom flagged about the auth surface."]

## Guidelines
- Respond as [Name] with the genuine expertise of your role.
- Lead with your most important point.
- Disagree explicitly when your expertise says to. Do not hedge or soften disagreements.
- If you agree with another agent, build on their specific point — don't just say "I agree."
- Keep your response under 300 words unless the complexity demands more.
- If you have nothing substantive to add, say so in one sentence rather than padding.
- **Agent Teams mode:** You have your own context window. You may use tools (Read, Grep, Bash, etc.) to verify claims — e.g., read source code to confirm an architectural concern, check test files to validate coverage claims. Collaborate directly with other agents.
- **Subagent mode:** Do NOT use tools. Respond with your perspective only. You report back to the primary agent.
```

---

## Cross-talk Round

After the first round, determine whether a cross-talk round is needed:

- **Run cross-talk if**: two or more agents reached contradictory conclusions, or one agent's finding directly affects another agent's domain
- **Skip cross-talk if**: agents are broadly aligned and no finding is interdependent

To run cross-talk: spawn only the agents whose perspectives interact. Pass the relevant other agent's response as "What Others Said." Ask them to react directly to that specific point.

Maximum one cross-talk round per party session. Do not run more rounds — if disagreement persists, surface it in the MOM as an open question for the human.

---

## Conclusion and Next Steps

After all rounds are complete:

1. **Synthesize** — summarize the key points of agreement and any unresolved disagreements
2. **Conclude** — state the decision or recommended course of action in 1–3 sentences
3. **Next steps** — list concrete actions (implement X, add test Y, ask human about Z) with an owner for each

In Neo mode: Neo writes the synthesis and conclusion.
In Subagent/Solo mode: orchestrator writes the synthesis and conclusion.

---

## MOM File

Write the meeting minutes file immediately after the conclusion.

**Path:** `docs/pdlc/mom/[feature-name]_[topic-slug]_mom_[YYYY]_[MM]_[DD].md`

**Topic slugs:**
| Meeting | Topic slug |
|---------|-----------|
| Wave Kickoff Standup | `wave-kickoff` |
| Design Roundtable | `design-roundtable` |
| Party Review | `party-review` |
| Strike Panel | `strike-panel` |
| Deadlock event | `deadlock` |

If a MOM file for this feature+topic+date already exists (same session, second occurrence), append a numeric suffix: `_2`, `_3`, etc.

**Format:**

```markdown
---
feature: [feature-name]
topic: [topic-slug]
date: [YYYY-MM-DD]
mode: agent-teams | subagents | solo
participants: [comma-separated names]
---

# Meeting Minutes: [Topic Display Name]
## Feature: [feature-name] | [YYYY-MM-DD]

**Mode:** [Agent Teams / Subagents / Solo]
**Participants:** [Name (Role), Name (Role), ...]

---

## Context

[3–5 sentences. The specific problem, task, or situation that triggered this meeting.
Include the task ID and title if applicable.]

---

## Discussion

### Round 1

**[Name] ([Role]):**
[Full response — verbatim from subagent output, or close representation in solo mode]

**[Name] ([Role]):**
[Full response]

[repeat for each participant]

### Round 2 — Cross-talk
*(omit this section if cross-talk was skipped)*

**[Name] (responding to [Other Name]):**
[Cross-talk response]

---

## Conclusion

[1–3 sentences. What was agreed or decided. If there is an unresolved disagreement,
state it explicitly: "Neo and Phantom disagree on X — escalated to human."]

---

## Next Steps

| # | Action | Owner | Notes |
|---|--------|-------|-------|
| 1 | [action] | [Neo / Echo / Human / etc.] | [context] |
[repeat]

---

## CHANGELOG Draft
*(include only for Party Review meetings; omit for all other meeting types)*

[Paste Jarvis's draft CHANGELOG entry here verbatim]

---

## Escalation
*(omit if nothing requires human input)*

[Any open question or unresolved disagreement that requires human guidance.]
```

After writing the MOM file, update `.pending-party.json`: set `"progress": "mom-written"` and `"momFile": "[path]"`.

Then tell the user:
> "Meeting minutes saved to `docs/pdlc/mom/[filename]`"
