# Step 3 — Adversarial review and targeted follow-ups

PDLC now switches into devil's advocate mode. Review everything gathered in the Socratic session with extreme skepticism — you are the toughest critic of this feature on the team, and you assume the concept was submitted by someone who cut corners.

**Your role:** Cynical, jaded reviewer with zero patience for sloppy thinking. Use a precise, professional tone — no personal attacks. Look for what is missing, not just what is wrong.

Review the discovery answers across these dimensions:

- **Assumption gaps** — Are any stated assumptions unverified, optimistic, or plausibly wrong?
- **Scope leaks** — Does the "out of scope" list hold up? Would any excluded item block in-scope items from working?
- **Success metric fragility** — Can the stated metrics actually be measured? Are they gameable? Are they lagging indicators that won't catch problems fast enough?
- **Technical risk blindspots** — What technical risks were never surfaced in the Socratic questions?
- **User problem validity** — Is the stated problem real and specific enough? Is the user group narrow enough to be actionable?
- **Dependency blindspots** — What external systems, data, teams, or permissions weren't mentioned but are clearly required?
- **Edge case silence** — What critical edge cases got no attention (error paths, concurrent usage, data migration, rollback)?
- **Requirement conflicts** — Do any requirements contradict each other, or contradict the constraints from CONSTITUTION.md?
- **Definition-of-done gaps** — Are there acceptance criteria that can't be tested, verified, or falsified as written?
- **Timeline and sizing naivety** — Is the scoped work realistically achievable, or are there hidden depths that weren't discussed?

Find **at least 10 issues**. If you genuinely cannot find 10, re-analyze with greater skepticism — this is suspicious. Do not suppress findings to be polite.

Present your findings to the user in a clearly labelled block:

```
ADVERSARIAL REVIEW — [feature-name]

The following concerns must be addressed before this feature concept is solid:

1. [finding]
2. [finding]
...
10+. [finding]
```

Then immediately tell the user:

> "I'm going to ask follow-up questions on the most impactful of these. You can type `skip` at any time to stop and proceed to the discovery summary."

Convert the **top 5 most impactful findings** (by risk to the feature succeeding) into targeted follow-up questions. Read `skills/interaction-mode.md` and apply the active `[interaction-mode]`:

- **Socratic mode:** Ask them **one at a time** — one question per message, wait for the answer, prefer multiple-choice where options exist. After each answer, update your internal model — if the answer resolves other findings, drop those follow-ups; if it surfaces new concerns, add them.
- **Sketch mode:** Present all 5 follow-ups as a single batched block. For each, draft a proposed answer from the existing discovery record (Socratic answers, divergent standouts, CONSTITUTION/INTENT) where possible, citing the source. Mark any question with no context-backed draft as `(no context — your input needed)`. Wait for one response that addresses the batch. If the user's response closes fewer than all 5, loop once more with a smaller batched block for the remaining items.

Continue until the top findings are addressed or the user types any termination command (`skip`, `generate`, `done`, `draft`, `create`).

---

## Brainstorm log update

**When the adversarial review is complete**, replace the `## Adversarial Review` section in `[brainstorm-log]` with:

````markdown
## Adversarial Review

**Completed:** [ISO 8601 timestamp]

### Findings
1. [finding]
2. [finding]
...

### Follow-up Q&A
**Q:** [question]
**A:** [answer]
[repeat for each follow-up asked; omit section if user skipped]
````

Update `last-updated` in the frontmatter to now.

**Do not stop or wait for user input.** Return to `01-discover.md` and immediately proceed to Step 4 (Edge Case Analysis).
