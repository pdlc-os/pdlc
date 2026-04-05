# Roadmap Ideation
## Steps 6a–6d

---

## Step 6a — Ideate features

Using the project context from the Socratic questions (problem statement, target user, tech stack, constraints), brainstorm a list of features the project will need. Think like a product manager:

- What are the **must-have** features for launch?
- What would make the product **compelling** beyond MVP?
- What are the natural **building blocks** that other features depend on?

Generate 5–15 candidate features. For each, write:
- A short title (2–5 words, kebab-case slug)
- A one-sentence description of what it does for the user

Present the list to the user:

> "Based on what you've told me about the project, here are the features I think we should build. Let me know if you'd like to add, remove, or change any of these before we prioritize them."

Then list the features in a numbered table.

Wait for the user's feedback. Iterate until they're satisfied — add features they suggest, remove ones they don't want, adjust descriptions. Do not proceed until the user confirms the list.

---

## Step 6b — Propose and validate priority sequence

Once the feature list is confirmed, analyze the features for:
- **Dependencies** — which features are prerequisites for others (e.g., auth before billing, data model before API, core entities before reporting)
- **User value** — what delivers the most impact soonest
- **Technical risk** — build the riskiest thing early to de-risk

Propose a priority sequence with rationale:

> "Here's the build order I'd recommend:
>
> | Priority | Feature | Rationale |
> |----------|---------|-----------|
> | 1 | [feature-slug] | [why first — e.g., 'foundation for all other features'] |
> | 2 | [feature-slug] | [why second — e.g., 'depends on auth, enables billing'] |
> | ... | ... | ... |
>
> Does this sequence work for you?
> - **Yes** — lock it in and let's start building
> - **Reorder** — tell me your preferred sequence and I'll review it"

**If the user agrees:** proceed to Step 6c.

**If the user proposes a different sequence:**

Validate the proposed sequence for dependency conflicts. For each feature in the user's order, check: does this feature depend on another feature that comes *later* in the sequence?

**If no conflicts found:**
> "Your sequence checks out — no dependency issues. Locking it in."

Proceed to Step 6c with the user's sequence.

**If conflicts found:**

> "I see a potential issue with that sequence:
>
> - **[feature-X]** (priority [N]) depends on **[feature-Y]** (priority [M]) — but [feature-Y] is scheduled after [feature-X]. Building [feature-X] first would mean [specific problem: e.g., 'no auth system to integrate with when building billing'].
>
> Would you like to:
> - **Adjust** — move [feature-Y] before [feature-X] (I'll suggest the minimal reorder)
> - **Override** — keep your sequence anyway (I'll note the risk in the roadmap)
> - **Try again** — give me a different sequence"

Repeat until the user is satisfied with a sequence. If the user overrides despite conflicts, note it in ROADMAP.md: add a comment `<!-- User overrode dependency order: F-NNN before F-MMM. Risk: [description] -->`.

If the user says "you decide" or defers, use the originally proposed order and confirm it.

---

## Step 6c — Write ROADMAP.md

Once the prioritized list is confirmed, update `docs/pdlc/memory/ROADMAP.md` with the full roadmap:

```markdown
# Roadmap

**Project:** [project name]
**Last updated:** [today's date YYYY-MM-DD]

---

## Feature Backlog

| ID | Feature | Description | Priority | Status | Shipped | Episode |
|----|---------|-------------|----------|--------|---------|---------|
| F-001 | [feature-slug] | [one-sentence description] | 1 | Planned | — | — |
| F-002 | [feature-slug] | [one-sentence description] | 2 | Planned | — | — |
| F-003 | [feature-slug] | [one-sentence description] | 3 | Planned | — | — |
[... one row per feature ...]

---

## Status Key

- **Planned** — Not yet started
- **In Progress** — Currently in brainstorm, build, or ship
- **Shipped** — Completed and deployed (date + episode link filled in)
- **Deferred** — Deprioritized or postponed
- **Dropped** — Removed from roadmap (reason noted)
```

Feature IDs use the format `F-NNN` (zero-padded, sequential). IDs are **permanent** — once assigned, a Feature ID never changes, even if the feature is resequenced, deferred, or dropped.

Priority is a **separate integer column** (1 = build first) that can be freely resequenced at any time without affecting Feature IDs. When a decision triggers a roadmap resequencing (via the Decision Review Party in `skills/decision/SKILL.md`), only the Priority numbers change — Feature IDs and ADR numbers remain stable.

---

## Step 6d — Offer to start the first feature

Read the priority-1 feature from the roadmap just written. Present it to the user:

> "Roadmap captured with [N] features. The first priority is:
>
> **[F-001]: [feature-slug]** — [description]
>
> Shall I start brainstorming this feature now? (Y/n)"

**If the user confirms** (yes, y, sure, go ahead, or any affirmative):
→ Update ROADMAP.md: set `F-001` status to `In Progress`.
→ Proceed to Finalize (Step 7–9), then immediately begin executing `/pdlc brainstorm [feature-slug]` after the summary is printed. Skip the generic Step 10 prompt in SKILL.md — the feature is already chosen.

**If the user declines** (no, not yet, later):
→ Acknowledge:
> "No problem. The roadmap is ready — run `/pdlc brainstorm [feature-slug]` whenever you want to start with the first feature, or pick any other feature from the roadmap."

Proceed to Finalize (Step 7–9) and the standard Step 10 prompt.

**If the user names a different feature** (e.g., "actually, let's start with billing"):
→ If the feature is on the roadmap: note it as the starting point.
→ If the feature is NOT on the roadmap: add it with the next `F-NNN` ID, set priority to 1, shift other priorities down.
→ Update ROADMAP.md accordingly, then proceed to Finalize and auto-launch brainstorm for that feature.

---

Return to `SKILL.md` and proceed to Finalize.
