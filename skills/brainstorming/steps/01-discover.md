# Sub-phase 1: DISCOVER
## Steps 1–5

---

### Step 1 — Offer the Visual Companion

Assess whether the upcoming Discover questions for this feature are likely to involve visual content — UI layouts, wireframes, architecture diagrams, flow comparisons, mockup options.

**If yes:** send the following as a **standalone message with no other content** — no clarifying questions, no summaries, nothing else. Wait for the user's response before continuing.

> "Some of what we're working on might be easier to explain if I can show it to you in a web browser. I can put together mockups, wireframes, architecture diagrams, and visual comparisons as we go. Want to try it? (Requires opening a local URL)"

**If the user accepts:**

Run:
```bash
bash scripts/start-server.sh --project-dir $(pwd) --feature [feature-name]
```

Capture `screen_dir` and `state_dir` from the JSON output. Tell the user the URL and ask them to open it. Read `skills/brainstorming/visual-companion.md` for the full visual loop protocol — follow it exactly for every visual question.

**If the user declines, or this is a non-visual feature:**

Proceed text-only. Do not start the server. Do not mention the visual companion again.

If the scripts directory is missing, skip this step entirely and proceed text-only — do not block the workflow.

---

**Per-question decision (applies throughout all of Discover):**

For each question, decide whether to use the browser or the terminal:

- **Use the browser** for content that IS visual: UI mockups, wireframes, layout comparisons, architecture diagrams, flowcharts, side-by-side designs
- **Use the terminal** for content that is text: requirements questions, conceptual choices, tradeoff lists, scope decisions, anything answered in words

A question *about* a UI topic is not automatically a visual question. "What navigation structure do you want?" is conceptual — use the terminal. "Which of these navigation layouts feels right?" is visual — use the browser.

When using the browser, follow the loop in `skills/brainstorming/visual-companion.md` (write fragment to `screen_dir`, remind user of URL, read `state_dir/events` on next turn, push waiting screen when returning to terminal).

---

**Discover guidelines (apply throughout all of Discover):**

1. **Assess scope before asking detailed questions.** If the request describes multiple independent subsystems (e.g. "build a platform with chat, file storage, billing, and analytics"), flag this immediately — do not spend questions refining details of a project that needs decomposition first.

2. **Decompose large projects before proceeding.** If the feature is too large for a single PRD, help the user break it into sub-projects: what are the independent pieces, how do they relate, what order should they be built? Then run the full `/brainstorm → /build → /ship` cycle for the first sub-project only. Each sub-project gets its own inception.

3. **Prefer multiple-choice questions.** When a question has a natural set of options, present them as choices (A / B / C) rather than asking open-ended. Open-ended is fine when the space of answers is genuinely unconstrained.

4. **Focus each question on one of:** purpose, constraints, or success criteria. Avoid multi-part questions — one question per message, always.

5. **When exploring approaches, propose 2–3 options conversationally.** Lead with your recommendation and explain why. Include trade-offs. Do not present options as a neutral list — have a point of view.

6. **Ensure the following are covered before moving to Define:** architecture fit, key components, data flow, error handling approach, and testing strategy. If any of these are still unclear after the structured questions, ask targeted follow-ups before proceeding.

7. **Go back and clarify freely.** If a later answer contradicts or complicates an earlier one, revisit it. Accuracy of the discovery output matters more than linear progress.

8. **Use clear & precise language.** When generating documents for human review (PRD, Design docs, Plan), apply `skills/writing-clearly-and-concisely/SKILL.md`. Active voice, definite language, no needless words.

---

### Step 2 — Socratic discovery

Before asking the first question, print this notice in blue text using ANSI escape codes:

```
\x1b[34mTip: You can type 'skip' at any time to stop the questions and proceed with whatever information has been collected so far.\x1b[0m
```

Ask the user probing questions **one at a time**. Wait for each answer before asking the next. Minimum 6 questions. Use the answers to build a rich understanding of the feature before generating any output.

After each answer, check: **if the user's response is exactly `skip` (case-insensitive), stop asking questions immediately and proceed to Step 3 (adversarial review) using whatever answers have been collected so far.** Mark unanswered questions as `TBD — skipped during discovery` in the PRD draft.

Ask these questions in this order:

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

Continue until you have a clear, concrete picture of the feature. Stop when you are confident you can write a complete PRD.

---

### Step 3 — Adversarial review and targeted follow-ups

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

Convert the **top 5 most impactful findings** (by risk to the feature succeeding) into targeted follow-up questions. Ask them **one at a time** following the same rules as the Socratic session: one question per message, wait for the answer, prefer multiple-choice where options exist.

After each answer, update your internal model of the feature — if the answer resolves other findings, drop those follow-ups. If the answer surfaces new concerns, add them.

Continue until the top findings are addressed or the user types `skip`.

---

### Step 4 — Ingest external context (if applicable)

If during the conversation the user mentions:
- A URL → use WebFetch to retrieve the content and summarize what is relevant
- "my Figma file" or "the Figma link" → ask them to share the URL; retrieve and summarize the design intent
- "the Notion doc" or "our spec in Notion" → ask for the URL; retrieve and summarize
- "a Word doc" or shared document → ask them to paste the relevant content directly if you cannot retrieve it

Summarize any external content you retrieve and confirm with the user what you have extracted as relevant requirements.

---

### Step 5 — Present discovery summary

After the Socratic session and adversarial review are complete, present a structured summary to the user for confirmation before proceeding to Define. Format it clearly:

```
DISCOVERY SUMMARY — [feature-name]

Feature: [Feature Name]
Problem: [1–2 sentences]
User: [who and context]
Success metric: [specific, measurable]
Technical constraints: [bullet list]
Out of scope: [bullet list]
Key risks / assumptions: [bullet list]
```

Ask: "Does this capture what you have in mind? Confirm to continue to Define, or tell me what to adjust."

Iterate until the user confirms.

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Define`.
