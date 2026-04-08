# Bloom's Taxonomy Design Questioning

Neo leads this round. The goal is to flesh out the architecture, data model, and API contracts through structured questioning that progresses from foundational understanding to creative synthesis — using Bloom's revised taxonomy as the framework.

**Before starting, inform the user:**

> **Neo (Architect):** "Before I draft the design documents, I'd like to walk through some architecture questions with you. These are structured from foundational → analytical → creative so we build up a shared understanding layer by layer. This ensures the design docs reflect your actual intent, not my assumptions.
>
> There are 6 rounds — we'll move quickly through the ones you've already answered during discovery and spend more time where the design needs sharpening."

Same rules as Socratic discovery: ask one question at a time, wait for a complete answer, adapt follow-ups based on what the user says. If the user says "skip" at any point, stop questioning and proceed to document generation with whatever has been collected.

---

## Round 1 — Remember (Foundational facts)

Establish the factual baseline. These may already be answered from discovery — if so, confirm and move on quickly.

Focus areas:
- What existing systems/services does this feature interact with?
- What data entities already exist that this feature will use?
- What authentication/authorization model is in place?
- What are the current API patterns (REST/GraphQL, versioning, error format)?

Ask 2–4 questions. Skip any that were clearly answered during Discover.

---

## Round 2 — Understand (Explain the mechanics)

Verify the user can articulate *how* the feature works, not just *what* it does.

Focus areas:
- Walk me through the data flow for the primary user journey — what happens at each step?
- How does the user's action translate into backend operations? What gets read, what gets written, in what order?
- What happens when the user does [key action] while [concurrent condition]?
- How does this feature behave for a first-time user vs. a returning user?

Ask 3–5 questions. Probe for specifics where the PRD was abstract.

---

## Round 3 — Apply (Map to the tech stack)

Ground the feature in the actual technology choices from CONSTITUTION.md.

Focus areas:
- Given your stack ([tech stack from Constitution]), which layer handles [key responsibility]?
- Where does [specific business logic] live — client, API, service layer, database trigger?
- What existing [framework/library] patterns should this feature follow? (e.g., "Do we use the same middleware chain as the existing auth endpoints?")
- Are there existing utilities, helpers, or base classes this should extend vs. build from scratch?

Ask 2–4 questions. The goal is to prevent the design docs from being generic — they should be specific to the stack.

---

## Round 4 — Analyze (Decompose and compare)

Break the feature apart and examine trade-offs.

Focus areas:
- What are the natural component boundaries? Where would you draw the line between [module A] and [module B]?
- Compare: should this be [approach A] or [approach B]? (Present concrete alternatives based on what you've learned so far.)
- What are the performance-sensitive paths? Where would high load or large data sets cause problems?
- What are the failure modes? What happens when [dependency X] is down?
- Where are the data consistency risks? (e.g., "If step 2 fails after step 1 succeeds, what state is the user left in?")

Ask 3–5 questions. This is where the most design insight comes from — push for concrete answers.

---

## Round 5 — Evaluate (Judge and prioritize)

Ask the user to make design judgment calls.

Focus areas:
- Given [trade-off from Round 4], which approach do you prefer and why?
- What's more important for this feature: [speed vs. correctness], [simplicity vs. flexibility], [consistency vs. availability]?
- If we had to cut one aspect of this design to ship faster, what would you sacrifice?
- Are there any parts of this design where "good enough" is acceptable vs. where it needs to be exactly right?

Ask 2–3 questions. Record each judgment — these become architectural decisions in the design docs and potentially in DECISIONS.md.

---

## Round 6 — Create (Synthesize the design direction)

Collaborative synthesis — Neo proposes, user validates.

> **Neo (Architect):** "Based on everything we've discussed, here's how I see the architecture shaping up:"

Present a brief verbal sketch of:
- The component structure (which modules, how they connect)
- The data model (key entities and their relationships)
- The API surface (main endpoints, request/response shapes)
- The key design decisions (from Round 5 judgments)

Ask:
> "Does this match your mental model? Anything I'm misunderstanding or that you'd push back on before I write it up formally?"

Iterate on any pushback. This is the final alignment check before document generation.

---

## Capture in brainstorm log

After all rounds (or when the user skips), append to `[brainstorm-log]` under a new section:

```markdown
## Design Discovery (Bloom's Taxonomy)

### Round 1 — Remember
[Q&A pairs]

### Round 2 — Understand
[Q&A pairs]

### Round 3 — Apply
[Q&A pairs]

### Round 4 — Analyze
[Q&A pairs]

### Round 5 — Evaluate
[Q&A pairs]

### Round 6 — Create
[Neo's synthesis + user's validation/pushback]
```

---

**Do not stop or wait for user input.** Return to `03-design.md` and immediately proceed to document generation (Step 10).
