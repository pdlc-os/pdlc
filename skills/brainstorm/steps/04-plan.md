# Sub-phase 4: PLAN
## Steps 13–19

---

### Step 13 — Break the feature into tasks

Analyze the approved PRD and design documents. Break the feature into discrete, implementable tasks. Follow these rules:

- Each task corresponds to one coherent unit of work (one service method, one API endpoint, one UI component, one migration). Do not make tasks too large (no "build the whole feature in one task") or too small (no "add a single variable").
- Each task must have a clear title, description, and direct link to one or more acceptance criteria from the PRD.
- Assign tech domain labels to each task: `backend`, `frontend`, `ux`, `devops`, or combinations.
- Group tasks under their relevant user stories using the `story:[US-id]` label.
- Identify dependency relationships: which tasks must complete before others can begin.

---

### Step 14 — Create tasks in Beads

For each task, run:
```bash
bd create "[Task title]" \
  --description "[Detailed description. Reference PRD acceptance criteria by number. Include any context the implementing agent will need.]" \
  --label "epic:[feature-name],story:[US-id],[domain-label]" \
  --type feature
```

Capture the Beads task ID returned for each task (format: `bd-XXXX`).

---

### Step 15 — Set up task dependencies

For each dependency relationship (task B cannot start before task A completes), run:
```bash
bd dep add [task-a-id] --blocks [task-b-id]
```

Set up all dependency relationships before generating the tree.

---

### Step 16 — Generate the dependency tree

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

---

### Step 17 — Save the plan file

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
[one row per task, filled in from Step 13 and 14]

---

## Dependency Graph

[paste the Mermaid output from Step 15 here in a code block]

---

## Implementation Order

[A numbered list describing the natural wave order: which tasks can run in parallel in each wave, based on the dependency graph]
```

---

### Step 18 — Plan approval gate

Tell the user:

> "Task plan is ready at `docs/pdlc/prds/plans/plan_[feature-name]_[YYYY-MM-DD].md`
>
> [N] tasks created in Beads. The dependency graph shows [X] waves of parallel work.
>
> Please review the plan. Reply **approve** to move to Construction, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed until approved.

If the user requests changes (add/remove/split tasks): make the changes in Beads and update the plan file. Re-present for approval.

---

### Step 19 — Wrap up Inception

After plan approval:

**Stop the visual companion server** (if it was running):
```bash
bash scripts/stop-server.sh
```

Mockup files created during Inception persist in `.pdlc/brainstorm/` for reference.

**Update `[brainstorm-log]` frontmatter:**
```
status: inception-complete
last-updated: [ISO 8601 timestamp]
```

**Update `docs/pdlc/memory/STATE.md`**:
- **Current Phase**: `Inception Complete — Ready for /build`
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
→ Update `docs/pdlc/memory/STATE.md` **before** starting the build flow:
  - **Current Phase**: `Construction`
  - **Current Sub-phase**: `Build`
  - **Last Checkpoint**: `Construction / Build / [now ISO 8601]`
→ Then immediately begin executing the `/pdlc build` flow (the build SKILL will resume cleanly from STATE.md if context compacts mid-transition).

**If the user responds with "no", "not yet", "later", or any deferral**:
→ Acknowledge and stop:
> "No problem. When you're ready, run `/pdlc build` to begin Construction."

---

Return to `SKILL.md`. Inception is complete.
