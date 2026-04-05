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

**16c. Update ROADMAP.md:**

Read `docs/pdlc/memory/ROADMAP.md`. Find the row in the Feature Backlog table whose feature slug matches `[feature-name]`. Update that row:
- **Status**: `Planned` or `In Progress` → `Shipped`
- **Shipped**: `—` → `[today's date YYYY-MM-DD]`
- **Episode**: `—` → `[NNN]_[feature-name]_[YYYY-MM-DD].md`
- **Last updated** (file header): today's date

If no matching row exists (the feature was added ad-hoc and never captured in the roadmap), append a new row with the next available `F-NNN` ID, the feature details, `Shipped` status, today's date, and the episode reference.

**16d. Commit everything:**

```bash
git add docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md
git add docs/pdlc/memory/episodes/index.md
git add docs/pdlc/memory/OVERVIEW.md
git add docs/pdlc/memory/CHANGELOG.md
git add docs/pdlc/memory/ROADMAP.md
git commit -m "docs(pdlc): add episode [NNN] — [feature-name]"
git push origin main
```

**TIER 2 action**: this is a direct push to main (not a PR). Since this is a docs-only commit (episode file), it is acceptable — but confirm with the user if their workflow requires a PR even for docs.

### Step 17 — Final STATE.md update

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Idle — Ready for next /pdlc brainstorm`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Operation / Complete / [now ISO 8601]`

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
