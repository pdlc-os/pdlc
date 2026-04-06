# Sub-phase 1: DISCOVER
## Steps 0–6

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

Read `skills/brainstorm/steps/00-divergent-ideation.md` and execute it completely.
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

If the output contains `"type": "server-started"`: capture `screen_dir` and `state_dir` from the JSON output. Tell the user the URL and ask them to open it. Read `skills/brainstorm/visual-companion.md` for the full visual loop protocol — follow it exactly for every visual question.

If the output contains `"error"`: the server failed to start. Retry up to **2 more times** (3 total attempts). On each retry, wait 5 seconds before trying again.

If all 3 attempts fail:

> "The visual companion server couldn't start after 3 attempts. This won't stop us — I'll describe everything in the terminal instead. Mockups will be described as structured text, and you can ask me to generate Mermaid diagrams inline."

Set the session to **text-only mode** — do not attempt to start the server again for the rest of this brainstorm session. Proceed with the same discovery flow but use terminal descriptions instead of browser visuals:
- For layout/UI questions: describe options as structured text with ASCII sketches or markdown tables
- For architecture diagrams: output Mermaid diagram code blocks directly in the terminal
- For A/B comparisons: present options as numbered lists with pros/cons
- For design choices: use the same question format but without the "open your browser" instruction

**If the user declines, or this is a non-visual feature:**

Proceed text-only. Do not start the server. Do not mention the visual companion again.

If the scripts directory is missing, skip this step entirely and proceed text-only — do not block the workflow.

**Mid-session server failure:**

If the visual companion server crashes or stops responding during the brainstorm (detected via health check failure or `$STATE_DIR/server-stopped`), attempt one restart:

```bash
bash scripts/start-server.sh --project-dir $(pwd) --feature [feature-name]
```

If the restart fails:

> "The visual companion server stopped and couldn't be restarted. Switching to text-only mode for the rest of this session."

Continue in text-only mode. Do not block the brainstorm workflow for a server failure.

---

## Shared rules (apply throughout all of Discover)

**Per-question decision:**

For each question, decide whether to use the browser or the terminal:

- **Use the browser** for content that IS visual: UI mockups, wireframes, layout comparisons, architecture diagrams, flowcharts, side-by-side designs
- **Use the terminal** for content that is text: requirements questions, conceptual choices, tradeoff lists, scope decisions, anything answered in words

A question *about* a UI topic is not automatically a visual question. "What navigation structure do you want?" is conceptual — use the terminal. "Which of these navigation layouts feels right?" is visual — use the browser.

When using the browser, follow the loop in `skills/brainstorm/visual-companion.md` (write fragment to `screen_dir`, remind user of URL, read `state_dir/events` on next turn, push waiting screen when returning to terminal).

**Discover guidelines:**

1. **Assess scope before asking detailed questions.** If the request describes multiple independent subsystems (e.g. "build a platform with chat, file storage, billing, and analytics"), flag this immediately — do not spend questions refining details of a project that needs decomposition first.

2. **Decompose large projects before proceeding.** If the feature is too large for a single PRD, help the user break it into sub-projects: what are the independent pieces, how do they relate, what order should they be built? Then run the full `/pdlc brainstorm → /pdlc build → /pdlc ship` cycle for the first sub-project only. Each sub-project gets its own inception.

3. **Prefer multiple-choice questions.** When a question has a natural set of options, present them as choices (A / B / C) rather than asking open-ended. Open-ended is fine when the space of answers is genuinely unconstrained.

4. **Focus each question on one of:** purpose, constraints, or success criteria. Avoid multi-part questions — one question per message, always.

5. **When exploring approaches, propose 2–3 options conversationally.** Lead with your recommendation and explain why. Include trade-offs. Do not present options as a neutral list — have a point of view.

6. **Ensure the following are covered before moving to Define:** architecture fit, key components, data flow, error handling approach, and testing strategy. If any of these are still unclear after the structured questions, ask targeted follow-ups before proceeding.

7. **Go back and clarify freely.** If a later answer contradicts or complicates an earlier one, revisit it. Accuracy of the discovery output matters more than linear progress.

8. **Use clear & precise language.** When generating documents for human review (PRD, Design docs, Plan), apply `skills/writing-clearly-and-concisely/SKILL.md`. Active voice, definite language, no needless words.

---

## Discover execution

Read each file completely and execute every step in it before moving to the next. Do not skip a step.

### Step 2 — Socratic discovery

Read `skills/brainstorm/steps/discover/01-socratic-discovery.md` and execute it completely.

Return here when the brainstorm log's `## Socratic Discovery` section is populated.

### Step 2a — Progressive thinking (agent team meeting)

Read `skills/brainstorm/steps/discover/06-progressive-thinking.md` and execute it completely.

This is a **required** team meeting — it cannot be skipped by the user. Oracle questions all 8 other agents across 6 progressive rounds (Concrete → Inferential → Consequential → Speculative → Conflicting → Strategic) to refine the feature understanding. The user is only pulled in when agents cannot resolve a conflict.

Return here when the brainstorm log's `## Progressive Thinking (Agent Team Meeting)` section is populated.

### Step 3 — Adversarial review

Read `skills/brainstorm/steps/discover/02-adversarial-review.md` and execute it completely.

Return here when the brainstorm log's `## Adversarial Review` section is populated.

### Step 4 — Edge case analysis

Read `skills/brainstorm/steps/discover/03-edge-case-analysis.md` and execute it completely.

Return here when the brainstorm log's `## Edge Case Analysis` section is populated.

### Steps 5–6 — External context and discovery summary

Read `skills/brainstorm/steps/discover/04-synthesis.md` and execute it completely.

Discover is complete when the brainstorm log shows `status: discover-complete` and STATE.md shows `Define`.
