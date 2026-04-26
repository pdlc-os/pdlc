# Doctor Checks 5–8 and Report
## Document drift, git history, pending files, Constitution compliance, and fix mode

---

## Check 5 — Document vs code drift

This is the most expensive check. For each active or recently shipped feature, verify that docs match reality:

### PRD vs implementation
- Read the PRD's acceptance criteria
- For each criterion, grep the codebase for related test names (tests should use Given/When/Then from the PRD)
- Flag any AC with no corresponding test

### Architecture vs code
- Read `ARCHITECTURE.md` — what components/services/modules does it describe?
- Check if those components actually exist in the codebase (grep for module names, file paths, class names)
- Flag components described in architecture that don't exist in code, and code modules not mentioned in architecture

### API contracts vs implementation
- Read `api-contracts.md` — what endpoints are documented?
- Grep codebase for route definitions (e.g., `app.get`, `router.post`, `@Get`, etc.)
- Flag endpoints in the contract that don't exist in code, and endpoints in code not in the contract

### OVERVIEW.md vs reality
- Read the "Active Functionality" section
- Cross-reference with the last few episodes and the current codebase
- Flag described functionality that appears to have been removed (no matching code)

**Findings:**
- AC without test → `[WARNING] PRD acceptance criterion [N] has no matching test`
- Architecture ghost → `[WARNING] ARCHITECTURE.md describes [component] but it doesn't exist in code`
- Undocumented code → `[INFO] Code module [X] exists but isn't mentioned in ARCHITECTURE.md`
- Contract drift → `[WARNING] api-contracts.md documents [endpoint] but it's not in the code (or vice versa)`
- Removed functionality → `[CRITICAL] OVERVIEW.md describes [feature] but the code appears to have been removed`

---

## Check 6 — Git history vs PDLC state (multi-user & rollback detection)

Detect situations where the repo changed outside of PDLC's awareness:

### Rollback detection
- Read STATE.md Phase History — get the last few checkpoint timestamps
- Run `git log --since="[oldest checkpoint]" --oneline`
- Look for revert commits (`git log --grep="revert" --grep="Revert" -i`)
- Look for force pushes: compare `git log` with `git reflog` (if available) for missing commits
- If reverts exist after the last PDLC checkpoint, the code may have changed without PDLC docs being updated

### Multi-user detection
- Run `git log --format="%ae" --since="[last checkpoint]" | sort -u` to get unique committers since the last PDLC checkpoint
- If >1 committer is found, check if any non-PDLC commits touched files in `docs/pdlc/` (manual edits to memory files) or changed code that PRDs/architecture docs describe
- Flag manual edits to CONSTITUTION.md or STATE.md (these should go through PDLC)

### Cross-session detection
- Read `git log --oneline` for commits since the last STATE.md checkpoint
- Identify any commits that don't follow PDLC's commit message conventions (these were made outside PDLC)
- If code was changed outside PDLC, the architecture docs and episode file may be stale

**Findings:**
- Revert detected → `[CRITICAL] Revert commit found: [hash] [message]. Code may not match PDLC docs.`
- Manual STATE.md edit → `[WARNING] STATE.md was modified by git commit [hash] outside of PDLC`
- Non-PDLC commits → `[INFO] [N] commits since last checkpoint were made outside PDLC by [authors]`
- Multi-user changes to PDLC files → `[WARNING] [user] modified [file] directly — may conflict with PDLC state`

---

## Check 7 — Pending file health

Check for stale or conflicting pending files:

- `.pending-party.json` — is it older than 24 hours? Does its meetingType match any current phase?
- `.pending-decision.json` — is it older than 24 hours? Does the decision text reference a feature that's still active?
- Both exist simultaneously — is this a valid nesting (decision containing a meeting) or an inconsistency?

**Findings:**
- Stale pending party → `[WARNING] .pending-party.json is [N] hours old — likely abandoned`
- Stale pending decision → `[WARNING] .pending-decision.json is [N] hours old — likely abandoned`
- Conflicting pending files → `[INFO] Both .pending-party.json and .pending-decision.json exist — [valid nesting / potential conflict]`

---

## Check 8 — CONSTITUTION.md compliance

Verify the current codebase respects the Constitution:

- **Tech stack** — do the dependencies in `package.json` (or equivalent) match what CONSTITUTION.md declares?
- **Test gates** — are the required test layers actually present? (e.g., if Constitution says Unit + Integration required, do those test files exist?)
- **Architectural constraints** — if Constitution says "all business logic in service layer", grep for business logic patterns outside service files

**Findings:**
- Stack mismatch → `[WARNING] CONSTITUTION.md says [framework] but package.json doesn't include it`
- Missing test layer → `[WARNING] CONSTITUTION.md requires [layer] tests but no test files found for that layer`
- Constraint violation → `[WARNING] CONSTITUTION.md constraint "[rule]" may be violated in [file]`

---

## Check 9 — Plugin / skill conflicts

Detect other Claude Code plugins or raw skill clones whose commands/skills overlap with PDLC's namespace. Today this primarily targets `obra/superpowers`, which ships a `/brainstorm` slash command that, when installed as raw files (rather than via `claude plugins install`), shadows PDLC's `/brainstorm`.

Run:
```bash
pdlc check-conflicts --repo-root "$(pwd)"
```

Interpret the exit code:
- **0** — clean, or only proper plugin installs detected (commands are namespaced as `/<plugin>:<cmd>`, so no real collision; a one-line FYI may print).
- **2** — at least one raw-clone conflict detected (same-name commands at the unnamespaced level — needs user attention).

**Findings:**
- Raw-clone conflict (exit 2) → `[WARNING] [tool] is installed as raw skills/commands at [path] — /brainstorm or other commands may shadow PDLC's. Run \`pdlc check-conflicts\` for resolution options.`
- Plugin install only (informational) → `[INFO] [tool] is installed as a Claude Code plugin alongside PDLC. Commands are namespaced; no collision.`
- Clean → no entry in the report.

---

## Report — Present findings to user

Compile all findings into a report sorted by severity:

```
PDLC Doctor Report
==================

Project: [name]
Date: [today]
Phase: [current phase from STATE.md]
Feature: [active feature or "none"]

CRITICAL ([N])
--------------
[list all CRITICAL findings]

WARNING ([N])
-------------
[list all WARNING findings]

INFO ([N])
----------
[list all INFO findings]

CLEAN ([N] checks passed)
--------------------------
[list checks that found no issues]

Summary: [N] critical, [N] warnings, [N] info across [8] checks.
```

Then ask the user:

> "Doctor found **[N] critical**, **[N] warnings**, and **[N] info** items.
>
> What would you like to do?
> - **Fix all** — I'll fix critical and warning items (with your approval for each)
> - **Fix critical only** — address only the critical issues
> - **Review one by one** — walk through each finding and decide
> - **Export** — save the report to `docs/pdlc/doctor-report_[date].md` and fix later
> - **Dismiss** — acknowledge and continue without fixing"

### Fix mode

For each finding the user wants to fix, present the finding and the available actions.

#### Conflict findings (two sources disagree)

When doctor finds a conflict between two artifacts (e.g., CONSTITUTION says PostgreSQL but code uses MongoDB, or ARCHITECTURE.md describes a component that doesn't exist), ask the user which source is the truth:

> "**Conflict:** CONSTITUTION.md says tech stack includes `[X]` but `package.json` uses `[Y]`.
>
> Which is correct?
> - **A — CONSTITUTION is correct** → I'll update the code/config to match
> - **B — Code is correct** → I'll update CONSTITUTION.md to match
> - **Ignore** — skip this for now (it will surface again next time you run doctor)
>   - Optional: provide a reason or direction"

If the user picks A or B, apply the fix to the losing side. If the user picks Ignore, optionally capture their explanation.

#### Non-conflict findings (something is missing or broken)

For straightforward fixes (missing files, orphaned tasks, stale pending files), propose the specific change:
- State file fixes → show the exact field change
- ROADMAP fixes → show the row update
- Beads fixes → show the `bd` command to run
- Doc drift → flag for manual review (doctor doesn't rewrite PRDs/architecture)
- Rollback impact → suggest running the reconciliation protocol or re-running the affected phase

Each finding offers three actions:

> - **Fix** — apply the proposed change
> - **Ignore** — skip this for now (will surface again next run)
>   - Optional: provide a reason or direction
> - **Dismiss permanently** — suppress this specific finding in future runs

#### Ignored findings

When the user selects **Ignore** (with or without explanation), append the finding to `docs/pdlc/memory/.doctor-ignored.json`:

```json
{
  "ignored": [
    {
      "check": 8,
      "finding": "CONSTITUTION.md says PostgreSQL but package.json uses MongoDB",
      "severity": "WARNING",
      "ignoredAt": "2026-04-05T12:00:00Z",
      "reason": "Migrating next sprint, don't fix now",
      "permanent": false
    }
  ]
}
```

On subsequent `/pdlc doctor` runs:
- **Non-permanent ignores** resurface every time — they appear in the report with a note: `(previously ignored: "[reason]")`
- **Permanent dismissals** are excluded from the report entirely — unless the underlying state changes (e.g., a dismissed tech stack mismatch resurfaces if CONSTITUTION.md is updated)

When the underlying state changes for a permanently dismissed finding (the file or field it references was modified since the dismissal), remove the dismissal and resurface the check.

#### After fixes

After all approved fixes are applied, re-run the relevant checks to confirm they pass. Report the results:

> "Fixed [N] of [M] findings. [X] ignored. [Y] re-checked and passing."

---

Return to `skills/doctor/SKILL.md` — the Rules section there applies to all doctor operations.
