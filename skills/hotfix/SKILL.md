---
name: hotfix
description: "Emergency compressed build-ship cycle for production issues"
argument-hint: <hotfix-name>
---

You are running an emergency hotfix. The argument passed is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask: "What's the hotfix for? (Provide a short slug, e.g. `fix-login-crash` or `patch-api-timeout`)"

Store the hotfix slug as `[hotfix-name]`.

---

## Lead Agent: Pulse (DevOps)

Pulse leads the hotfix — production is on fire and ops takes the wheel. Read `agents/pulse.md` for Pulse's full persona.

Before the first user-facing message, read `skills/formatting.md` and output a **Phase Transition Banner** for "HOTFIX" in red-tinted styling, followed by:

> **Pulse (DevOps):** "Emergency hotfix mode. I'm taking the lead — we'll skip brainstorm and design, go straight to a compressed build-test-ship cycle. TDD is still enforced but we're moving fast. Let's fix this."

---

## Step 1 — Pause current feature (if any)

Read `docs/pdlc/memory/STATE.md`. Check if a feature is currently active.

**If a feature is active (phase is not Idle and not a `Complete — Ready for` state):**

Save the full current state to `docs/pdlc/memory/.paused-feature.json`:

```json
{
  "feature": "[current feature name]",
  "phase": "[current phase]",
  "subPhase": "[current sub-phase]",
  "activeBeadsTask": "[active task ID and title, or none]",
  "lastCheckpoint": "[last checkpoint from STATE.md]",
  "partyMode": "[party mode from STATE.md]",
  "featureBranch": "feature/[feature-name]",
  "pausedAt": "[now ISO 8601]",
  "pausedBy": "hotfix/[hotfix-name]",
  "stateSnapshot": "[full raw content of the Current Phase, Current Feature, Current Sub-phase, Active Beads Task, and Last Checkpoint sections from STATE.md]"
}
```

If there's an active Beads task, unclaim it so it doesn't block:
```bash
bd update [task-id] --assignee "" --status open
```

Inform the user:
> "Pausing **[feature-name]** at checkpoint `[last checkpoint]`. Full state saved to `.paused-feature.json`. We'll resume it after the hotfix — including an impact assessment."

Append to STATE.md Phase History:
```
| [now] | feature_paused | [phase] | [sub-phase] | [feature-name] |
```

**If no feature is active:** skip this step.

---

## Step 2 — Sync check and create hotfix branch

**Remote sync check:** Read `skills/sync-check.md` and execute the sync check protocol. The hotfix must be based on the current state of production (latest main). If behind, pull before branching.

```bash
git checkout main && git pull origin main && git checkout -b hotfix/[hotfix-name]
```

Update STATE.md:
- **Current Phase**: `Hotfix`
- **Current Feature**: `[hotfix-name]`
- **Current Sub-phase**: `Build`
- **Active Beads Task**: `none`
- **Last Checkpoint**: `Hotfix / Build / [now ISO 8601]`

Append to Phase History:
```
| [now] | hotfix_start | Hotfix | Build | [hotfix-name] |
```

---

## Step 3 — Describe the issue

Ask the user:
> "Describe the production issue:
> 1. What's broken? (user-visible symptom)
> 2. What's the suspected cause? (if known)
> 3. How severe? (users can't use the app / degraded experience / cosmetic)"

Record the answers. This replaces the full PRD — hotfixes don't get inception.

---

## Step 4 — Create Beads task

Collect metadata context:
```bash
git_user="$(git config user.name)"
git_branch="$(git branch --show-current)"
utc_now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

```bash
bd create "Hotfix: [hotfix-name]" \
  -d "[Created: ${utc_now} | Author: ${git_user} | Branch: ${git_branch}]
[user's description from Step 3]" \
  -l "hotfix,emergency,user:${git_user},branch:${git_branch}" \
  -t bug
```

Claim the task:
```bash
bd update [task-id] --claim
```

Update STATE.md Active Beads Task.

---

## Step 5 — Compressed TDD build

**TDD is still enforced** — write a failing test that reproduces the bug, then fix it.

Read `skills/tdd/SKILL.md` and follow the Red → Green → Refactor cycle. The 3-strike rule still applies — if the fix fails 3 times, convene a Strike Panel (but keep it to Neo + Echo + Pulse only for speed).

**No Party Review.** Instead, run a focused security-only check:
- Phantom reviews the diff for security implications
- Echo confirms the fix doesn't break existing tests

```bash
# Run existing test suite to check for regressions
npm test
```

If existing tests fail, stop and inform the user — the hotfix introduced a regression.

---

## Step 6 — Expedited ship

**Merge, tag, and push:**

Read the current tag and bump patch: `v1.2.3` → `v1.2.4`. Then run:

```bash
bash scripts/hotfix-merge.sh [hotfix-name] v[X.Y.Z] "[one-line description]"
```

The script handles checkout to main, merge, tag, and push in a single operation.

**CHANGELOG entry:**
```markdown
## v[X.Y.Z] — [today] (HOTFIX)

### Fixed
- [hotfix-name]: [description]
```

**Trigger deploy** — use the same auto-detection logic as ship Step 9.3 (npm deploy / make deploy / GitHub Actions / manual). **The custom-deployment prompt and Deployment Review Party from ship Step 9.1–9.2 are deliberately skipped in hotfix mode.** Hotfixes prioritize speed over review overhead; if the user has a custom deploy script in the repo, Pulse picks it up through the normal auto-detection (e.g. an existing `npm run deploy` pointing at their script), but the full team meeting is not convened.

**Mark task done:**
```bash
bd done [task-id]
```

---

## Step 7 — Expedited verify

Quick smoke test only — no full 7-layer test suite:

1. HTTP health check against deploy URL
2. Specific reproduction check: "Does the issue from Step 3 still occur?"
3. User confirms: "Is the fix working in production? (yes/no)"

If no: help diagnose. If yes: proceed.

---

## Step 8 — Create hotfix episode

Create a compact episode file at `docs/pdlc/memory/episodes/[NNN]_hotfix-[hotfix-name]_[date].md`:

```markdown
# Episode [NNN]: Hotfix — [hotfix-name]

**Type:** Hotfix (emergency)
**Date:** [today]
**Version:** v[X.Y.Z]
**Severity:** [from Step 3]

## Issue
[Description from Step 3]

## Fix
[What was changed — files modified, approach taken]

## Test Coverage
- Regression test added: [yes/no — test name]
- Existing tests: [all passing / N failures addressed]

## Time to Fix
[Start time from Step 2 to verify complete in Step 7]
```

Update episodes/index.md with the hotfix entry.
Update OVERVIEW.md to note the hotfix.

---

## Step 9 — Impact assessment on paused feature

Read `docs/pdlc/memory/.paused-feature.json`. If it exists, a feature was paused for this hotfix.

**Assess impact:**

Get the diff between main (with hotfix) and the paused feature's branch:
```bash
git diff main..feature/[paused-feature-name] --stat
```

Also check what the hotfix changed:
```bash
git diff HEAD~1..HEAD --name-only
```

Cross-reference: did the hotfix modify any files that the paused feature also modifies or depends on?

**If overlap exists:**

Inform the user:
> "The hotfix modified files that overlap with the paused feature **[feature-name]**:
> [list of overlapping files]
>
> Before resuming, I'll rebase the feature branch on main (which now includes the hotfix) to incorporate the changes."

Rebase the feature branch:
```bash
git checkout feature/[paused-feature-name]
git rebase main
```

If rebase has conflicts:
> "Rebase has conflicts in [files]. Please resolve them, then I'll continue the resume."
Wait for resolution.

If clean:
> "Feature branch rebased cleanly — hotfix changes are incorporated."

**If the hotfix changes could affect the paused feature's design or tests:**

Run a targeted assessment — ask Neo and Echo:
- **Neo:** "Does this hotfix change any architectural assumptions the paused feature relies on?"
- **Echo:** "Do any of the paused feature's tests need updating because of this hotfix?"

If either identifies issues, present them to the user before resuming:
> "The hotfix may affect the paused feature:
> - [Neo's finding, if any]
> - [Echo's finding, if any]
>
> Keep these in mind as you continue building. The affected areas will need attention."

**If no overlap:** inform the user that the hotfix doesn't affect the paused feature.

---

## Step 10 — Resume paused feature

Read `.paused-feature.json` and restore STATE.md:

- **Current Phase**: `[saved phase]`
- **Current Feature**: `[saved feature name]`
- **Current Sub-phase**: `[saved sub-phase]`
- **Active Beads Task**: `none` (was unclaimed in Step 1 — the build loop will re-claim)
- **Last Checkpoint**: `[saved last checkpoint]`
- **Party Mode**: `[saved party mode]`

Append to Phase History:
```
| [now] | hotfix_complete | Hotfix | Complete | [hotfix-name] |
| [now] | feature_resumed | [saved phase] | [saved sub-phase] | [saved feature] |
```

Switch to the feature branch:
```bash
git checkout feature/[saved feature name]
```

Delete `.paused-feature.json`.

Update STATE.md Last Checkpoint to now.

Announce the resume with a handoff:

> **Pulse (DevOps):** "Hotfix shipped and verified. Handing back to the previous workflow."

Output a **Phase Transition Banner** for the resumed phase, then the appropriate lead agent's greeting:

> **[Lead Agent for resumed phase] ([Role]):** "Welcome back. We're resuming **[feature-name]** at **[phase] / [sub-phase]**. [If hotfix had impact:] Note: the hotfix changed [summary] — keep that in mind as we continue."

Re-invoke the appropriate phase skill (`/pdlc brainstorm`, `/pdlc build`, or `/pdlc ship`). The skill reads STATE.md and resumes from the last checkpoint.

**If no feature was paused:**

Update STATE.md to Idle. Handoff to Oracle for next feature (same as ship Step 18).

---

## Rules

- **TDD is still enforced** during hotfix — no implementation without a failing test. The test proves the bug exists and proves the fix works.
- **No inception** — hotfixes skip brainstorm/design entirely. The "PRD" is the user's 3-line description from Step 3.
- **No Party Review** — replaced by focused Phantom + Echo check. Speed over thoroughness.
- **Patch version only** — hotfixes always bump patch, never minor or major.
- **Feature pause is automatic** — if a feature is active, it's paused without asking. Production emergencies take priority.
- **Resume is also automatic** — after the hotfix, the paused feature is restored. The user doesn't need to remember where they were.
- **Impact assessment is required** — the hotfix may have changed code the paused feature depends on. The rebase + assessment ensures the feature picks up those changes cleanly.
- The hotfix episode is a compact format — not the full episode template. Speed over documentation.
