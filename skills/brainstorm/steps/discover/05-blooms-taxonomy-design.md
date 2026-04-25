# Bloom's Taxonomy Design Questioning

Neo leads this round. The goal is to flesh out the architecture, data model, and API contracts through structured questioning that progresses from mechanics → tech-stack mapping → trade-offs and judgments — using a condensed Bloom's revised taxonomy as the framework. A final synthesis step closes the loop.

**Before starting, inform the user:**

> **Neo (Architect):** "Before I draft the design documents, I'd like to walk through a few architecture questions with you. We'll do 3 short rounds — mechanics, tech-stack mapping, and trade-offs — followed by a synthesis check. This ensures the design docs reflect your actual intent, not my assumptions.
>
> Each round is at most 3 questions, and I'll skip anything that's already clear from the PRD."

Read `skills/interaction-mode.md` and apply the active `[interaction-mode]`. The round structure, focus areas, and per-round caps below are identical in both modes — only the delivery cadence differs.

- **Socratic mode:** Ask questions one at a time, wait for each answer.
- **Sketch mode:** For each round, gather context (CONSTITUTION.md tech stack, INTENT.md, the approved PRD, the feature's existing Socratic answers, and the 1–2 most recent episode files' architecture docs). Draft a proposed answer for each question in the round with a cited source. Present the full round as a single batched block per `skills/interaction-mode.md` Step B. Wait for one response, parse acceptances/edits/replacements, then move to the next round. Do not run a follow-up batched block within a round — capture any remaining ambiguity as a flagged item in the design doc rather than a new question.

If the user says `skip` at any point, stop questioning and proceed to document generation with whatever has been collected.

**Total cap: 3 rounds × 3 questions = 9 questions maximum**, plus 1 synthesis validation question. Skip any question whose answer is already clear from the PRD or Socratic discovery.

---

## Round 1 — Mechanics (Understand how it works)

Verify the user can articulate *how* the feature works end-to-end. Foundational facts (what services exist, what auth model is in place, what API patterns are standard) should already be inferable from CONSTITUTION.md and the PRD — read those, do not re-ask.

**Before asking, check if UX Discovery captured the user flow.** Read `[brainstorm-log]` → `## UX Discovery` → Q2 (User Flow). If a flow was captured (Q2 was not skipped), do not re-ask the user to walk through it — load the flow into working context and use it as the **input** to your mechanics questions instead. Frame Round 1 as building on the captured flow:

> **Neo (Architect):** "Muse already walked through the user flow with you in UX Discovery — entry, primary path, branch points, exit. I'm taking that as given and asking about what happens *behind* it: which services get called at each step, what reads and writes happen, and what ordering matters."

Focus areas (pick the most relevant for this feature; skip the data-flow question if UX Discovery already captured the user flow):
- *(If UX Discovery skipped or absent)* Walk me through the data flow for the primary user journey — what happens at each step, what gets read, what gets written, in what order?
- *(Always available)* For [step X in the captured flow], which services get called and in what order? What gets persisted, and at which step does the user-facing state become consistent with the persisted state?
- What happens when the user does [key action] while [concurrent condition]?
- How does this feature behave for a first-time user vs. a returning user?

Ask up to 3 questions. Probe for specifics where the PRD was abstract.

---

## Round 2 — Apply (Map to the tech stack)

Ground the feature in the actual technology choices from CONSTITUTION.md.

Focus areas (pick the most relevant for this feature):
- Given your stack ([tech stack from Constitution]), which layer handles [key responsibility] — client, API, service layer, or database?
- What existing [framework/library] patterns should this feature follow? (e.g., "Do we use the same middleware chain as the existing auth endpoints?")
- Are there existing utilities, helpers, or base classes this should extend vs. build from scratch?

Ask up to 3 questions. The goal is to prevent the design docs from being generic — they should be specific to the stack.

---

## Round 3 — Trade-offs and Judgments (Decompose, compare, decide)

Break the feature apart, examine trade-offs, and make the judgment calls that turn the design doc into an opinionated artifact rather than a list of options. This round merges the former Analyze and Evaluate rounds — surface the key trade-off and ask the user to decide on it.

Focus areas (pick the most relevant for this feature):
- What are the natural component boundaries, and where are the performance-sensitive paths or failure modes? (Pick the highest-stakes one and ask about it concretely — e.g. "If [dependency X] is down, what's the expected behaviour?")
- Compare: should this be [approach A] or [approach B]? Which do you prefer and why?
- What's more important for this feature: [speed vs. correctness] / [simplicity vs. flexibility] / [consistency vs. availability]? If we had to cut one aspect to ship faster, what would you sacrifice?

Ask up to 3 questions. Record each judgment — these become architectural decisions in the design docs and potentially in DECISIONS.md.

---

## Synthesis — Neo proposes, user validates

Not a question round — this is the final alignment check before document generation. **1 validation question total.**

> **Neo (Architect):** "Based on everything we've discussed, here's how I see the architecture shaping up:"

Present a brief verbal sketch of:
- The component structure (which modules, how they connect)
- The data model (key entities and their relationships)
- The API surface (main endpoints, request/response shapes)
- The key design decisions (from Round 3 judgments)

Ask:
> "Does this match your mental model? Anything I'm misunderstanding or that you'd push back on before I write it up formally?"

Iterate on any pushback inline (no new round of questions — this is the synthesis closing).

---

## Capture in brainstorm log

After all rounds (or when the user skips), append to `[brainstorm-log]` under a new section:

```markdown
## Design Discovery (Bloom's Taxonomy)

### Round 1 — Mechanics
[Q&A pairs]

### Round 2 — Apply
[Q&A pairs]

### Round 3 — Trade-offs and Judgments
[Q&A pairs]

### Synthesis
[Neo's design sketch + user's validation/pushback]
```

---

**Do not stop or wait for user input.** Return to `03-design.md` and immediately proceed to document generation (Step 10).
