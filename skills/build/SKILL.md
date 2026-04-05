---
name: build
description: "Run the Construction phase (Build → Review → Test) for the current feature"
---

You are running the Construction phase. Follow every step in order. Do not skip steps.

---

## Pre-flight: Load state and context

### Step 1 — Read current state

Read `docs/pdlc/memory/STATE.md` completely.

Extract:
- **Current Feature**: the `[feature-name]` slug
- **Current Phase**: must be `Inception Complete — Ready for /build` or `Construction`

If **Current Feature** is `none` or the phase is not set to a Construction-ready state, stop and tell the user:

> "No active feature found. Please run `/brainstorm <feature-name>` first to complete the Inception phase before building."

If STATE.md indicates Construction is already in progress (phase is `Construction`), resume from the last checkpoint. Read the **Last Checkpoint** field and continue from the appropriate step below.

### Step 2 — Read CONSTITUTION.md

Read `docs/pdlc/memory/CONSTITUTION.md` completely. Note:
- Test gates (Section 7) — which layers must pass before Operation
- Architectural constraints (Section 3)
- Coding standards (Section 2)
- Definition of done (Section 5)

### Step 3 — Create the feature branch

Check if the feature branch already exists:
```bash
git branch --list feature/[feature-name]
```

If it does not exist, create it:
```bash
git checkout -b feature/[feature-name]
```

If it already exists (resuming), check it out:
```bash
git checkout feature/[feature-name]
```

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Construction`
- **Current Sub-phase**: `Build`
- **Last Checkpoint**: `Construction / Build / [now ISO 8601]`

---

## BUILD LOOP

Repeat Steps 4–12 until `bd ready` returns an empty list.

### Step 4 — Get the ready queue

Run:
```bash
bd ready --json
```

Parse the JSON output to get the list of unblocked tasks.

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

## REVIEW

Once `bd ready` is empty (all tasks complete):

### Step 12 — Run the Party Review

Read `skills/build/party/orchestrator.md` then `skills/build/party/03-party-review.md` and execute the full party review protocol.

The party review replaces the sequential four-pass review. All four agents (Neo, Echo, Phantom, Jarvis) run in parallel with cross-talk, producing a unified review file where interconnected findings are explicitly linked.

The review file is written to:
```
docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md
```

### Step 13 — Review approval gate

First check the review file for any **Critical** findings (labeled `[Critical]` by any agent). If any Critical findings exist:

> "Review complete, but **[N] Critical finding(s)** require resolution before proceeding:
>
> [list each Critical finding — agent, summary, file/location]
>
> Critical findings must be fixed. Please choose:
> - **Fix** — I address the Critical issues, regenerate the review, then re-present
> - **Override** — I acknowledge this is a Tier 1 override; I accept full responsibility (requires typing **OVERRIDE CRITICAL** to confirm)"

Do not present the Approve/Accept/Defer options until all Critical findings are resolved or explicitly overridden. Log any Critical override as a Tier 1 event in STATE.md.

If no Critical findings, present the standard gate:

> "Review complete. Please read `docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md` and decide:
>
> - **Approve** — ship as-is; post PR comments (if GitHub integration active)
> - **Fix** — I address the listed issues, regenerate the review, then re-present
> - **Accept warning** — ship despite Important/Advisory warnings (Tier 3 logged)
> - **Defer** — move items to tech debt log
>
> What is your decision?"

Wait for explicit human decision. Do not proceed to Test without approval.

If the user requests fixes: address them, recommit to the feature branch, regenerate the review file, and re-present.

### Step 14 — Post-approval actions

After approval:
- If GitHub integration is configured: push non-accepted findings as PR comments
- For any finding marked "Defer": append an entry to `docs/pdlc/memory/DECISIONS.md` under a Tech Debt section
- Log accepted Phantom security warnings as Tier 3 events in STATE.md
- Log accepted Echo coverage gaps as Tier 3 events in STATE.md

Update `docs/pdlc/memory/STATE.md`:
- **Current Sub-phase**: `Test`
- **Last Checkpoint**: `Construction / Test / [now ISO 8601]`

---

## TEST

### Step 15 — Run each test layer

Run the test layers per `skills/test/SKILL.md` (when available). Check CONSTITUTION.md §7 for which gates are required.

Run each layer in this order:

**Layer 1: Unit tests**
Run the project's unit test command (e.g. `npm test`, `yarn test`, `pytest`, as appropriate for the tech stack in CONSTITUTION.md). Record: passed, failed, skipped.

**Layer 2: Integration tests**
Run integration tests (e.g. `npm run test:integration`). If no integration test command exists, note: "No integration test command found — check package.json or Makefile." Record results.

**Layer 3: E2E tests (real Chromium)**
Run E2E tests (e.g. `npx playwright test`, `npm run test:e2e`). These use a real Chromium instance. Record results.

**Layer 4: Performance / load tests**
Run if a performance test command exists (e.g. `npm run test:perf`, `k6 run`). Skip with a logged Tier 3 warning if no command exists.

**Layer 5: Accessibility checks**
Run if an accessibility check command exists (e.g. `npm run test:a11y`, `axe`). Skip with a logged Tier 3 warning if no command exists.

**Layer 6: Visual regression tests**
Run if a visual regression test command exists (e.g. `npm run test:visual`, Percy, Chromatic). Skip with a logged Tier 3 warning if no command exists.

### Step 16 — Check Constitution test gates

Compare results against the required gates in CONSTITUTION.md §7.

For each required gate (checkbox is checked in CONSTITUTION.md):
- If the layer **passed**: continue.
- If the layer **failed**: surface a warning. Human decides: fix, accept, or defer.

For each non-required layer that failed: surface a soft warning. Human decides — do not block.

### Step 17 — Human decides on failures

For any failing layer (required or not), present:

> "[Layer] tests: [N] passed, [N] failed, [N] skipped.
>
> Failing tests: [list]
>
> This layer [IS / IS NOT] a required gate per CONSTITUTION.md.
>
> Options: **(A) Fix** — I address the failures and re-run, **(B) Accept** — ship with this known failure (Tier 3 logged), **(C) Defer** — log to tech debt, address in next episode."

Wait for the human's choice. Repeat until all failures are resolved or explicitly accepted/deferred.

---

## WRAP-UP

### Step 18 — Draft the episode file

Using `templates/episode.md` as the structure, draft:

`docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`

Determine the episode number `[NNN]` by reading `docs/pdlc/memory/episodes/index.md` and incrementing the last entry. If the index has no entries, start at `001`.

Fill in every section:
- **What Was Built**: a 3–6 sentence summary of what was designed, built, and shipped
- **Links**: PRD link, PR link (leave blank if not yet merged), review file link, design doc links
- **Key Decisions & Rationale**: list the significant decisions made during this feature, cross-referencing DECISIONS.md
- **Files Created**: list every new file added on the feature branch
- **Files Modified**: list every pre-existing file changed
- **Test Summary**: fill in the table from Step 15 results
- **Known Tradeoffs & Tech Debt**: from accepted/deferred findings in the review and test steps
- **Agent Team**: list which agents were active

Leave **Reflect Notes** blank — that section is filled during the Reflect sub-phase in `/ship`.

Set **Status**: `Draft`.

### Step 19 — Update STATE.md

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Construction Complete — Ready for /ship`
- **Current Sub-phase**: `none`
- **Active Beads Task**: `none`
- **Last Checkpoint**: `Construction / Complete / [now ISO 8601]`

Append to Phase History:
```
| [now] | construction_complete | Construction Complete | — | [feature-name] |
```

### Step 20 — Tell the user

> "Construction complete for `[feature-name]`.
>
> - All [N] tasks done in Beads
> - Review approved: `docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md`
> - Episode draft ready: `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`"

Then immediately ask:

> "Would you like to move to Operation and ship `[feature-name]` now?
>
> - Say **yes** to begin immediately
> - Or type `/ship` at any time to start manually"

**If the user responds with "yes", "y", "sure", "go ahead", or any clear affirmative**:
→ Immediately begin executing the `/ship` flow without waiting for the user to type the command.

**If the user responds with "no", "not yet", "later", or any deferral**:
→ Acknowledge and stop:
> "No problem. The episode draft is ready for your review. Run `/ship` when you're ready to deploy."

---

## Rules

- TDD is enforced on every task. No implementation code without a failing test first. No exceptions without explicit human override.
- The auto-fix loop cap is 3 attempts per failing test. Never exceed this without human input.
- All review findings are soft warnings. Human decides: fix, accept, or defer. No finding auto-blocks the build.
- Human must approve the review file before PR comments are pushed. Never push automatically.
- Never merge to main during Construction. The feature branch is merged during `/ship`.
- If context is running low (≤35% remaining), update STATE.md immediately and wrap up the current task cleanly before context compacts.
