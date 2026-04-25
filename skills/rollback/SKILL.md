---
name: rollback
description: "Revert a shipped feature and conduct a post-mortem"
argument-hint: [feature-name]
---

You are rolling back a shipped feature. The argument passed is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, read `docs/pdlc/memory/STATE.md` to find the most recently shipped feature from Phase History. If STATE.md is Idle, read `docs/pdlc/memory/ROADMAP.md` and find the last feature marked "Shipped". Ask the user to confirm:

> "Roll back the most recently shipped feature `[feature-name]`? (yes/no)"

If the user provides a feature name, verify it exists in ROADMAP.md and is marked "Shipped".

If the feature isn't found or isn't shipped, stop:
> "Feature `[feature-name]` is not found in ROADMAP.md as a shipped feature. Rollback only applies to shipped features."

---

## Lead Agent: Oracle (Product Manager)

Oracle leads the rollback — this is a product-level decision about reverting shipped work. Read `agents/oracle.md` for Oracle's full persona.

Before the first user-facing message, read `skills/formatting.md` and output a **Phase Transition Banner** for "ROLLBACK" followed by:

> **Oracle (Product Manager):** "This is serious — we're reverting a shipped feature. I'll coordinate the revert, run a post-mortem with the full team, and present your options. Let's figure out what happened and what to do next."

---

## Step 1 — Confirm rollback intent

> "You're about to roll back **[feature-name]** (shipped [date] as v[X.Y.Z]).
>
> This will:
> - Revert the merge commit on main
> - Push the revert to origin
> - Update ROADMAP.md status from Shipped to **Rolled Back**
> - Trigger a post-mortem meeting with the full team
>
> **Confirm rollback?** (yes/no)"

Wait for explicit confirmation. If no, stop.

---

## Step 2 — Sync check and execute the revert

**Remote sync check:** Read `skills/sync-check.md` and execute the sync check protocol. Main must be current before reverting — if someone pushed after the broken feature, the revert must account for those changes.

Find the merge commit for this feature:
```bash
git log --merges --oneline --grep="[feature-name]" main | head -1
```

Extract the commit hash. Revert it:
```bash
git revert [merge-commit-hash] -m 1 --no-edit
```

If the revert has conflicts, stop and inform the user:
> "Revert has merge conflicts. Please resolve them manually, then re-run `/pdlc rollback [feature-name]`."

If clean, push:
```bash
git push origin main
```

Tag the revert:
```bash
git tag v[X.Y.Z+1]-rollback -m "rollback: [feature-name] reverted"
```
```bash
git push origin v[X.Y.Z+1]-rollback
```

---

## Step 3 — Update state files

**ROADMAP.md:**
Find the feature row. Update:
- **Status**: `Shipped` → `Rolled Back`
- **Shipped**: keep the original date, append `(rolled back [today])`

**STATE.md:**
- **Current Phase**: `Operation`
- **Current Sub-phase**: `Rollback`
- **Current Feature**: `[feature-name]`
- **Last Checkpoint**: `Operation / Rollback / [now ISO 8601]`

Append to Phase History:
```
| [now] | rollback | Operation | Rollback | [feature-name] |
```

**CHANGELOG.md:**
Prepend a rollback entry:
```markdown
## v[X.Y.Z+1] — [today] (ROLLBACK)

### Reverted
- Rolled back [feature-name] (v[X.Y.Z]) — see post-mortem ADR-[NNN]
```

**Episode file:**
Read the feature's episode file. Update its Status from `Approved` to `Rolled Back`. Append a note:
```markdown
## Rollback

**Date:** [today]
**Revert commit:** [hash]
**Reason:** [to be filled after post-mortem]
**Post-mortem MOM:** [to be filled after meeting]
```

---

## Step 4 — Post-mortem meeting (all agents)

Convene a **Post-Mortem Party** — a full team meeting to diagnose what went wrong and produce fix recommendations. Follow `skills/build/party/orchestrator.md` for spawn mode and durable checkpoint protocol.

Write `.pending-party.json` with `meetingType: "post-mortem"`.

### Meeting announcement

Output a **Meeting Announcement Block** per `skills/formatting.md`:
- **Called by:** Oracle (Product Manager)
- **Participants:** the full team — 9 built-in agents plus any matching custom agents from `.pdlc/agents/`
- **Purpose:** Post-mortem analysis of `[feature-name]` rollback
- **Estimated time:** ~3–5 minutes

### Round 1 — What happened?

Oracle asks each agent to analyze the failure from their domain:

| Agent | Question |
|-------|----------|
| **Neo** | Did the architecture hold up? Was there a design flaw that wasn't caught? |
| **Bolt** | What broke in the backend? Was it a code bug, a data issue, or an integration failure? |
| **Friday** | What broke on the frontend? Was it a rendering issue, state management, or API mismatch? |
| **Echo** | Did the tests catch this? If not, what test was missing? Which layer should have caught it? |
| **Phantom** | Was this a security issue? Were there signs during the review that were accepted as warnings? |
| **Muse** | Did the user experience degrade? Was the impact visible to end users? |
| **Pulse** | Was this a deployment issue? Environment config, CI/CD, infra? Did the deploy itself cause it? |
| **Jarvis** | Were the docs accurate? Did the API contracts match reality? Were there documentation gaps? |

**Custom agents:** any agents in `.pdlc/agents/` that are `always_on: true` or whose `auto_select_on_labels` match the rolled-back feature's labels also participate. Each produces the same output format for their focus areas — e.g., a custom `Sage` (Data Engineer) agent would answer "did the data layer contribute to the failure? Schema, query patterns, or migration?" framed from their persona file.

Each agent produces:
```
Agent: [name]
Root cause assessment: [their analysis of what went wrong]
Was this preventable? [Yes/No — and how]
Severity: [Critical / Major / Minor]
```

### Round 2 — Cross-examination

Oracle identifies the most likely root cause(s) from Round 1. Routes specific findings between agents:
- If Bolt says "API returned wrong schema" → route to Jarvis: "Was the contract correct?"
- If Echo says "no test covered this path" → route to Neo: "Was this path in the architecture?"
- If Phantom says "security warning was accepted" → route to Oracle: "Should the acceptance criteria have caught this?"

Cross-examination follows the canonical bounded cross-talk loop: **up to 3 rounds, exit early on consensus.** See `skills/build/party/spawn-and-mom.md` → "Cross-talk Rounds" for the full rules. Most post-mortem findings resolve in 1–2 rounds; reach for round 3 only if Oracle still cannot pin down the root cause.

### Round 3 — Fix recommendations

Oracle asks the team to propose fixes. Each agent that identified a problem proposes a concrete fix:

```
Agent: [name]
Proposed fix: [specific, actionable fix]
Effort: [Small / Medium / Large]
Risk of fix: [Low / Medium / High — could the fix itself cause issues?]
Prevents recurrence: [Yes / Partial / No]
```

Oracle synthesizes the proposals into **3 ranked approaches**:

**Approach 1 (Recommended):** [Description — what to fix, how, estimated effort]
**Approach 2 (Alternative):** [Description — different tradeoff]
**Approach 3 (Minimal):** [Description — smallest change that addresses the immediate issue]

### Write MOM

Write to: `docs/pdlc/mom/[feature-name]_post-mortem_mom_[YYYY]_[MM]_[DD].md`

Follow the MOM format from the orchestrator. The Discussion section should have:
- Round 1: per-agent root cause assessments
- Round 2: cross-examination findings
- Round 3: fix proposals and ranked approaches

The Conclusion should state the team's consensus root cause and recommended approach.

Update `.pending-party.json`: set `"progress": "mom-written"`.

---

## Step 5 — Present options to user

> **Oracle (Product Manager):** "Post-mortem complete. Here's what we found:
>
> **Root cause:** [consensus from the meeting]
> **Severity:** [Critical/Major/Minor]
> **Preventable?** [Yes/No — and what was missed]
>
> **MOM:** `docs/pdlc/mom/[feature-name]_post-mortem_mom_[date].md`
>
> **Your options:**
>
> **A — Fix and re-ship** using one of these approaches:
>   1. **(Recommended)** [Approach 1 summary] — effort: [S/M/L], risk: [L/M/H]
>   2. **(Alternative)** [Approach 2 summary] — effort: [S/M/L], risk: [L/M/H]
>   3. **(Minimal)** [Approach 3 summary] — effort: [S/M/L], risk: [L/M/H]
>
> **B — Abandon the feature** — mark it as Dropped in ROADMAP.md, archive the docs, move to the next feature
>
> **C — Pause** — save the post-mortem and decide later"

### Handle user's choice

**A — Fix and re-ship (with approach number):**

1. Record the decision in DECISIONS.md:
   ```
   ### ADR-[NNN]: Post-mortem fix for [feature-name] rollback
   
   Date: [today]
   Source: User (post-mortem)
   Phase: Operation
   Sub-phase: Rollback
   Agent: Oracle
   Status: Active
   MOM: [post-mortem MOM path]
   
   Decision: Fix and re-ship using Approach [N]: [description]
   Context: Feature was rolled back due to [root cause]. Post-mortem identified [N] contributing factors.
   ```

2. Update ROADMAP.md: set feature status to `In Progress` (it's being fixed).

3. Update episode file: fill in the Rollback reason and post-mortem MOM link.

4. Update STATE.md:
   - **Current Phase**: `Construction`
   - **Current Sub-phase**: `Build`
   - **Current Feature**: `[feature-name]`

5. Create a Beads task for the fix (collect metadata first: `git_user="$(git config user.name)"`, `git_branch="$(git branch --show-current)"`, `utc_now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"`):
   ```bash
   bd create "Fix: [root cause summary]" \
     -d "[Created: ${utc_now} | Author: ${git_user} | Branch: ${git_branch} | Roadmap: [F-ID]]
   [Approach description from the post-mortem. See ADR-NNN and MOM.]" \
     -l "epic:[feature-name],fix,post-mortem,user:${git_user},roadmap:[F-ID],branch:${git_branch}" \
     -t bug
   ```

6. Delete `.pending-party.json`.

7. Inform user and offer to start the build:
   > "Fix task created. Ready to start building the fix?
   > - **Yes** — launch `/pdlc build` now
   > - **No** — pick it up later with `/pdlc build`"

   If yes: begin executing `/pdlc build`.

**B — Abandon the feature:**

1. Close all Beads tasks for the feature: `bd list --label "epic:[feature-name]" --json` → `bd done [id]` for each open task.

2. Update ROADMAP.md: set feature status to `Dropped`. Add a note: `Dropped after rollback — see post-mortem ADR-[NNN]`.

3. Record in DECISIONS.md:
   ```
   ### ADR-[NNN]: Abandon [feature-name] after rollback
   Decision: Feature abandoned after post-mortem. Root cause: [summary].
   ```

4. Update episode file: set Status to `Abandoned`. Fill in rollback details.

5. Update STATE.md to Idle.

6. Delete `.pending-party.json`.

7. Handoff to Oracle for next feature (same flow as ship Step 18):
   > **Oracle (Product Manager):** "Feature abandoned and archived. Let me check the roadmap for what's next."
   
   Read ROADMAP.md, present next priority feature, offer continue/pause/switch.

**C — Pause:**

1. Delete `.pending-party.json`.

2. Update STATE.md:
   - **Current Phase**: `Idle — Ready for next /pdlc brainstorm`
   - **Current Feature**: `none`

3. Keep the episode file and post-mortem MOM as-is for future reference.

4. > "Post-mortem saved. The feature remains rolled back in ROADMAP.md. You can re-visit this by running `/pdlc rollback [feature-name]` again or starting a new brainstorm."

---

## Rules

- Rollback only applies to features marked "Shipped" in ROADMAP.md.
- The post-mortem meeting is required — it cannot be skipped. Understanding what went wrong prevents recurrence.
- The revert commit is a standard `git revert`, not a force-push. History is preserved.
- Every rollback produces an ADR entry and a MOM file — these are permanent records.
- Fix-and-re-ship creates a new Beads task with the `fix` and `post-mortem` labels so it's trackable.
- The feature's episode file is updated (not deleted) to record the full lifecycle including the rollback.
