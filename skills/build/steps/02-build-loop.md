## BUILD LOOP

Repeat Steps 4–11 until `bd ready` returns an empty list.

### Step 4 — Get the ready queue

**State variables** — maintain these in working context throughout the build session:
- `[prev-ready-queue]`: the task ID list from the previous `bd ready` call (empty on first run)
- `[loop-count]`: number of times Step 4 has executed (increment after each `bd ready` call, starting at 0)
- `[review-fix-cycles]`: number of Critical-finding fix-regenerate cycles completed (starts at 0; used in Step 13)

Run:
```bash
bd ready --json
```

Parse the JSON output to get the list of unblocked tasks. Increment `[loop-count]`.

**Stagnation detection:** If the returned task ID list is identical to `[prev-ready-queue]` AND `[loop-count]` > 1, a stagnation deadlock may exist. Read `skills/build/party/deadlock-protocol.md` and apply **Deadlock Type 6** (BUILD LOOP Stagnation) before proceeding.

**Hard cap:** If `[loop-count]` exceeds the total number of tasks in the feature (all tasks should complete in at most N iterations), read `skills/build/party/deadlock-protocol.md` and apply the hard cap resolution in **Deadlock Type 6**.

Update `[prev-ready-queue]` to the current task ID list.

If the list is empty: the build loop is complete. Skip to the REVIEW section below.

Display the ready queue to the user in a clear format:

```
READY QUEUE ([N] tasks unblocked)
[bd-id]  [task title]  [labels]
...
```

**Wave Kickoff Standup:** If this is the start of a new wave (first run of the loop, or previous `bd ready` returned empty and now returns tasks), AND the queue has 2+ tasks, read `skills/build/party/orchestrator.md` then `skills/build/party/01-wave-kickoff.md` and execute the standup before proceeding to Step 5. Apply any Beads dependency updates the standup surfaces.

### Step 5 — Select the next task

Pick the highest-priority unblocked task. Priority order:
1. Tasks labeled `backend` (infrastructure first)
2. Tasks labeled `frontend`
3. Tasks labeled `devops`
4. Any remaining tasks

Show the selected task to the user:

> "Next task: `[bd-id]` — [task title]
> Labels: [labels]
> Description: [description]"

### Step 6 — Claim the task

Run:
```bash
bd update [task-id] --claim
```

Update `docs/pdlc/memory/STATE.md`:
- **Active Beads Task**: `[task-id] — [task title]`
- **Last Checkpoint**: `Construction / Build / [now ISO 8601]`

### Step 6b — Design Roundtable (conditional)

After claiming the task, check whether a design roundtable should be offered before building. Read `skills/build/party/02-design-roundtable.md` — follow its "When to Trigger" logic exactly. If auto-suggest fires, offer the roundtable to the user. If the user says yes, read `skills/build/party/orchestrator.md` and run the roundtable. Carry the Implementation Decision into Step 9 as context.

If the task does not meet the auto-suggest criteria, proceed silently to Step 7.

### Step 7 — Choose execution mode

Ask the user:

> "**Choose execution mode for `[task-id]`: [task title]**
>
> **(A) Agent Teams** — Neo, Echo, Phantom, and Jarvis always on, plus auto-selected specialists based on task labels. Best for complex tasks with multiple concerns.
>
> **(B) Sub-Agent** — single focused agent handles the task end-to-end. Best for well-defined, self-contained tasks.
>
> Type **A** or **B**:"

Wait for the user's answer.

### Step 8 — Assemble the team (if Agent Teams selected)

If the user chose **A**:

Always include: **Neo** (Architect), **Echo** (QA Engineer), **Phantom** (Security Reviewer), **Jarvis** (Tech Writer)

Auto-select based on task labels:
- Label contains `backend` → include **Bolt** (Backend Engineer)
- Label contains `frontend` → include **Friday** (Frontend Engineer)
- Label contains `ux` → include **Muse** (UX Designer)
- Label contains `product` → include **Oracle** (PM)
- Label contains `devops` → include **Pulse** (DevOps)

Tell the user which agents are active for this task:

> "Agent team assembled: Neo, Echo, Phantom, Jarvis[, Bolt][, Friday][, Muse][, Oracle][, Pulse]"

Each agent's responsibilities are defined in `agents/[name].md`. Embody each agent's perspective as you work through the task.

If the user chose **B**: proceed as a single focused sub-agent.

### Step 9 — TDD: Build the task

Follow the TDD protocol from `skills/tdd/SKILL.md` exactly. The key steps:

**9a. Read the task context:**
- Run `bd show [task-id]` to get the full task with acceptance criteria
- Read the PRD at `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
- Find the BDD user story that maps to this task via the `story:[US-id]` label
- Read the exact Given/When/Then language for that story
- Read the design docs at `docs/pdlc/design/[feature-name]/`

**9b. For each acceptance criterion, follow Red → Green → Refactor:**

1. **Red**: Write a failing test named using the Given/When/Then language from the PRD. Run it. Confirm it fails for the right reason (logic not implemented, not a syntax error).
2. **Green**: Write the minimal implementation to make the test pass. Run the test — it must pass. Run the full suite — no regressions.
3. **Refactor**: Clean up without changing behavior. Run the full suite again.

**9c. Auto-fix loop:**
- If a test fails after implementation: attempt to fix.
- Maximum **3 automatic fix attempts** per failing test.
- After 3 failed attempts, stop immediately and run the Strike Panel: read `skills/build/party/orchestrator.md` then `skills/build/party/04-strike-panel.md`. The panel diagnoses the root cause and produces 3 ranked approaches. Present the panel output to the human and ask: "(A) Implement approach 1, (B) Implement approach 2, or (C) Take the wheel — I'll guide you." Wait for the human's choice before continuing. The 3-strike counter resets after a human-approved direction change.

**9d. Tier 1 hard blocks — stop and double-confirm (highlighted) before proceeding:**
- Force-pushing to `main`
- Dropping a database table without an explicit migration file
- Deleting files not created in the current feature branch
- Deploying with failing smoke tests

**9e. Tier 2 actions — pause and request explicit yes before proceeding:**
- Any `rm -rf` or bulk delete
- `git reset --hard`
- Running DB migrations in production
- Changing `CONSTITUTION.md`
- Closing all open Beads tasks at once
- Any external API call that writes/posts/sends (Slack, email, webhooks)

(Check `CONSTITUTION.md` §8 — any Tier 2 items the team has downgraded to Tier 3 should proceed with only a logged warning.)

**9f. After all acceptance criteria pass:**
- Run the full test suite one final time. Zero regressions.
- Commit to the feature branch:
  ```bash
  git add [relevant files]
  git commit -m "feat([feature-name]): [task title description]"
  ```

### Step 10 — Mark task complete

Run:
```bash
bd done [task-id]
```

Update `docs/pdlc/memory/STATE.md`:
- **Active Beads Task**: `none`
- **Last Checkpoint**: `Construction / Build / [now ISO 8601]`
- Record completed task in Phase History

### Step 11 — Loop

Return to **Step 4**. Continue until `bd ready` returns an empty list.

---

**Do not stop or wait for user input.** Return to `SKILL.md` and immediately proceed to the REVIEW section.
