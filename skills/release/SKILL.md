---
name: release
description: "Force-release a stuck roadmap-level feature claim (admin command)"
argument-hint: <F-NNN>
---

You are force-releasing a roadmap-level feature claim. Use this when a claim is stuck — dev left the team, laptop unavailable, session died without cleanup — and another dev needs to pick up or reassign the feature.

If `$ARGUMENTS` is empty, list every currently-held roadmap claim and ask which to release:

```bash
bd list --label roadmap --status in-progress --json
```

Present the list as:

> "Active roadmap claims:
> - **F-005** (`user-auth`) — held by `alice@example.com` since `2026-04-10`
> - **F-008** (`webhooks`) — held by `bob@example.com` since `2026-04-18`
>
> Which do you want to release? Type `F-NNN` or `cancel`."

Store the target feature ID as `[feature-id]` and feature slug as `[feature-name]`.

---

## Safeguards

### Guard 1 — Never release your own active claim

Check if `[feature-id]` is claimed by the current user:

```bash
bd list --claimed-by me --label roadmap --label [feature-id] --json
```

If the result is non-empty, refuse:

> "`[feature-id]` is **your own** active claim. Use `/pdlc abandon` if you want to stop work on this feature — that preserves artifacts and records an ADR. `/pdlc release` is for unsticking someone else's orphaned claims."

Stop here.

### Guard 2 — Confirm the force-release

Show what's being released and require explicit confirmation:

```bash
bd show [bd-task-id]
```

Print:

> "**Force-releasing `[feature-id]: [feature-name]`**
>
> - Currently claimed by: `[claimer email]`
> - Claimed at: `[timestamp]`
> - Status will go from `in-progress` → `planned`
> - Feature becomes available for the next `/pdlc brainstorm`
>
> This is a **Tier 2** action — it interferes with another developer's in-flight work. Confirm with their team first if possible.
>
> **Reason for force-release?** (required — goes into DECISIONS.md)"

Wait for a reason. Empty / `skip` / `cancel` aborts.

---

## Step 1 — Release the claim in Beads

```bash
bd unclaim [bd-task-id]
bd update [bd-task-id] --status planned
```

If `bd update --status` isn't supported, use `bd update [bd-task-id] --reopen` or the closest equivalent to put the task back into `planned` so `bd ready --label roadmap` surfaces it.

Report:

> "Claim released. `[feature-id]` is now available for the next `/pdlc brainstorm`."

---

## Step 2 — Update ROADMAP.md

Find the row for `[feature-id]`. Update:
- **Claimed by**: clear to `—`
- **Status**: `In Progress` → `Planned`
- **Last updated** (file header): today's date

---

## Step 3 — Record the forced release in DECISIONS.md

Append a new ADR:

```markdown
### ADR-[NNN]: Force-release of roadmap claim [feature-id]

**Date:** [today]
**Source:** User (explicit — `/pdlc release [feature-id]`)
**Phase:** Administrative
**Agent:** Oracle
**Feature:** [feature-name]
**Previous claimer:** [email]
**Status:** Active

**Decision:** Force-release the claim on `[feature-id]` without consent from the prior claimer.

**Context:** [user's reason]

**Alternatives considered:** Not applicable — administrative action.
```

---

## Step 4 — Optional notify

If `gh` is available AND the repo has a pinned `Roadmap` GitHub issue (from the ship-time mirror), append a comment to that issue:

```bash
gh issue comment <roadmap-issue-number> --body "Force-released claim on **[feature-id]** (was held by @[prior-claimer]). Reason: [user's reason]. Released by @[me]."
```

Skip silently if `gh` is unavailable or no pinned issue exists.

---

## Final confirmation

Tell the user:

> "Force-release complete for `[feature-id]`.
>
> - Beads task unclaimed, status → `planned`
> - ROADMAP.md updated
> - ADR-[NNN] recorded in DECISIONS.md
> [If notified:] - Comment posted to the Roadmap issue
>
> The next `/pdlc brainstorm` (without args) will pick this feature up as the next priority candidate."

---

## Rules

- **`/pdlc release` never touches artifacts.** PRDs, design docs, brainstorm logs, and feature branches created by the prior claimer stay in place. The next dev who claims the feature can choose to reuse or discard them.
- **`/pdlc release` never releases your own active claim** — use `/pdlc abandon` instead.
- **Every release is recorded.** The ADR is the audit trail for who released what and why.
- If the target task cannot be found in Beads, refuse with "No Beads task found for `[feature-id]` — check `bd list --label roadmap` and `/pdlc doctor`." Do not fall back to editing ROADMAP.md alone; that would create the exact drift this skill is designed to prevent.
