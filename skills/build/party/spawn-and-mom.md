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

If consensus is not reached after 3 rounds (or earlier per (3)), the meeting proceeds to the **Pitch Round + Vote** (described below) before any human escalation. Cross-talk is a bounded attempt at agent-side resolution through dialogue; pitch+vote is a second bounded attempt that elicits each disagreeing agent's *closing argument* and quantifies the team's overall sentiment. Only after both layers fail does the disagreement surface for human decisioning.

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

## Pitch Round + Vote

When cross-talk fails (3 rounds exhausted without convergence, or early-exit on locked positions), the meeting runs a **Pitch Round + Vote** before any human escalation. This is a second, bounded attempt at agent-side resolution that operates on different rhetorical work than cross-talk:

- **Cross-talk** is dialogue — agents react to each other and may shift positions mid-round.
- **Pitch Round** is each disagreeing agent's *closing argument* given the points of contention surfaced in cross-talk. Positions lock at end of pitch.
- **Vote** quantifies the team's overall sentiment, including agents who stayed quiet during cross-talk but hold a clear position.

Some agents — and not only the lead — may have read the cross-talk record without speaking; the pitch+vote step gives them a structured way to register their position. The lead also gets clear, threshold-based authority guidance instead of having to interpret unquantified sentiment.

### When pitch+vote runs

Triggered by:
- Cross-talk Round 3 ended without consensus (3 rounds exhausted), OR
- Cross-talk early-exited on locked positions (rounds remained but no movement).

Skipped when:
- Cross-talk reached consensus (no disagreement to resolve).
- The disagreement is on a **Tier 1 hard block** — Tier 1 cannot be voted out; the lead cannot override Tier 1 by majority. (The lead can still escalate Tier 1 to `/override` separately, but that's a different mechanism.)
- The meeting is **What-If Analysis** (`/whatif`) — read-only, no decision to vote on. Disagreement is recorded in the MOM as alternatives.
- The meeting is the **Threat Modeling Party** at Step 10.5 — pitch+vote informs the *party recommendation* per threat, but the human owns final acceptance at the Step 12 design approval gate by design. The vote is data the human sees; it is not a binding decision.

### Step 1 — Pitch Round (parties to the dispute only)

Each agent holding a divergent position delivers one final pitch:

- **One spawn per disagreeing agent.** Not every meeting participant pitches — only the parties to the disagreement. (If the disagreement is 3-way, three pitches; if 2-way, two pitches.)
- **The pitch is a closing argument**, not new analysis. Each disagreeing agent restates their position, addresses the strongest counterargument from cross-talk, and explains why their position should win on the merits.
- **Format** — 1–3 short paragraphs maximum per pitch. The pitch is intended to inform the vote, not to re-litigate the cross-talk.
- **Agent Teams mode**: pitches are delivered in the shared meeting; all participants see them.
- **Subagent mode**: orchestrator collects each pitch and includes them all in the vote prompt.
- **Solo mode**: orchestrator writes each pitch as a section in the same generation, then the vote.

### Step 2 — Vote (all meeting participants)

After the pitches:

- **Who votes:** all meeting participants. The lead votes too — their vote is one vote among others.
  - **Exception:** if the lead is themselves a party to the dispute, they recuse from voting AND from the threshold-based decision authority described below; the meeting outcome goes directly to human escalation regardless of vote tally.
- **What's voted on:** each agent picks one of the pitched positions, OR explicitly **abstains** if the disagreement is outside their domain (e.g., Muse on a backend data-model disagreement, Friday on an ops-tooling dispute). Abstention is a valid response — the goal is signal, not coverage.
- **One vote per agent per disagreement.** If a meeting has multiple unresolved disagreements, run pitch+vote once per disagreement.
- **The vote is recorded verbatim** in the MOM with each agent's chosen position (or "abstain").

### Step 3 — Threshold and authority

The vote tally determines what the lead is authorized to do. Abstentions are excluded from the denominator:

| Outcome | Threshold | Lead's authority |
|---|---|---|
| **Supermajority** | One position has **≥66.7%** of cast votes (the 2/3 rule) | **Lead must go with the supermajority.** They synthesize the supermajority position into the meeting outcome. The only escape is to escalate the entire decision to human — the lead cannot override a supermajority and decide differently themselves. |
| **Simple majority** | One position has **>50% but <66.7%** of cast votes | **Lead strongly considers the majority but may override.** If the lead overrides, they record an explicit rationale in the MOM. The override + rationale is the durable receipt; future audits can see why the lead went against the majority. |
| **No majority** | No position has **>50%** of cast votes (could be three-way split, or many abstentions) | **Lead's discretionary call.** They use best judgment, citing the strongest pitch and any decisive consideration. The lead's reasoning is recorded in the MOM. |

**3+ position case:** the same thresholds apply per-position. If position A has 5 votes, B has 3, and C has 2 (10 cast), A has 50% — that's "no majority," lead's discretionary call. If position A has 7 votes out of 10, A has 70% — supermajority, lead must follow.

**Lead recused (party to dispute):** skip Step 3 entirely. Bring the vote tally to the human as part of the escalation context. The human sees: each pitch verbatim, each agent's vote, the abstentions, the threshold reached, and the note that the lead recused because they were a party.

### Step 4 — Per-meeting follow-through

After the lead applies the threshold rule (or recuses), the meeting proceeds to the per-meeting resolution defined in `skills/build/party/deadlock-protocol.md` Type 3, **with the pitch+vote outcome carried forward as input.** For example:

- **Design Roundtable** — if the lead can decide (per threshold), they pick the implementation approach; if not (lead recused or escalated), the build hard-blocks for human choice with vote data attached.
- **Strike Panel** — the ranked approaches reflect the vote tally; if the panel can't choose a clear winner, the third approach ("Take the wheel — human decides") incorporates the vote as data.
- **Decision Review** — vote tally is brought to the human as part of the recommendation.
- **Party Review** — if no majority emerges on a linked finding's root cause, fall through to "Fix both independently" (the existing pattern) — but the MOM now includes the vote so the team can see the leaning.

### What gets recorded in the MOM

For every pitch+vote that runs:

- **Triggering disagreement** — one-line summary of the unresolved point from cross-talk.
- **Each pitch** — agent name, role, full pitch text (1–3 paragraphs).
- **Vote tally** — each agent's vote OR explicit abstention, listed by agent.
- **Threshold reached** — supermajority / simple majority / no majority, with percentages.
- **Lead's decision** — what the lead decided, citing whether they followed the vote, overrode it (with rationale), or used discretion.
- **If lead recused** — note the recusal and that the disagreement was escalated to human with the vote tally as input.

The MOM becomes the durable receipt — every vote and every override-with-rationale is searchable across future audits.

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
