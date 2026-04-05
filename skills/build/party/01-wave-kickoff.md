# Party Mode: Wave Kickoff Standup

**Topic slug:** `wave-kickoff`
**Trigger:** Automatic — fires at the start of each new Beads wave before any task is claimed
**Purpose:** Surface hidden dependencies, shared-state conflicts, and ordering issues before a single line of code is written

---

## When to Trigger

A new wave has started when:
- `bd ready` returns a non-empty list AND
- Either: this is the first run of the build loop, OR the previous `bd ready` call returned an empty list (previous wave fully completed)

If only a single task is in the ready queue, skip the standup — there is nothing to coordinate. Proceed directly to Step 5.

---

## Spawn Mode for Wave Kickoff

Wave Kickoff fires at Step 4, before any task execution mode (Step 7) has been chosen. Determine spawn mode as follows:

1. Check STATE.md for `Party Mode` preference — if a project-level preference was previously set, use it.
2. If no preference is recorded, ask the user once, upfront, as a **standalone message**:

> "How should I run the Wave Kickoff standup?
> **A) Agent Teams** — I act as Neo; other agents are real subagents (more independent, slightly slower)
> **B) Subagents** — all agents including Neo are spawned independently (pure BMAD-style)
> **C) Solo** — I roleplay all agents myself (fastest)
>
> This will also be the default for Design Roundtables and Party Reviews unless you change it."

Store the answer in STATE.md as `Party Mode: agent-teams | subagents | solo`. Do not ask again this session.

3. If the user is mid-session and already answered (STATE.md has `Party Mode`), use that — no prompt needed.

## Participants

- **Neo** (always — leads the standup)
- Auto-select domain agents based on labels in the current wave's tasks:
  - Any `backend` task → include **Bolt**
  - Any `frontend` task → include **Friday**
  - Any `ux` task → include **Muse**
  - Any `devops` task → include **Pulse**
  - Always include **Echo** if the wave has 3+ tasks (coordination risk is higher)

Maximum 4 agents per standup. If more than 4 would be selected, prioritize domain agents whose tasks have the most dependencies.

---

## Context to Load

Before spawning agents, gather:
- The full task list for this wave: task IDs, titles, labels, descriptions, acceptance criteria
- Task dependency relationships: `bd dep tree --format mermaid` (or `bd dep tree` if mermaid unavailable)
- The feature's design docs: `docs/pdlc/design/[feature-name]/ARCHITECTURE.md` and `data-model.md`
- Any completed tasks from previous waves (from STATE.md Phase History)

---

## Round 1 — Coordination Analysis

**Neo's framing (in Neo mode, spoken by main Claude; in subagent/solo mode, spawned):**

> "We're opening wave [N] with [X] tasks. I'm looking for: hidden dependencies the graph doesn't capture, shared state that multiple tasks will touch, and anything that will cause a merge conflict if run in true parallel. What does everyone see?"

**Each domain agent's contribution prompt:**

```
Contribution: Review the tasks in this wave that touch your domain.
Identify:
1. Any two tasks that will modify the same file, table, or interface
2. Any task that looks self-contained but actually depends on another task's output
3. Any task whose implementation approach will constrain how other tasks must be built
4. Any task that is riskier than it looks — hidden complexity, unclear requirements, or
   likely to require design changes mid-build

Be specific: name the task IDs and the exact resource or interface at risk.
```

**Echo's contribution prompt (if included):**

```
Contribution: Look at this wave's tasks from a test coordination perspective.
Identify:
1. Tasks that will need shared test fixtures or factories — building them twice will
   create conflicts
2. Tasks whose acceptance criteria are ambiguous enough to cause different
   implementations that will need to be reconciled
3. Any task where the test setup for one task will interfere with another task's tests
   if run in parallel
```

---

## Round 2 — Cross-talk (if conflicts found)

If Round 1 surfaces a conflict (two agents name the same resource, or one agent's finding triggers a dependency concern for another):

Spawn the two agents whose concerns interact. Pass each the other's Round 1 response. Ask:

```
[Agent A] flagged [concern]. You have a task that touches the same area.
Do you agree this is a real conflict? If yes, what is the safest sequencing or
coordination strategy — and does the Beads dependency graph need to be updated?
```

---

## Output — Wave Execution Plan

After discussion, produce:

1. **Confirmed safe parallel tasks** — tasks that can truly run in parallel with no coordination needed
2. **Flagged sequential pairs** — task A must complete before task B, even if Beads doesn't enforce it
3. **Recommended ordering** — a numbered execution order for this wave
4. **Dependency updates** — if any hidden dependency was found, update Beads:
   ```bash
   bd dep add [task-b-id] --blocks [task-a-id]
   ```
   Run this for each new dependency before proceeding. If any `bd dep add` command fails or if `bd ready --json` returns empty after the updates (but open tasks remain), a circular dependency may have been introduced. Read `skills/build/party/deadlock-protocol.md` and apply **Deadlock Type 1** (Beads Circular Dependency) before continuing.

Tell the user:
> "Wave [N] standup complete. [N] tasks confirmed parallel / [N] tasks resequenced.
> Dependency updates applied: [list or 'none'].
> Proceeding to task selection."

Write the MOM file per `orchestrator.md`.

---

## Proceed

After the standup and any Beads updates, return to **Step 5** (Select the next task) in `skills/build/SKILL.md`.
