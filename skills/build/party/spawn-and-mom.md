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
- Routes relevant responses between agents manually for cross-talk (up to 3 rounds, exit early on consensus)
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

## Your Previous Position
[Subagent and Solo modes only — required from cross-talk Round 2 onward.
Sub-agents have no memory across spawns, so the primary agent must paste
the agent's own prior-round response here verbatim, labelled by round.
Omit in Agent Teams mode (the agent retains its own context). Omit on Round 1.]

Example for Round 3:
"Round 1 (your initial position): [verbatim]
 Round 2 (your response after seeing [Other]'s point): [verbatim]"

## Your Contribution
[Specific question this agent should address — e.g. "What architectural risks do you see?"
or "React to what Phantom flagged about the auth surface."
On cross-talk Round 2+, frame the question as a convergence check:
"Given [Other]'s response and your own prior position above, has anything in
your view changed? If yes, state your updated position. If no, explain
specifically why their argument does not move you."]

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

## Cross-talk Rounds

After Round 1, determine whether cross-talk is needed:

- **Run cross-talk if**: two or more agents reached contradictory conclusions, or one agent's finding directly affects another agent's domain
- **Skip cross-talk if**: agents are broadly aligned and no finding is interdependent

To run a cross-talk round: spawn only the agents whose perspectives interact. Pass the relevant other agent's response as "What Others Said." Ask them to react directly to that specific point and to try to move toward consensus — either by convincing the other agent or by adjusting their own position based on the other agent's reasoning.

**Up to 3 cross-talk rounds per party session.** Run only as many rounds as needed — most disagreements that resolve at all resolve in 1 or 2 rounds. After each round, decide:

1. **Consensus reached** — agents converged on a single position. Stop cross-talk; proceed to conclusion.
2. **Positions moved but didn't converge** — there's progress. Run another round if rounds remain.
3. **Positions locked, no movement** — cross-talk is unproductive. Stop early even if rounds remain; further rounds will not change the outcome.

If consensus is not reached after 3 rounds (or earlier per (3)), surface the disagreement in the MOM as an open question for the human. Cross-talk is a bounded attempt at agent-side resolution — it is not a substitute for human decisioning when agents fundamentally disagree.

### How cross-talk runs in each spawn mode

The mechanics differ because the modes have different communication channels.

**Agent Teams mode (default).** Agents have their own context windows and can address each other directly in the shared meeting. The lead agent (Neo or the meeting convener) frames each round, hears the back-and-forth in real time, and decides after each round whether to call another. Each agent retains its own running context across rounds — no need to re-pass prior positions. This is the highest-fidelity mode and the one cross-talk was originally designed for.

**Subagent mode.** Sub-agents cannot talk to each other — they only report back to the primary agent. Each "cross-talk round" is therefore a fresh re-spawn with state carried in the prompt:

1. **Round 1**: primary spawns each participant in parallel using the standard template. `## What Others Said` is omitted. `## Your Previous Position` is omitted.
2. **Identify cross-talk participants**: primary inspects Round 1 responses and selects the agents whose findings contradict or interconnect.
3. **Cross-talk Round 2**: primary re-spawns each selected agent. The prompt now includes:
   - `## What Others Said` — the verbatim Round 1 response from the relevant counterpart agent(s).
   - `## Your Previous Position` — the agent's **own** Round 1 response, verbatim. (Sub-agents have no cross-spawn memory; without this they cannot detect their own evolution or hold a position firmly.)
   - `## Your Contribution` — framed as a convergence check (see template).
4. **Decide after Round 2** using the consensus / moved / locked check above. If proceeding, run Round 3.
5. **Cross-talk Round 3**: re-spawn again. `## Your Previous Position` now includes **both** Round 1 and Round 2 verbatim, labelled by round, so the agent sees its own trajectory. `## What Others Said` is updated with the counterpart's Round 2 response.
6. The primary holds all positions across rounds and detects lock by string-comparing the agent's response against its prior round (semantic drift is fine — what matters is whether the position changed substantively or restated).

Each cross-talk round in subagent mode = N additional Agent calls where N is the number of participants in that cross-talk. Early exit therefore matters more here than in Agent Teams mode — running 3 rounds with 4 participants is 12 spawn calls.

**Solo mode.** A single LLM roleplays all agents in one response. Cross-talk is simulated within the same response — the orchestrator narrates Round 1, then writes each agent's reaction to the others, repeating up to 3 times. Each "round" is a section of the same generation, not a new call. `## Your Previous Position` is implicit (the model sees the whole conversation). Lock detection is by inspection: if Round N's positions are essentially restatements of Round N-1, stop. Solo is the lowest-fidelity mode — risk of false consensus since one model maintains every persona.

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
*(omit this section if cross-talk was skipped; repeat as `Round 3 — Cross-talk` and `Round 4 — Cross-talk` for additional cross-talk rounds, up to 3 cross-talk rounds total)*

**[Name] (responding to [Other Name]):**
[Cross-talk response]

[After the final cross-talk round, note the outcome:]
*Outcome: consensus reached / locked, escalated to human / 3 rounds exhausted, escalated to human*

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
