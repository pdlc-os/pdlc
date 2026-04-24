# Step 2 — Socratic discovery

Read `skills/interaction-mode.md` and use the `[interaction-mode]` determined at the start of the brainstorm skill. The question content below is identical in both modes — only the cadence differs.

Before starting, print this notice:

> **Tip:** You can type `skip`, `done`, `generate`, `draft`, or `create` at any time to stop the questions and proceed with whatever information has been collected so far.

**If divergent ideation was run (Step 0):** before the first round, review `[divergent-standouts]` from the brainstorm log. Use the standouts to sharpen the questions — reference specific standout ideas when asking about success metrics, constraints, and risks. Do not recite them verbatim; weave them in.

---

## Rounds and minimums

The interview covers 4 discovery sections in priority order. **Minimum 5 questions per round** in both modes.

| Round | Section | Why it matters |
| ----- | ------- | -------------- |
| 1 | **Problem Statement** | What problem this feature actually solves |
| 2 | **Future State / Key Capabilities** | What gets built |
| 3 | **Acceptance Criteria** | How we know it works |
| 4 | **Current State** | Context for the problem |

### Round 1 canonical questions

1. "What problem does this specific feature solve? (Be concrete — what is the user unable to do today, and what is the cost of that gap?)"
2. "Who specifically will use this feature — and in what context? (Reference the personas in INTENT.md if relevant, or describe a more specific sub-group.)"
3. "What does success look like for this feature? What specific metric moves, and by how much?"
4. "What are the technical constraints or dependencies for this feature? (Think: existing services it must integrate with, database schemas it must respect, APIs it calls, performance requirements.)"
5. "What is explicitly out of scope for this feature? (Name at least 2 things you are deliberately not doing here.)"
6. "What are the key risks or assumptions we are making? (What could invalidate this feature or make it harder than expected?)"

Rounds 2–4 follow the same pattern — draft at least 5 questions per round using the priority table above, adapted to what has already been answered.

---

## Delivery — Socratic mode

Ask the questions **one at a time**. Wait for each answer before asking the next. Apply the questioning posture (Clarifying, Probing, Challenging, Contradicting, Prioritising, Evidence, Success) to surface vague answers.

## Delivery — Sketch mode

Per `skills/interaction-mode.md`, gather context before each round:

- Read `docs/pdlc/memory/CONSTITUTION.md` and `docs/pdlc/memory/INTENT.md` (already loaded by the skill pre-flight — reuse)
- Read `CLAUDE.md` at the project root
- Read the 1–2 most recent episode files under `docs/pdlc/memory/episodes/`
- Read any prior brainstorm log for this or adjacent features
- Re-read `[divergent-standouts]` from the current brainstorm log if divergent ideation ran

Draft a proposed answer for each of the 5+ questions in the round using that context. Cite the source for every draft (e.g. `Source: INTENT.md — Target User`). Mark any question with no context-backed draft as `(no context — your input needed)`.

Present the full round as a single batched block per `skills/interaction-mode.md` Step B. Wait for one response. Parse acceptances, edits, and replacements back to specific questions. If 2–4 items surface substantive follow-ups, present them as one more batched block; if only one, ask inline.

Proceed through all 4 rounds this way.

---

## Questioning Posture (both modes)

The agent defaults to **Active** and **Challenging** — it does not simply accept vague answers:

| Type | What it does | Example |
| ---- | ------------ | ------- |
| **Clarifying** | Makes vague statements specific | *"You said 'better notifications' — better in what specific way?"* |
| **Probing** | Digs deeper into a stated point | *"You mentioned users miss updates — how often and what's the impact?"* |
| **Challenging** | Surfaces unstated assumptions | *"You're assuming users will opt in — what's your basis for that?"* |
| **Contradicting** | Flags inconsistencies | *"You said real-time is essential, now you're describing a daily digest — which is it?"* |
| **Prioritising** | Forces ranking | *"If you could only ship one of these three, which delivers the most value?"* |
| **Evidence** | Demands quantifiable impact | *"How do you know this is a problem — what data points to it?"* |
| **Success** | Defines done | *"What change in user behaviour tells you this feature worked?"* |

In Sketch mode, the posture is applied to proposed drafts (e.g., if your drafted success metric is vague, flag it in the block: "Q3 draft is likely gameable — needs a harder metric") rather than waiting for a user answer to probe.

---

## Termination

Type any of: `skip` · `generate` · `done` · `draft` · `create`

The agent does not auto-stop. You control when the interview ends.

Continue until you have a clear, concrete picture of the feature. Stop when you are confident you can write a complete PRD.

---

## Brainstorm log update

**After the final answer** (or after termination), append to `[brainstorm-log]` by replacing the `## Socratic Discovery` section with:

````markdown
## Socratic Discovery

**Completed:** [ISO 8601 timestamp]
**Interaction mode:** [Sketch|Socratic]

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
