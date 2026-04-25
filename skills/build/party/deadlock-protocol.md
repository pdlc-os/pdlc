# Deadlock Detection and Recovery Protocol

Read this file when any of the following conditions are true:
- `bd ready` returns empty but open tasks remain
- A party round's agents return empty, error, or identical responses
- Agents cannot reach consensus after cross-talk (cross-talk runs up to 3 rounds with early exit on consensus)
- A fix-regenerate cycle repeats more than twice
- A Strike Panel is triggered a second time for the same test

---

## State Variables to Track

Maintain these values in working context throughout the build session. Update after each relevant step.

| Variable | Set by | Purpose |
|---|---|---|
| `[prev-ready-queue]` | Step 4 | Stagnation detection: compare against current `bd ready` output |
| `[loop-count]` | Step 4 | Infinite loop guard: increment each iteration |
| `[party-mode]` | First Wave Kickoff | Spawn mode for all party sessions this build |
| `[review-fix-cycles]` | Step 13 | Cap on Critical finding fix-regenerate loops |
| `[strike-panel-history]` | Step 9c | Approaches already tried for a failing test — passed to next panel |

---

## Deadlock Type 1 — Beads Circular Dependency

### Detection

After `bd ready --json` returns empty, run:
```bash
bd list --status=open --json
```
If this returns non-empty tasks, a Beads deadlock exists.

### Diagnosis

```bash
bd dep tree --format mermaid
```

Scan the output for a cycle: any node that appears on both sides of a blocking arrow in a chain (A→B→C→A). Most graph tools output an error message when a cycle is present — look for that too.

### Auto-resolution (orchestrator decides)

1. Identify the dependency added most recently by scanning the Wave Kickoff MOM file (`docs/pdlc/mom/[feature-name]_wave-kickoff_mom_*.md`) for "Dependency updates" — those are the newest additions and most likely candidates.
2. Remove the most recently added dep:
   ```bash
   bd dep remove [task-b-id] [task-a-id]
   ```
3. Re-run `bd ready --json`. If tasks are now unblocked, log the decision and continue.
4. Record in STATE.md as a Tier 3 event:
   ```
   | [now] | deadlock_resolved | removed dep [task-b] blocks [task-a] — cycle broken automatically |
   ```

### Escalate to human when:
- Multiple overlapping cycles exist (cannot determine which dep is wrong)
- Removing any single dep still leaves the queue empty
- The removed dep was marked as a logical requirement in the PRD

**Human escalation message:**
> "⚠️ Deadlock detected in task dependency graph.
>
> Open tasks: [list task IDs and titles]
> Detected cycle: [A → B → C → A]
>
> I cannot determine which dependency to remove without risking the feature's logical order. Please tell me:
> 1. Which dependency is incorrect (e.g. 'task B does not actually need task A to finish first'), OR
> 2. Whether any of these tasks can be removed from scope
>
> I'll wait for your guidance before proceeding."

---

## Deadlock Type 2 — Agent Spawn Failure

### Detection

An Agent tool call returns any of:
- Empty string / null content
- An error message instead of a persona response
- A response that contains only "I have nothing to add" from every agent in the round

### Resolution tiers

**1 of N agents fails:** Continue the round without that agent. Note in MOM: "[Name] unavailable — no response received." Do not retry the same agent in the same round.

**Majority of agents fail:** Switch to Solo mode for this meeting only. Announce:
> "Multiple agents failed to respond. Switching to solo mode for this session."
Continue without re-spawning.

**All agents fail:** Abort the party round entirely. Write a minimal MOM entry noting the failure. Continue the build without the party discussion for this task — do not block progress on a coordination tool failure.

### Retry rule

Retry once with a stripped-down prompt (remove cross-talk context, reduce to the single core question). If the retry also fails, apply the resolution tiers above. Never retry more than once per agent per round.

---

## Deadlock Type 3 — Consensus Failure (Agents Cannot Agree)

Applies to: Design Roundtable cross-talk, Strike Panel cross-talk, Party Review cross-talk.

Cross-talk runs up to 3 rounds with early exit on consensus (see `skills/build/party/spawn-and-mom.md` → "Cross-talk Rounds"). This deadlock is reached when cross-talk terminates without consensus — either because positions locked with no movement (early exit) or because 3 rounds were exhausted without convergence.

### Detection

After cross-talk terminates:
- Agents produce contradictory conclusions with no clear majority
- Neo (or orchestrator) cannot synthesize a single decision from the responses
- Either the loop hit 3 rounds, or it stopped earlier because positions stayed locked between rounds

### Resolution by meeting type

**Design Roundtable:**
Do not proceed to Step 9 (TDD). Pause and present the disagreement to the human as a blocking gate:

> "⚠️ Design Roundtable: agents could not agree on implementation approach.
>
> **Neo (Architect):** [approach A summary]
> **[Domain agent]:** [approach B summary]
> **Echo (QA):** [concern that blocks both]
>
> This needs a human call before implementation begins — choosing the wrong approach here will likely cause test failures and trigger the Strike Panel.
>
> Please choose:
> **(A)** Approach as described by Neo
> **(B)** Approach as described by [domain agent]
> **(C)** Neither — I'll describe the approach myself"

Wait. Do not auto-decide on an implementation approach. This is an architectural fork that the human owns.

**Strike Panel:**
If Neo cannot make a final call on root cause (test vs. code dispute between Echo and domain agent), present the dispute explicitly in the ranked approaches:

> "Approach 1 (Neo's call): [fix the code — Neo's recommendation]
> Approach 2 (Echo's call): [fix the test — Echo's recommendation]
> Approach 3: Take the wheel — agents fundamentally disagree; human decides"

Label the panel output with: `Panel confidence: Low — root cause disputed`

**Party Review:**
If cross-talk doesn't resolve a finding interconnection, write both findings independently in the review file with a note:
> "Linked review: [Agent A] and [Agent B] both flag issues in this area with different root causes. Fix both independently."
Do not block the review on this — surface it and move on.

---

## Deadlock Type 4 — Unbounded Fix-Regenerate Loop (Critical Findings)

### Detection

`[review-fix-cycles]` reaches 3 (three complete fix-regenerate cycles without resolving all Critical findings).

### Resolution

On the 3rd failed fix cycle, do not run another fix. Instead, present a consolidated escalation:

> "⚠️ After 3 fix cycles, [N] Critical finding(s) remain unresolved:
>
> [numbered list of remaining Critical findings, with file:line and agent]
>
> Options:
> **(A) Continue fixing** — I'll attempt a fourth cycle with a fresh approach
> **(B) Batch override** — I acknowledge all remaining Critical findings and accept full responsibility. Type **ACCEPT ALL CRITICALS** to confirm (Tier 1 logged event).
> **(C) Abandon feature** — close the feature branch without merging; return to Inception to redesign the affected areas"

Reset `[review-fix-cycles]` to 0 if the human chooses A.
Log a Tier 1 event in STATE.md if the human chooses B.
If the human chooses C: update STATE.md to `Abandoned`, record the reason.

---

## Deadlock Type 5 — Strike Panel Cycling (Same Test Fails Again)

### Detection

Strike Panel is triggered a second time for the same test (same test name, same task ID). This means the approach chosen after the first panel also failed.

### Resolution

Include `[strike-panel-history]` in every agent's context when re-triggering the panel:

```
PREVIOUSLY TRIED APPROACHES (do not re-recommend these):
- Attempt 1 (auto-fix 1–3): [what was tried, why it failed]
- Attempt 4 (Panel round 1, Approach [X]): [what was tried, exact error output after applying it]
```

Agents must not re-propose approaches already listed in the history.

If the panel is triggered a **third time** for the same test:

> "⚠️ This test has now failed through two complete Strike Panel cycles ([N] total attempts). All ranked approaches have been exhausted.
>
> Remaining options:
> **(A) Redesign** — abandon the current implementation, return to the Design Roundtable for this task
> **(B) Skip test** — mark this acceptance criterion as deferred tech debt (Tier 3 logged); implement the feature without this test passing
> **(C) Human takes full control** — I'll hand you the test, the implementation, and all error history; you guide me line by line"

Do not attempt another automatic fix after three Strike Panel cycles without explicit human direction.

---

## Deadlock Type 6 — BUILD LOOP Stagnation

### Detection

Track `[prev-ready-queue]` and `[loop-count]`. After each `bd ready` call:
- If the returned list is identical to `[prev-ready-queue]` AND `[loop-count]` > 1: stagnation detected
- If `[loop-count]` exceeds the total number of tasks in the feature (all tasks should complete in at most N iterations): hard cap reached

### Resolution

On stagnation detection:
1. Run `bd list --status=open --json` — compare against expected tasks from the plan
2. If completed tasks are showing as still open: run `bd done [task-id]` for each that has a completed commit in the branch
3. If that resolves the stagnation: continue
4. If not: apply **Deadlock Type 1** (Beads circular dependency) protocol

On hard cap:
> "⚠️ Build loop has run [N] iterations — more than the [M] tasks in this feature. Something is wrong with the task state.
>
> Current Beads state: [bd list output]
> Expected tasks from plan: [task list from STATE.md]
>
> I'll attempt to reconcile the state automatically. If I can't, I'll need your help."

---

## General Escalation Rules

**Auto-resolve without asking human:**
- Type 1: Beads cycle where the newest dep is clearly the wrong one (no ambiguity)
- Type 2: Single agent spawn failure (1 of N — continue without that agent)
- Type 6: Stagnation resolved by re-running `bd done` on finished tasks

**Ask human before proceeding:**
- Type 1: Multiple overlapping Beads cycles or ambiguous dep removal
- Type 2: All agents fail in a spawn round
- Type 3: Design Roundtable consensus failure (always — architectural decision)
- Type 4: 3rd fix-regenerate cycle exhausted — human chooses Continue/Override/Abandon
- Type 5: Third Strike Panel trigger on same test — human chooses Redesign/Skip/Control
- Type 6: Hard cap reached (loop-count exceeds total tasks) — present state for reconciliation

**Hard stop — do not auto-proceed under any circumstances:**
- Type 4: `ACCEPT ALL CRITICALS` override in review loop (Tier 1 logged event)
- Type 4: Feature abandonment after exhausted fix cycles
- Type 5: Feature abandonment after exhausted Strike Panel
- Beads state is unrecoverable (bd commands returning errors consistently)

---

## Logging

Every deadlock event must be recorded in STATE.md Phase History:
```
| [now] | deadlock_[type] | [resolution: auto/human] | [brief description] | [feature-name] |
```

Every resolved or escalated deadlock writes a MOM entry to `docs/pdlc/mom/[feature-name]_deadlock_mom_[YYYY]_[MM]_[DD].md` using the standard MOM format with topic slug `deadlock`.
