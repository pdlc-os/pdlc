# Roadmap Ideation
## Steps 6a–6c

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

## Step 6b — Prioritize with the user

Once the feature list is confirmed, ask:

> "Let's put these in priority order — what should we build first, second, third? You can reorder the whole list, or just tell me which ones are highest priority and I'll arrange the rest."

Work with the user to establish a priority sequence. Consider:
- Dependencies (auth before billing, data model before API)
- User value (what delivers the most impact soonest)
- Technical risk (build the riskiest thing early to de-risk)

If the user says "you decide" or defers, use your product judgment to propose an order and confirm it.

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

Feature IDs use the format `F-NNN` (zero-padded, sequential). Priority is a simple integer (1 = build first).

Tell the user:

> "Roadmap captured with [N] features. When we start building, we'll work through these in priority order — starting with `F-001: [feature-slug]`."

---

Return to `SKILL.md` and proceed to Finalize.
