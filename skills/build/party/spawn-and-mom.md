# Spawn Protocol, Cross-talk, and MOM Format

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
