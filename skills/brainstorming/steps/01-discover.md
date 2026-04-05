# Sub-phase 1: DISCOVER
## Steps 0–5

---

### Step 0 — Offer divergent ideation (optional)

Before narrowing in on a feature direction, the user can open the idea space wide first.
Send the following as a **standalone message with no other content**. Wait for the response before continuing.

> "Before we start asking focused questions about `[feature-name]`, would you like to do **divergent ideation** first?
>
> This means generating 100+ raw ideas using structured domain rotation — Technical → UX → Business → Edge Cases — cycling every 10 ideas to avoid semantic drift. The goal is to surface unexpected angles before we converge on a direction.
>
> - **Yes** — run divergent ideation first, then move to Socratic questioning
> - **No / skip** — go straight to Socratic questioning"

**If the user says yes:**

Read `skills/brainstorming/steps/00-divergent-ideation.md` and execute it completely.
Return here and continue with Step 1 when it is done.

**If the user says no or skip:**

Proceed directly to Step 1.

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

**If divergent ideation was run (Step 0):** before asking the first question, review `[divergent-standouts]` from the brainstorm log. Use the standouts to sharpen the Socratic questions — reference specific standout ideas when asking about success metrics ("One idea that surfaced was X — does that direction change what success looks like?"), constraints ("Standout idea Y touched [area] — what constraints apply there?"), and risks ("Several ideas pointed toward Z — what assumptions are we making if we go that direction?"). Do not recite the standouts back verbatim; weave them into the questions naturally.

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

**After the final answer** (or after `skip`), append to `[brainstorm-log]` by replacing the `## Socratic Discovery` section with:

````markdown
## Socratic Discovery

**Completed:** [ISO 8601 timestamp]

### Q1: What problem does this specific feature solve?
**A:** [answer]

### Q2: Who specifically will use this feature?
**A:** [answer]

### Q3: What does success look like?
**A:** [answer]

### Q4: What are the technical constraints or dependencies?
**A:** [answer]

### Q5: What is explicitly out of scope?
**A:** [answer]

### Q6: What are the key risks or assumptions?
**A:** [answer]

### Follow-up Q&A
**Q:** [question]
**A:** [answer]
[repeat for each follow-up asked]
````

Update `last-updated` in the frontmatter to now.

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

---

### Step 4 — Edge case analysis

This step is **method-driven, not attitude-driven** — unlike the adversarial review, which takes a critical stance, edge case analysis is mechanical: exhaustively walk every branching path and boundary condition in the feature concept and report only the ones that lack explicit handling.

**Your role:** Pure path tracer. Do not comment on whether the feature design is good or bad. Only enumerate unhandled scenarios. Discard handled ones silently.

**Content to trace:** Everything captured so far — the feature concept, Socratic answers, adversarial follow-up answers, and divergent standouts (if run). Treat this as the full specification scope.

Walk every branching path across these edge case categories. Derive the relevant cases from the feature itself — do not apply a fixed checklist mechanically:

- **User flow branches** — alternative paths through the feature: cancel mid-flow, back-navigate, double-submit, timeout while waiting, session expiry during a multi-step flow
- **Empty and boundary data** — null/empty inputs, zero-item lists, single-item edge, maximum limits (length, size, count), values at exact boundaries (e.g. exactly the limit vs. one over)
- **Invalid and malformed inputs** — wrong type, unexpected format, SQL/script injection surface, encoding edge cases
- **Permission and access boundaries** — unauthenticated request, insufficient role, resource belonging to a different user/tenant, expired or revoked token mid-operation
- **Concurrency and timing** — two users acting on the same record simultaneously, a background job failing partway through, stale data read between write and commit, optimistic lock conflicts
- **Integration failure modes** — external API is down, returns an unexpected response format, times out, rate-limits the caller, returns a partial response
- **Scale and load conditions** — single item vs. thousands, paginated vs. bulk operations, large file/payload, slow network
- **Partial completion and rollback** — what if the operation succeeds on one side of a transaction but fails on the other; how does the system recover; is there an undo path
- **Migration and transition states** — data that existed before this feature was shipped, users mid-flow during a deploy, feature-flag partial rollout

For each unhandled path found, record:
- **Category** (from the list above)
- **Scenario** (one sentence describing the situation)
- **Trigger condition** (what causes this path to be reached, max 15 words)
- **Currently addressed?** (yes / no / partial — based on what was discussed in discovery)
- **Risk if unhandled** (what could actually go wrong, max 15 words)

Discard any path that was explicitly addressed in the Socratic answers or adversarial follow-ups.

Present findings in a table:

```
EDGE CASE ANALYSIS — [feature-name]

| # | Category | Scenario | Trigger Condition | Addressed? | Risk if Unhandled |
|---|----------|----------|------------------|------------|-------------------|
| 1 | ...      | ...      | ...              | No         | ...               |
```

After the table, ask the user to triage each unhandled finding into one of three buckets:

> "For each unhandled edge case, tell me how to handle it:
>
> - **In scope** — add to acceptance criteria in the PRD
> - **Out of scope** — explicitly exclude it with a note on why
> - **Known risk** — record it as a known risk / deferred item in the PRD
>
> You can respond with a list like: `1=in scope, 2=out of scope, 3=risk, 4=in scope` or address them one at a time."

Process the user's triage. For any item marked **in scope**, ask one targeted follow-up to capture enough detail to write an acceptance criterion (e.g. "What should happen when X? What's the expected system response?"). Do not ask follow-ups for out-of-scope or risk items.

Store the triage decisions as `[edge-case-triage]` — they feed directly into the PRD's Requirements, Acceptance Criteria, and Known Risks sections.

**When edge case analysis is complete**, append a new `## Edge Case Analysis` section to `[brainstorm-log]`:

````markdown
## Edge Case Analysis

**Completed:** [ISO 8601 timestamp]

### Findings

| # | Category | Scenario | Trigger Condition | Addressed? | Risk if Unhandled |
|---|----------|----------|------------------|------------|-------------------|
[table rows]

### Triage Decisions

| # | Decision | Notes |
|---|----------|-------|
| 1 | In scope | [acceptance criterion captured] |
| 2 | Out of scope | [reason] |
| 3 | Known risk | [deferred — reason] |
[repeat for each finding]
````

Update `last-updated` in the frontmatter to now.

---

### Step 5 — Ingest external context (if applicable)


If during the conversation the user mentions:
- A URL → use WebFetch to retrieve the content and summarize what is relevant
- "my Figma file" or "the Figma link" → ask them to share the URL; retrieve and summarize the design intent
- "the Notion doc" or "our spec in Notion" → ask for the URL; retrieve and summarize
- "a Word doc" or shared document → ask them to paste the relevant content directly if you cannot retrieve it

Summarize any external content you retrieve and confirm with the user what you have extracted as relevant requirements.

**If any external context was ingested**, replace the `## External Context` section in `[brainstorm-log]` with:


````markdown
## External Context

### [Source title or URL]
**Ingested:** [ISO 8601 timestamp]
**Extracted as relevant:**
[bullet list of requirements or decisions extracted from this source]

[repeat block for each source]
````

Update `last-updated` in the frontmatter to now.

---

### Step 6 — Present discovery summary

After the Socratic session, adversarial review, and edge case analysis are complete, present a structured summary to the user for confirmation before proceeding to Define. Format it clearly:

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

**When the summary is confirmed**, replace the `## Discovery Summary` section in `[brainstorm-log]` with the confirmed summary verbatim, and update the frontmatter:

```
status: discover-complete
last-updated: [ISO 8601 timestamp]
approved-by: [user name or initials if known, else "user"]
approved-date: [ISO 8601 timestamp]
```

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Define`.
