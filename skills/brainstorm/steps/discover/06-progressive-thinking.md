# Progressive Thinking — Agent Team Meeting

Atlas leads this meeting. Unlike Socratic discovery (which questions the user), this is an **internal team meeting** where Atlas questions the other agents to stress-test and refine the feature understanding. The user observes but is only pulled in when agents cannot resolve a question themselves.

**This step cannot be skipped by the user.** It is a required quality gate before Define.

---

## Announce the meeting

Read `skills/formatting.md` and output a **Meeting Announcement Block**:

> **Atlas (Product Manager):** "Now that I have a solid understanding of the feature from our conversation, I'm going to run an internal team meeting to pressure-test what we've gathered. The agents will challenge each other using a progressive thinking framework — building from concrete facts up to strategic implications. I'll present the refined findings when they're done.
>
> If the team gets stuck or can't resolve something, I'll bring the question to you."

- **Called by:** Atlas (Product Manager)
- **Participants:** Neo, Echo, Phantom, Bolt, Friday, Muse, Pulse, Jarvis — 8 agents (Atlas facilitates)
- **Purpose:** Progressive thinking refinement of `[feature-name]` discovery
- **Estimated time:** ~3–5 minutes

---

## Durable checkpoint

Follow the orchestrator's durable checkpoint protocol (`skills/build/party/orchestrator.md`). Write `.pending-party.json` with `meetingType: "progressive-thinking"` before spawning agents.

---

## Meeting protocol

Atlas facilitates 6 rounds of progressive thinking. Each round builds on the previous. In each round, Atlas poses the question(s) to the relevant agents, collects their responses, identifies gaps or conflicts, and either resolves them or escalates to the user.

### Round 1 — Concrete (What do we know for certain?)

Atlas asks all agents:
> "Based on the discovery so far, what do we know for certain about this feature? State only facts — things explicitly confirmed by the user, documented in the PRD/brainstorm log, or verifiable from the codebase. No assumptions, no inferences."

Each agent responds from their domain:
- **Bolt**: confirmed backend requirements, known DB schema, existing APIs
- **Friday**: confirmed UI requirements, existing components, state patterns
- **Neo**: confirmed architectural constraints, integration points
- **Echo**: confirmed test requirements, existing test coverage
- **Phantom**: confirmed security requirements, auth model
- **Muse**: confirmed UX requirements, user flows
- **Pulse**: confirmed deployment requirements, environment constraints
- **Jarvis**: confirmed documentation requirements, API contract patterns

Atlas synthesizes: "Here's what we know for certain: [consolidated list]"

### Round 2 — Inferential (What can we reasonably infer?)

Atlas asks:
> "Given what we know, what can we reasonably infer that the user hasn't explicitly stated? What patterns from the existing codebase or similar features suggest about how this should work?"

Agents respond with inferences from their domains, clearly labeled as inferences (not facts).

Atlas identifies any inference that two or more agents disagree on → flag for Round 5 or user escalation.

### Round 3 — Consequential (What follows from our inferences?)

Atlas asks:
> "If our inferences are correct, what are the downstream consequences? What does this mean for the implementation, testing, security, and deployment?"

Agents trace the implications:
- **Bolt/Friday**: implementation consequences (new code, refactored code, migration needs)
- **Echo**: testing consequences (new test cases, modified test fixtures)
- **Phantom**: security consequences (new attack surface, changed auth flows)
- **Pulse**: deployment consequences (new env vars, infra changes, CI/CD updates)
- **Muse**: UX consequences (flow changes, new screens, changed interactions)
- **Jarvis**: documentation consequences (new docs, updated API contracts)

### Round 4 — Speculative (What might we be missing?)

Atlas asks:
> "What haven't we considered? What scenarios, edge cases, or requirements might emerge that we haven't discussed? Think about what could go wrong, what the user might not have thought of, and what similar features in other products typically require."

This is the creative/paranoid round. Agents are encouraged to be speculative:
- **Phantom**: "What if an attacker does X?"
- **Echo**: "What if the test data doesn't cover Y?"
- **Muse**: "What if the user expects Z behavior that we haven't discussed?"
- **Neo**: "What if this feature interacts with [future feature] in ways we haven't considered?"

### Round 5 — Conflicting (Where do we disagree?)

Atlas asks:
> "Looking at Rounds 1–4, where do our assessments conflict? Where did one agent's inference contradict another's? Let's surface these explicitly."

For each conflict:
1. Atlas states the disagreement clearly
2. The two (or more) agents involved present their reasoning
3. Atlas attempts resolution — if one agent's reasoning is clearly stronger, accept it
4. **If the team cannot resolve**: escalate to the user

**User escalation format:**

> **Atlas (Product Manager):** "The team hit a point we can't resolve internally:
>
> **Question:** [the specific question]
> **[Agent A]'s view:** [their position and reasoning]
> **[Agent B]'s view:** [their position and reasoning]
>
> What's your call?"

Wait for the user's answer. Record it in the MOM and brainstorm log. Resume the meeting.

### Round 6 — Strategic (What should we prioritize?)

Atlas asks:
> "Given everything from Rounds 1–5, what are the top 3–5 things we must get right in the design? What are the highest-risk areas that need the most attention during construction? And what can we safely defer or simplify?"

Agents each nominate their top priorities. Atlas synthesizes into a ranked list.

---

## Write MOM

Write the MOM to: `docs/pdlc/mom/[feature-name]_progressive-thinking_mom_[YYYY]_[MM]_[DD].md`

Follow the MOM format from `skills/build/party/orchestrator.md`. The Discussion section should have one subsection per round. The Conclusion should contain:

1. **Confirmed facts** (Round 1 output)
2. **Accepted inferences** (Round 2, filtered by Round 5)
3. **Key consequences** (Round 3, top items)
4. **Risks and unknowns** (Round 4, top items)
5. **Resolved conflicts** (Round 5, how each was resolved)
6. **User escalation answers** (if any, verbatim)
7. **Design priorities** (Round 6, ranked list)

The Escalation section should list any questions the user answered, with their exact response.

Update `.pending-party.json`: set `"progress": "mom-written"`.

---

## Present findings to user

> **Atlas (Product Manager):** "The team completed the progressive thinking analysis. Here's what came out of it:
>
> **Confirmed facts:** [top items from Round 1]
> **Key inferences:** [top items from Round 2]
> **Risks we identified:** [top items from Round 4]
> **Design priorities:** [ranked list from Round 6]
> [If conflicts were escalated:] **Your decisions:** [summary of user's answers from Round 5]
>
> Full meeting minutes: `docs/pdlc/mom/[feature-name]_progressive-thinking_mom_[date].md`
>
> This will feed directly into the PRD generation. Moving to Define."

Delete `.pending-party.json`.

---

## Capture in brainstorm log

Append to `[brainstorm-log]` under a new section:

```markdown
## Progressive Thinking (Agent Team Meeting)

**MOM:** [link to MOM file]

### Confirmed Facts
[consolidated list from Round 1]

### Accepted Inferences
[from Round 2, filtered by Round 5 conflict resolution]

### Key Consequences
[from Round 3]

### Risks & Unknowns
[from Round 4]

### Conflicts Resolved
[from Round 5 — how each was resolved, including any user escalations]

### Design Priorities
[ranked list from Round 6]
```

---

**Do not stop or wait for user input.** Return to `01-discover.md` and immediately proceed to Step 3 (Adversarial Review).
