# Step 2 — Socratic discovery

Before asking the first question, print this notice:

> **Tip:** You can type `skip`, `done`, `generate`, `draft`, or `create` at any time to stop the questions and proceed with whatever information has been collected so far.

**If divergent ideation was run (Step 0):** before asking the first question, review `[divergent-standouts]` from the brainstorm log. Use the standouts to sharpen the Socratic questions — reference specific standout ideas when asking about success metrics ("One idea that surfaced was X — does that direction change what success looks like?"), constraints ("Standout idea Y touched [area] — what constraints apply there?"), and risks ("Several ideas pointed toward Z — what assumptions are we making if we go that direction?"). Do not recite the standouts back verbatim; weave them into the questions naturally.

Ask the user probing questions **one at a time** across four rounds of interview. Wait for each answer before asking the next. Minimum 5 questions per round. Use the answers to build a rich understanding of the feature before generating any output.

After each answer, check: **if the user's response is any of `skip`, `generate`, `done`, `draft`, or `create` (case-insensitive), stop asking questions immediately and proceed to Step 3 (adversarial review) using whatever answers have been collected so far.** Mark unanswered questions as `TBD — skipped during discovery` in the PRD draft.

For round 1 (Understanding problem statement), ask these questions in this order:

1. "What problem does this specific feature solve? (Be concrete — what is the user unable to do today, and what is the cost of that gap?)"

2. "Who specifically will use this feature — and in what context? (Reference the personas in INTENT.md if relevant, or describe a more specific sub-group.)"

3. "What does success look like for this feature? What specific metric moves, and by how much?"

4. "What are the technical constraints or dependencies for this feature? (Think: existing services it must integrate with, database schemas it must respect, APIs it calls, performance requirements.)"

5. "What is explicitly out of scope for this feature? (Name at least 2 things you are deliberately not doing here.)"

6. "What are the key risks or assumptions we are making? (What could invalidate this feature or make it harder than expected?)"


Ask follow-up questions as needed based on the answers. Good follow-ups probe:
- Vague success metrics ("What does 'faster' mean in measurable terms?")
- Unstated dependencies ("Does this feature require any infrastructure that doesn't exist yet?")
- Thin out-of-scope lists ("Is mobile support out of scope? What about admin tooling?")
- Undisclosed prior art ("Has anything like this been tried before in this codebase?")

Next, launch into the remaining 3 rounds of interviews in below priority order.
The interview covers 4 discovery sections in priority order:

| Priority | Section                             | Why it comes first                                           |
| -------- | ----------------------------------- | ------------------------------------------------------------ |
| 1st      | **Future State / Key Capabilities** | Defines what gets built                                      |
| 2nd      | **Acceptance Criteria**             | Defines how we know it works                                 |
| 3rd      | **Current State**                   | Context for the problem                                      |

---

## Questioning Posture

The agent defaults to **Active** and **Challenging** — it will not simply accept vague answers:

| Type              | What it does                    | Example                                                                                  |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| **Clarifying**    | Makes vague statements specific | *"You said 'better notifications' — better in what specific way?"*                       |
| **Probing**       | Digs deeper into a stated point | *"You mentioned users miss updates — how often and what's the impact?"*                  |
| **Challenging**   | Surfaces unstated assumptions   | *"You're assuming users will opt in — what's your basis for that?"*                      |
| **Contradicting** | Flags inconsistencies           | *"You said real-time is essential, now you're describing a daily digest — which is it?"* |
| **Prioritising**  | Forces ranking                  | *"If you could only ship one of these three, which delivers the most value?"*            |
| **Evidence**      | Demands quantifiable impact     | *"How do you know this is a problem — what data points to it?"*                          |
| **Success**       | Defines done                    | *"What change in user behaviour tells you this feature worked?"*                         |

---

## Termination

Type any of: `skip` ·`generate` · `done` · `draft` · `create`

The agent does not auto-stop. You control when the interview ends.

Continue until you have a clear, concrete picture of the feature. Stop when you are confident you can write a complete PRD.

---

## Brainstorm log update

**After the final answer** (or after termination), append to `[brainstorm-log]` by replacing the `## Socratic Discovery` section with:

````markdown
## Socratic Discovery

**Completed:** [ISO 8601 timestamp]

### Round 1 — Problem Statement

**Q1:** What problem does this specific feature solve?
**A:** [answer]

**Q2:** Who specifically will use this feature?
**A:** [answer]

**Q3:** What does success look like?
**A:** [answer]

**Q4:** What are the technical constraints or dependencies?
**A:** [answer]

**Q5:** What is explicitly out of scope?
**A:** [answer]

**Q6:** What are the key risks or assumptions?
**A:** [answer]

#### Round 1 Follow-ups
**Q:** [question]
**A:** [answer]
[repeat for each follow-up asked]

### Round 2 — Future State / Key Capabilities
**Q:** [question]
**A:** [answer]
[repeat for each question asked]

### Round 3 — Acceptance Criteria
**Q:** [question]
**A:** [answer]
[repeat for each question asked]

### Round 4 — Current State
**Q:** [question]
**A:** [answer]
[repeat for each question asked]
````

Update `last-updated` in the frontmatter to now.

**Do not stop or wait for user input.** Return to `01-discover.md` and immediately proceed to Step 2a (Progressive Thinking).
