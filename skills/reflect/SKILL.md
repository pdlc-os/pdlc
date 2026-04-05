# Retrospective Protocol

## When this skill activates

Activate at the start of the **Reflect sub-phase** of Operation, after the Verify sub-phase is complete and the human has signed off on smoke tests. This skill generates the full retrospective for the completed feature cycle — from Inception through Ship.

Before starting, gather all required inputs:
- The active episode file: `docs/pdlc/memory/episodes/[episode-id].md`
- The episode index: `docs/pdlc/memory/episodes/index.md`
- The PRD: `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
- All review files generated during Construction: `docs/pdlc/reviews/REVIEW_[task-id]_[YYYY-MM-DD].md`
- `docs/pdlc/memory/STATE.md` — for guardrail event log and loop-breaker escalation count
- `docs/pdlc/memory/DECISIONS.md` — for any tech debt deferred this cycle

---

## Protocol

### Step 1 — Per-agent contributions

List every agent that participated in this feature cycle. For each agent, record:
- Their role name and display name (e.g. "Neo — Architect")
- What they contributed: specific tasks, findings surfaced, decisions influenced
- Any notable findings they raised (e.g. a Phantom security finding that led to a code change, an Echo coverage gap that revealed a missing test)

Pull this information from: the review files, the episode file, STATE.md history, and the Beads task records (`bd show [task-id]` for each completed task).

Agents to check: Neo, Echo, Phantom, Jarvis (always-on), plus any auto-selected agents (Bolt, Friday, Muse, Oracle, Pulse) that participated based on task labels.

### Step 2 — Shipping streak

1. Read `docs/pdlc/memory/episodes/index.md`.
2. Count consecutive successfully delivered features ending with the current episode (i.e. episodes where the Ship sub-phase completed without a rollback or abandon).
3. A streak is broken by: a rollback, an explicitly abandoned feature, or a feature that did not reach Ship.
4. Record the current streak count.

Display format: "Shipping streak: X consecutive features delivered"

### Step 3 — Metrics snapshot

Collect the following metrics from the episode file, review files, and STATE.md:

**Test pass rate by layer:**
Read from the Test Summary in the episode file. For each layer, record: passed / total. Compute pass rate percentage.

**Cycle time:**
- Start date: the date the Inception phase began for this feature (read from the PRD file date or STATE.md history)
- End date: the date the Ship sub-phase completed (today's date or the Ship timestamp in STATE.md)
- Cycle time = end date − start date, in calendar days

**Review rounds:**
Count the number of times the Review sub-phase was run for this feature (i.e. how many times a review file was written or regenerated). Read from the review files — check multiple files for the same task-id if they exist.

**Guardrail triggers by tier:**
Read `docs/pdlc/memory/STATE.md` for logged guardrail events.
- Tier 1 events: hard blocks that required double-RED confirmation
- Tier 2 events: pause-and-confirm events
- Tier 3 events: logged warnings (skipped layers, accepted warnings, overrides)
- Count each tier separately.

**Loop-breaker escalations:**
Count the number of times the 3-attempt auto-fix limit was hit and the human was asked to intervene. Read from STATE.md and the episode file.

### Step 4 — What went well

Write 3–5 bullet points drawn from the episode's actual history. Be specific — reference actual events, not generic platitudes.

Inputs to draw from:
- Beads tasks completed without blockers or loop-breakers → "Task [X] was implemented cleanly in one TDD cycle"
- Review findings that led to measurable improvements → "Phantom surfaced an injection risk in [module] that was fixed before ship"
- Test layers that caught regressions early → "Integration tests caught a broken contract between [service A] and [service B]"
- A smooth human approval gate → "PRD and design docs approved in one round without revisions"
- CI/CD or tooling that worked well → "Playwright E2E suite ran against Chromium with zero flakes"

### Step 5 — What broke or was harder than expected

Write 3–5 bullet points. Be specific and honest. Reference actual incidents from the episode.

Inputs to draw from:
- Loop-breaker escalations (3-attempt limit hits) → what the root cause turned out to be
- Approval rounds that required multiple revisions → what caused the back-and-forth
- Test layers that had failures → what the failures were
- Guardrail Tier 1 or Tier 2 events → what triggered them and how they were resolved
- Merge conflicts or CI/CD failures during Ship
- Scope that expanded beyond the PRD → what crept in and why

### Step 6 — What to improve next time

Write 2–3 actionable improvement suggestions. These must be concrete and implementable in the next cycle.

Each suggestion should follow the format:
- **What**: the specific change to make
- **Why**: what problem it solves (trace back to this cycle's friction)
- **How**: a concrete first step to implement it

Examples of the kind of specificity required:
- "Add a perf benchmark for [endpoint] to the E2E suite before next iteration, so Layer 4 has automated coverage rather than manual timing"
- "Pre-populate the CONSTITUTION.md test gates section during Init — it was left blank this cycle, which caused ambiguity during the Test sub-phase"
- "Establish a baseline visual regression screenshot set before the next frontend task, to make Layer 6 actionable rather than advisory"

### Step 7 — Tech debt log and decision review

Read `docs/pdlc/memory/DECISIONS.md` for any decisions recorded during this cycle (matching the current feature name). Also check review files for findings marked "Defer to tech debt."

**For each tech debt item:**
- Name the component or module affected
- Describe the debt (what was cut, why it was deferred)
- Propose a concrete remediation approach and a suggested future episode to address it

**For any new tech debt discovered during the retrospective** (e.g., patterns noticed during Steps 4–6 that weren't captured during Review):
Record each as a decision in the Decision Registry using the protocol in `skills/decision/SKILL.md`. Set:
- **Source**: `PDLC flow`
- **Phase**: `Operation`
- **Sub-phase**: `Reflect`
- **Agent**: `Jarvis`
- **Decision text**: "Tech debt identified during retrospective: [description]."

Run the **impact assessment** (Step 2 of the decision skill) for each new tech debt decision. Present impacts to the user before recording.

If no tech debt was introduced this cycle, state that explicitly: "No tech debt introduced this cycle."

### Step 8 — Write the retrospective into the episode file

Append the retrospective to the active episode file at `docs/pdlc/memory/episodes/[episode-id].md` under a "Reflect Notes" section.

The section must contain all seven elements from Steps 1–7:
- Per-agent contributions
- Shipping streak
- Metrics snapshot
- What went well
- What broke / was harder than expected
- What to improve next time
- Tech debt log

### Step 9 — Update OVERVIEW.md

Read `docs/pdlc/memory/OVERVIEW.md`. This is the aggregated view of all functionality delivered across every iteration.

Add an entry for this feature cycle:
- Feature name and episode ID
- What was built (2–3 sentence summary)
- Key decisions made
- Version tag shipped (v[X.Y.Z])
- Links to the episode file and PRD

Do not overwrite previous entries. Append only.

### Step 10 — Present for human approval

Present the human with:
1. The path to the updated episode file: `docs/pdlc/memory/episodes/[episode-id].md`
2. The path to the updated OVERVIEW.md: `docs/pdlc/memory/OVERVIEW.md`
3. A brief summary: shipping streak, cycle time, total tests passed, and the top "what to improve" item.

State: "Retrospective complete. Please review the episode file and OVERVIEW.md. Approve to close the episode and commit the final state."

Wait for human approval. Do not commit until the human approves.

### Step 11 — Commit and close

After human approval:

1. Stage and commit the episode file and OVERVIEW.md:
```bash
git add docs/pdlc/memory/episodes/[episode-id].md
git add docs/pdlc/memory/OVERVIEW.md
git commit -m "reflect: [feature-name] episode [episode-id] retrospective"
```

2. Push to main.

3. Update `docs/pdlc/memory/STATE.md`:
   - Phase: Initialization (ready for next `/pdlc brainstorm`)
   - Last completed episode: [episode-id]
   - Active feature: none

4. Report to human: "Episode [episode-id] closed. Ready for the next feature. Run `/pdlc brainstorm` to begin."

---

## Rules

- The retrospective must be grounded in actual events from the episode — not generic observations. Every bullet point in "what went well" and "what broke" must be traceable to a specific event in the episode file, review files, or STATE.md.
- Shipping streak must be calculated from the full episode index, not estimated.
- Cycle time is calculated from Inception start to Ship completion — not from the first commit.
- Tech debt must be explicitly stated as either present (with specifics) or absent ("no tech debt introduced this cycle"). Silence is not acceptable.
- Do not commit the retrospective without explicit human approval.
- OVERVIEW.md is append-only. Never modify or remove previous entries.
- Improvement suggestions must be actionable: no "communicate better" or "be more careful." Each suggestion needs a concrete first step.

---

## Output

- "Reflect Notes" section appended to `docs/pdlc/memory/episodes/[episode-id].md` covering all seven elements.
- `docs/pdlc/memory/OVERVIEW.md` updated with a new entry for this feature cycle.
- Episode file and OVERVIEW.md committed to main after human approval.
- `docs/pdlc/memory/STATE.md` updated: phase reset to Initialization, active feature cleared.
- Human informed the feature cycle is closed and the system is ready for the next `/pdlc brainstorm`.
