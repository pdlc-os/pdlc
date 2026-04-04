---
description: Run the Inception phase for a feature (Discover → Define → Design → Plan)
argument-hint: <feature-name>
---

You are running the Inception phase for a feature. The argument passed to this command is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user: "What feature would you like to brainstorm? (Provide a short slug, e.g. `user-auth` or `billing-integration`)"

The feature name (slug) must be kebab-case (lowercase, hyphens, no spaces). If the user provides a name with spaces, convert it automatically (e.g. "user auth" → `user-auth`) and confirm with them.

Store the feature slug as `[feature-name]`. Use today's date as `[YYYY-MM-DD]` wherever dates appear in file names and metadata.

---

## Pre-flight: Load project context

Before anything else, read these two files completely:

1. `docs/pdlc/memory/CONSTITUTION.md` — for tech stack, architectural constraints, test gates, and coding standards
2. `docs/pdlc/memory/INTENT.md` — for the core problem, target user, and value proposition

If either file is missing, stop and tell the user:

> "PDLC memory files not found. Please run `/pdlc init` first to set up this project."

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Inception`
- **Current Feature**: `[feature-name]`
- **Current Sub-phase**: `Discover`
- **Last Checkpoint**: `Inception / Discover / [now ISO 8601]`

---

## Sub-phase 1: DISCOVER

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

### Step 2 — Socratic discovery

Before asking the first question, print this notice in blue text using ANSI escape codes:

```
\x1b[34mTip: You can type 'skip' at any time to stop the questions and proceed to PRD generation with whatever information has been collected so far.\x1b[0m
```

Ask the user probing questions **one at a time**. Wait for each answer before asking the next. Minimum 6 questions. Use the answers to build a rich understanding of the feature before generating any output.

After each answer, check: **if the user's response is exactly `skip` (case-insensitive), stop asking questions immediately and proceed to Step 3 (external context ingestion) using whatever answers have been collected so far.** Mark unanswered questions as `TBD — skipped during discovery` in the PRD draft.

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

### Step 3 — Ingest external context (if applicable)

If during the conversation the user mentions:
- A URL → use WebFetch to retrieve the content and summarize what is relevant
- "my Figma file" or "the Figma link" → ask them to share the URL; retrieve and summarize the design intent
- "the Notion doc" or "our spec in Notion" → ask for the URL; retrieve and summarize
- "a Word doc" or shared document → ask them to paste the relevant content directly if you cannot retrieve it

Summarize any external content you retrieve and confirm with the user what you have extracted as relevant requirements.

### Step 4 — Present discovery summary

After the Socratic session is complete, present a structured summary to the user for confirmation before proceeding to Define. Format it clearly:

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

---

## Sub-phase 2: DEFINE

### Step 5 — Generate the PRD draft

Auto-generate a complete PRD draft from the discovery conversation. Use `templates/PRD.md` as the exact structure. Fill in every section:

- **Overview**: 2–4 sentences connecting the feature to a goal in INTENT.md
- **Problem Statement**: concrete, feature-specific problem from the discovery
- **Target User**: from the discovery answer, cross-referencing INTENT.md personas
- **Requirements**: numbered list using MUST/SHOULD/MAY (RFC 2119). Derive from the discovery answers. Minimum 4 requirements.
- **Assumptions**: surfaced from the discovery session. Minimum 3.
- **Acceptance Criteria**: numbered, binary pass/fail conditions. Map 1:1 or 1:many with requirements. Minimum 4.
- **User Stories**: BDD Given/When/Then format. Label as US-001, US-002, etc. One story per major acceptance criterion group. Cross-reference AC numbers.
- **Non-Functional Requirements**: performance, security, accessibility derived from constraints and CONSTITUTION.md
- **Out of Scope**: from the discovery answer
- **Design Docs**: leave as template placeholder — will be filled in after Design sub-phase
- **Approval**: leave blank — to be filled by human

Set **Status**: `Draft` and **Date**: today's date.

Save the file to: `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`

### Step 6 — PRD approval gate

Tell the user:

> "PRD draft is ready at `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
>
> Please review it. Reply **approve** to continue to Design, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed to Design until the user approves.

If the user provides feedback: revise the PRD, save the updated file, and re-present for approval. Repeat until approved.

When approved: update the PRD's **Status** field to `Approved` and record the approver's name/initials and date in the Approval section.

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Design`.

---

## Sub-phase 3: DESIGN

### Step 7 — Create the design directory

Run:
```bash
mkdir -p docs/pdlc/design/[feature-name]
```

### Step 8 — Generate design documents

Generate three design documents based on the approved PRD and the tech stack from `CONSTITUTION.md`:

**8a. `docs/pdlc/design/[feature-name]/ARCHITECTURE.md`**

Document how this feature fits into the existing architecture. Include:
- Where this feature lives in the system (which layer, which service)
- What existing modules or services it integrates with or extends
- New modules or services introduced (if any) and their boundaries
- Data flow: how data moves through the system for this feature's key user journeys
- Architectural decisions made for this feature (with rationale)
- How this conforms to the constraints in `CONSTITUTION.md` §3
- A Mermaid flowchart showing the high-level component interactions

Use the tech stack from CONSTITUTION.md to ensure the architecture is specific to the actual stack, not generic.

**8b. `docs/pdlc/design/[feature-name]/data-model.md`**

Document any new or modified data structures. Include:
- New database tables or collections, with all columns/fields and their types
- Modifications to existing tables (new columns, index changes)
- Relationships (foreign keys, references) and cardinality
- A Mermaid entity-relationship diagram
- Migration notes: what migration file(s) will be needed
- Any data that is deliberately NOT persisted and why

If this feature requires no data model changes, write: "No data model changes. This feature operates on existing schema." and explain why.

**8c. `docs/pdlc/design/[feature-name]/api-contracts.md`**

Document any new or modified API endpoints. For each endpoint:
- Method and path
- Authentication requirements
- Request body schema (with field types, required/optional, validation rules)
- Response body schema for success (200/201)
- Response body schemas for each error case (400, 401, 403, 404, 500)
- Example request and example response
- Rate limiting or pagination notes (if applicable)

If this feature requires no new API endpoints, write: "No new API endpoints. This feature is [client-only / uses existing endpoints / etc.]" and explain.

### Step 9 — Update PRD design doc links

Update `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` to fill in the Design Docs section with relative links to the three files just created.

### Step 10 — Design approval gate

Tell the user:

> "Design documents are ready in `docs/pdlc/design/[feature-name]/`:
> - `ARCHITECTURE.md`
> - `data-model.md`
> - `api-contracts.md`
>
> Please review them. Reply **approve** to continue to Plan, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed to Plan until the user approves.

If the user provides feedback: revise the relevant design doc(s), save the updated files, and re-present for approval. Repeat until approved.

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Plan`.

---

## Sub-phase 4: PLAN

### Step 11 — Break the feature into tasks

Analyze the approved PRD and design documents. Break the feature into discrete, implementable tasks. Follow these rules:

- Each task corresponds to one coherent unit of work (one service method, one API endpoint, one UI component, one migration). Do not make tasks too large (no "build the whole feature in one task") or too small (no "add a single variable").
- Each task must have a clear title, description, and direct link to one or more acceptance criteria from the PRD.
- Assign tech domain labels to each task: `backend`, `frontend`, `ux`, `devops`, or combinations.
- Group tasks under their relevant user stories using the `story:[US-id]` label.
- Identify dependency relationships: which tasks must complete before others can begin.

### Step 12 — Create tasks in Beads

For each task, run:
```bash
bd create "[Task title]" \
  --description "[Detailed description. Reference PRD acceptance criteria by number. Include any context the implementing agent will need.]" \
  --label "epic:[feature-name],story:[US-id],[domain-label]" \
  --type feature
```

Capture the Beads task ID returned for each task (format: `bd-XXXX`).

### Step 13 — Set up task dependencies

For each dependency relationship (task B cannot start before task A completes), run:
```bash
bd dep add [task-b-id] --blocks [task-a-id]
```

Set up all dependency relationships before generating the tree.

### Step 14 — Generate the dependency tree

Run:
```bash
bd dep tree --format mermaid
```

Capture the Mermaid output.

If the visual companion server is running, write the dependency graph as an HTML fragment to `screen_dir` so the user can see the task waves in the browser. Use the `.mockup` container and a Mermaid diagram block (the frame template loads Mermaid automatically):

```html
<!-- filename: dependency-tree.html -->
<h2>Task Dependency Graph — [feature-name]</h2>
<p class="subtitle">Wave-based execution order. Tasks in the same wave can run in parallel.</p>
<div class="mockup">
  <div class="mockup-header">Dependency Tree</div>
  <div class="mockup-body">
    <pre class="mermaid">
[paste mermaid output here]
    </pre>
  </div>
</div>
```

Remind the user of the URL and tell them: "The dependency graph is now showing in the browser."

### Step 15 — Save the plan file

Create `docs/pdlc/prds/plans/plan_[feature-name]_[YYYY-MM-DD].md` with this content:

```markdown
# Plan: [Feature Name]

**Feature:** [feature-name]
**Date:** [YYYY-MM-DD]
**PRD:** [PRD_[feature-name]_[YYYY-MM-DD].md](../PRD_[feature-name]_[YYYY-MM-DD].md)

---

## Tasks

| Beads ID | Title | Labels | Depends On |
|----------|-------|--------|-----------|
[one row per task, filled in from Step 12 and 13]

---

## Dependency Graph

[paste the Mermaid output from Step 14 here in a code block]

---

## Implementation Order

[A numbered list describing the natural wave order: which tasks can run in parallel in each wave, based on the dependency graph]
```

### Step 16 — Plan approval gate

Tell the user:

> "Task plan is ready at `docs/pdlc/prds/plans/plan_[feature-name]_[YYYY-MM-DD].md`
>
> [N] tasks created in Beads. The dependency graph shows [X] waves of parallel work.
>
> Please review the plan. Reply **approve** to move to Construction, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed until approved.

If the user requests changes (add/remove/split tasks): make the changes in Beads and update the plan file. Re-present for approval.

### Step 17 — Wrap up Inception

After plan approval:

**Stop the visual companion server** (if it was running):
```bash
bash scripts/stop-server.sh
```

Mockup files created during Inception persist in `.pdlc/brainstorm/` for reference.

**Update `docs/pdlc/memory/STATE.md`**:
- **Current Phase**: `Inception Complete — Ready for /pdlc build`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Inception / Plan / [now ISO 8601]`

Append to Phase History:
```
| [now] | inception_complete | Inception Complete | Plan | [feature-name] |
```

**Tell the user**:

> "Inception complete for `[feature-name]`.
>
> - PRD: `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
> - Design: `docs/pdlc/design/[feature-name]/`
> - Plan: `docs/pdlc/prds/plans/plan_[feature-name]_[YYYY-MM-DD].md`
> - Beads tasks created: [N]"

Then immediately ask:

> "Would you like to move to Construction and start building `[feature-name]` now?
>
> - Say **yes** to begin immediately
> - Or type `/pdlc build` at any time to start manually"

**If the user responds with "yes", "y", "sure", "go ahead", or any clear affirmative**:
→ Immediately begin executing the `/pdlc build` flow without waiting for the user to type the command.

**If the user responds with "no", "not yet", "later", or any deferral**:
→ Acknowledge and stop:
> "No problem. When you're ready, run `/pdlc build` to begin Construction."

---

## Rules

- Never generate a PRD, design doc, or plan without completing the Discover phase first.
- Never proceed past an approval gate without explicit human confirmation. "Looks good" counts as approval; "not yet" or silence does not.
- Do not create the feature branch during Inception — that happens at the start of Construction.
- If the user wants to change scope mid-Inception (after PRD is approved), update the PRD first and re-obtain approval before updating the design docs.
- The visual companion server runs only during Inception. It must be stopped before Inception ends.
