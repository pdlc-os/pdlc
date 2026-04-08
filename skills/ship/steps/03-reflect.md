## REFLECT

### Step 13 — Generate the retro

Following the gstack-style retrospective approach, generate a Reflect Notes section for the episode file. Cover:

**Per-agent contributions** (list which agents participated and what they contributed):
- Neo: [architectural work done]
- Echo: [test strategy and coverage work]
- Phantom: [security checks performed, issues found/resolved]
- Jarvis: [docs written, CHANGELOG authored]
- [Auto-selected agents]: [their contributions]

**What went well:**
Analyze the Construction phase: tasks completed without issue, tests that passed cleanly, design decisions that worked out, agent collaboration that was effective. List 3–5 specific observations.

**What broke or slowed us down:**
Review the STATE.md Phase History and episode file: how many auto-fix attempts were needed, which tests failed initially, which review findings required fixing. List 2–4 specific observations.

**What to improve next time:**
Based on the above, list 2–3 actionable improvements for the next feature cycle.

**Metrics snapshot:**
- Cycle time: calculate from first Inception entry in Phase History to today's date
- Test pass rate: calculate from the episode file Test Summary (total passed / total run × 100%)
- Tasks completed: count from Beads
- Review findings: count from the review file (Important / Recommended / Advisory)

### Step 14 — Update the episode file

Open `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`.

Append the Reflect Notes section with all content from Step 13.

Update:
- **Date delivered**: today's date (the actual merge date)
- **Status**: keep as `Draft` — it becomes `Approved` after human sign-off below
- **Links → PR**: fill in the PR link if one was created (check `gh pr list` or ask the user)

Apply Jarvis's **Writing Quality Pass** (see `agents/jarvis.md`) before presenting the episode file for approval.

### Step 15 — Episode file approval gate

Tell the user:

> "Episode file is complete at `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`
>
> Please review the full episode file — the What Was Built summary, decisions, test results, tech debt, and retro notes.
>
> **Approve to commit this episode to the repository?** (approve / request changes)"

Wait for explicit approval. If the user requests changes: make them, re-save the file, and re-present.

When approved: update the **Approval** section in the episode file with the approver's name and today's date. Set **Status** to `Approved`.

### Step 16 — Commit the episode and update memory files

After approval, run these commands sequentially:

**16a. Update the episodes index:**

Append a row to `docs/pdlc/memory/episodes/index.md`:
```
| [NNN] | [Feature Name] | [today's date] | [[NNN]_[feature-name]_[date].md]([NNN]_[feature-name]_[date].md) | [#PR or —] | Shipped |
```

**16b. Update OVERVIEW.md:**

Read `docs/pdlc/memory/OVERVIEW.md`. Update:
- **Active Functionality**: add a bullet for the new capability shipped (e.g. "Users can now [feature description]")
- **Shipped Features table**: add a row for this feature with episode and PR links
- **Architecture Summary**: update if this feature changed the architecture meaningfully (new service, new DB table, new integration)
- **Known Tech Debt**: append any tech debt items recorded in the episode file
- **Last updated**: today's date

**16c. Update CLAUDE.md:**

Read the project-root `CLAUDE.md`. If it exists, refresh it to reflect the feature just shipped:

1. **Architecture section**: If this feature changed the architecture meaningfully (new service, new layer, new integration, new database table), update the Architecture section to reflect the current state. Remove any `<!-- update after first build -->` markers and replace planned content with actuals.

2. **Project Structure section**: If new top-level directories were created or the directory layout changed, update the structure description. On the first ship after a greenfield init, replace the planned structure with the actual layout by running `find . -maxdepth 2 -not -path './.git/*' -not -path './node_modules/*' -not -path './.beads/*' -type d | sort`.

3. **Key Files section**: If new entry points, route files, schema files, or other structurally important files were added, add them. Remove any that were deleted.

4. **Development section**: If new scripts were added to package.json (or equivalent) that affect install/dev/build/test/deploy commands, update them.

5. **Tech Stack section**: If new significant dependencies or infrastructure were added (new database, new cloud service, new major library), add them.

**Do not touch** sections that are unchanged. Keep the file under 80 lines. If no meaningful changes apply, skip this step entirely — do not update the file just to change a date.

If `CLAUDE.md` does not exist at the project root (e.g., user deleted it or it predates this feature), skip this step.

**16d. Update ROADMAP.md:**

Read `docs/pdlc/memory/ROADMAP.md`. Find the row in the Feature Backlog table whose feature slug matches `[feature-name]`. Update that row:
- **Status**: `Planned` or `In Progress` → `Shipped`
- **Shipped**: `—` → `[today's date YYYY-MM-DD]`
- **Episode**: `—` → `[NNN]_[feature-name]_[YYYY-MM-DD].md`
- **Last updated** (file header): today's date

If no matching row exists (the feature was added ad-hoc and never captured in the roadmap), append a new row with the next available `F-NNN` ID, the feature details, `Shipped` status, today's date, and the episode reference.

**16e. Commit everything:**

```bash
bash scripts/commit-episode.sh [NNN] [feature-name] [YYYY-MM-DD]
```

The script stages all episode + memory files, commits, and pushes to main in a single operation.

**TIER 2 action**: this is a direct push to main (not a PR). Since this is a docs-only commit (episode file), it is acceptable — but confirm with the user if their workflow requires a PR even for docs.

### Step 16f — Archive completed feature artifacts

> **Model override:** Use the **Haiku** model for this step — it's file moves and CLI commands.

Archive the shipped feature's artifacts and clean up Beads:

```bash
bash scripts/archive-feature.sh [feature-name]
```

The script moves PRDs, design docs, reviews, brainstorm logs, and MOM files to `docs/pdlc/archive/`, then runs `bd purge` and `bd admin compact`.

**Do NOT archive** (the script handles this correctly):
- Episode files (`docs/pdlc/memory/episodes/`) — permanent records
- Memory files (STATE.md, ROADMAP.md, etc.) — live project state

**Commit the archive:**

```bash
bash scripts/commit-archive.sh [feature-name]
```

> "Archived [feature-name] artifacts to `docs/pdlc/archive/`. Beads compacted."

> **End of model override.** Return to Jarvis's assigned model (Sonnet).

### Step 16g — Update METRICS.md and generate trend summary

Read the episode file for this feature to extract metrics:
- **Cycle days**: from Inception start date (STATE.md Phase History) to today
- **Test pass %**: from the Test Summary section of the episode file
- **Review rounds**: count of review files or regeneration cycles
- **Strikes**: number of 3-strike escalations (from episode or STATE.md)
- **Tier 1 overrides**: count from STATE.md Phase History (events matching `tier1_override`)
- **Security findings**: count of Phantom findings from the review file (Critical + Important)
- **Tasks**: total Beads tasks for this feature (`bd list --label "epic:[feature-name]" --json | jq length`)
- **Type**: `Feature` (or `Hotfix` if this was a hotfix episode)

**Append a row** to `docs/pdlc/memory/METRICS.md`:

```
| [NNN] | [feature-name] | Feature | [cycle days] | [pass %] | [rounds] | [strikes] | [tier1] | [security] | [tasks] | [today] |
```

**Generate trend summary:**

Read all existing rows from the METRICS.md table. Calculate:
- **Project averages**: average cycle days, average test pass %, average review rounds, average strikes
- **Previous episode**: the row immediately before this one
- **This episode vs average**: for each metric, is this episode better, worse, or the same?
- **This episode vs previous**: same comparison against the last shipped feature

Replace the "## Trend Summary" section in METRICS.md with:

```markdown
## Trend Summary

**Last updated:** [today] (after Episode [NNN]: [feature-name])

### This episode vs project average

| Metric | This Episode | Project Avg | Trend |
|--------|-------------|-------------|-------|
| Cycle time | [N] days | [avg] days | [↑ slower / ↓ faster / → same] |
| Test pass rate | [N]% | [avg]% | [↑ better / ↓ worse / → same] |
| Review rounds | [N] | [avg] | [↑ more / ↓ fewer / → same] |
| Strike escalations | [N] | [avg] | [↑ more / ↓ fewer / → same] |
| Security findings | [N] | [avg] | [↑ more / ↓ fewer / → same] |

### This episode vs previous ([prev feature name])

| Metric | This Episode | Previous | Change |
|--------|-------------|----------|--------|
| Cycle time | [N] days | [prev] days | [+N / -N / same] |
| Test pass rate | [N]% | [prev]% | [+N / -N / same] |
| Review rounds | [N] | [prev] | [+N / -N / same] |

### Observations

[Jarvis writes 2-3 sentences noting the most significant trends. Examples:
- "Cycle time dropped from 5 days to 3 — the team is getting faster."
- "Security findings increased from 0 to 3 — Phantom flagged new patterns worth reviewing."
- "First episode with zero strike escalations — TDD is working well."
If this is the first episode, write: "First episode — no trends to compare yet."]
```

**Present the trend summary to the user:**

> "**Trend Summary for Episode [NNN]:**
> [Paste the key observations — 2-3 sentences]
>
> Full metrics: `docs/pdlc/memory/METRICS.md`"

Commit METRICS.md with the archive commit (amend or separate commit).

### Step 17 — Final STATE.md update

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Idle — Ready for next /pdlc brainstorm`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Operation / Complete / [now ISO 8601]`

**Clear the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block with the empty template:

```json
{
  "phase_completed": null,
  "next_phase": null,
  "feature": null,
  "key_outputs": [],
  "decisions_made": [],
  "next_action": null,
  "pending_questions": []
}
```

Append to Phase History:
```
| [now] | operation_complete | Idle | — | none |
```

### Step 18 — Handoff: Jarvis → Oracle and next feature prompt

Output an **Agent Handoff** block (per `skills/formatting.md`) with:

> **Jarvis (Tech Writer):** "That's a wrap on `[feature-name]`! Episode [NNN] is committed, the changelog and roadmap are updated, and everything is documented. It's been great capturing this journey. I'm handing you back to Oracle to figure out what's next."
>
> **Oracle (Product Manager):** "Oracle here — welcome back! Let me pull up the roadmap and see where we stand."

Read `docs/pdlc/memory/ROADMAP.md`. Identify the **next unshipped feature** by priority order (lowest priority number with status `Planned`). Call it `[next-feature]` with ID `[next-id]`.

**If there is a next feature on the roadmap:**

> "Here's where we are:
>
> - **Just shipped:** `[feature-name]` ✓
> - **Next on the roadmap:** `[next-id]: [next-feature]` — [description]
> - **Remaining:** [N] features planned
>
> What would you like to do?
> - **Continue** — start brainstorming `[next-feature]` now
> - **Pause** — save your place and pick it up later
> - **Switch** — work on a different feature instead (I'll update the roadmap)"

**If the roadmap is fully shipped (no `Planned` features remain):**

> "Every feature on the roadmap is shipped! 🎉
>
> What would you like to do?
> - **Add features** — let's ideate on what to build next and update the roadmap
> - **Pause** — take a break, you've earned it"

**Handle the user's response:**

**Continue** (user says "continue", "yes", "next", "let's go", or any clear affirmative):
→ Update ROADMAP.md: set `[next-feature]` status to `In Progress`.
→ Immediately begin executing the `/pdlc brainstorm [next-feature]` flow.

**Pause** (user says "pause", "stop", "later", "not now", or any deferral):
→ Acknowledge:
> "No problem — your progress is saved. The roadmap shows `[next-id]: [next-feature]` as next in line. Run `/pdlc brainstorm [next-feature]` whenever you're ready to pick back up."

**Switch** (user names a different feature, says "something else", "actually I want to work on X", or picks a different roadmap item):
→ If the feature is already on the roadmap (user references an ID or name): update that feature's status to `In Progress` and begin `/pdlc brainstorm [that-feature]`.
→ If the feature is **not** on the roadmap: ask for a one-sentence description, assign the next available `F-NNN` ID, add it to ROADMAP.md with status `In Progress`, and begin `/pdlc brainstorm [new-feature]`.
→ In both cases, update ROADMAP.md before starting brainstorm.

**Add features** (when roadmap is fully shipped):
→ Run an abbreviated version of the roadmap ideation: brainstorm new features with the user, assign IDs, add to ROADMAP.md, prioritize, then offer to start the first one.

---

Return to `SKILL.md`. Operation is complete.
