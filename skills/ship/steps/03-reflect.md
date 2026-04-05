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

**16c. Commit everything:**

```bash
git add docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md
git add docs/pdlc/memory/episodes/index.md
git add docs/pdlc/memory/OVERVIEW.md
git add docs/pdlc/memory/CHANGELOG.md
git commit -m "docs(pdlc): add episode [NNN] — [feature-name]"
git push origin main
```

**TIER 2 action**: this is a direct push to main (not a PR). Since this is a docs-only commit (episode file), it is acceptable — but confirm with the user if their workflow requires a PR even for docs.

### Step 17 — Final STATE.md update

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Idle — Ready for next /brainstorm`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Operation / Complete / [now ISO 8601]`

Append to Phase History:
```
| [now] | operation_complete | Idle | — | none |
```

### Step 18 — Print completion message

> "[feature-name] shipped. Episode [NNN] committed.
>
> - Version: v[X.Y.Z]
> - Episode: docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md
> - CHANGELOG updated: docs/pdlc/memory/CHANGELOG.md
> - OVERVIEW updated: docs/pdlc/memory/OVERVIEW.md
>
> Ready for the next feature — run `/pdlc brainstorm <next-feature>` to start."

---

Return to `SKILL.md`. Operation is complete.
