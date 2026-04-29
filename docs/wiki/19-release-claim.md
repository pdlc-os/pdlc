# Force-Releasing a Stuck Roadmap Claim (`/pdlc release` · alias `/release`)

PDLC uses Beads as the atomic claim lock on roadmap-level features — each `F-NNN` on the roadmap is a Beads task, and `/pdlc brainstorm` can only proceed once a dev holds the claim. This prevents two developers from accidentally starting on the same priority-next feature.

Sometimes a claim gets stuck: the claimer leaves the team, their machine dies with unpushed state, or they've been silent for weeks with no commits on the feature branch. `/pdlc release <F-NNN>` is the administrative escape hatch for that case.

## When to use it

Use `/pdlc release`:
- A teammate left the company with a roadmap feature still claimed in Beads.
- A laptop was lost / stolen / permanently offline with unpushed claim state.
- A long-standing claim has had zero branch activity for >30 days (`/pdlc doctor` flags these as `stale-roadmap-claim`).
- The team has agreed to reassign a blocked feature to someone else.

**Do not use `/pdlc release`** when:
- The claim is yours → use `/pdlc abandon` instead (preserves artifacts, records the decision with full context).
- The dev is temporarily away (vacation, on-call rotation, short pause) → they'll pick it up on return, and their claim is protected.
- You want to re-sequence priorities → use `/pdlc decide` to formally change the roadmap instead of releasing the claim.

## What happens

| Step | What it does |
|------|-------------|
| **Target** | Explicit: `/pdlc release F-005`. No arg: PDLC lists every active claim and asks which to release. |
| **Guard 1** | Refuses if the target claim is your own (redirects to `/pdlc abandon`). |
| **Guard 2** | Shows the current claimer and claim timestamp, then requires an explicit reason before proceeding. Empty reason or `cancel` aborts. |
| **Beads update** | `bd unclaim` + flip task status back to `planned` so `bd ready --label roadmap` surfaces it to the next `/pdlc brainstorm`. |
| **ROADMAP.md** | `Claimed by` column cleared to `—`, `Status` returns to `Planned`. |
| **DECISIONS.md** | A new ADR captures: releaser, prior claimer, reason, date. This is the audit trail. |
| **GH mirror** *(optional)* | If the repo has a pinned Roadmap GitHub issue (from ship-time mirror), a comment is posted noting the force-release. Silently skipped on non-GitHub repos. |

## What it does **not** do

- Does not touch any artifacts. The prior claimer's brainstorm log, PRD, design docs, and `feature/*` branch all remain in place. The next dev who claims the feature can reuse or discard them.
- Does not close Beads sub-tasks. If the prior claimer reached the plan sub-phase and spawned Beads sub-tasks, those are left alone — they'll either be resumed by the new claimer or cleaned up separately.
- Does not force-push or rewrite history. Git state is untouched.

## Example

```
/pdlc release F-005

> F-005 (user-authentication) is held by alice@example.com since 2026-03-02.
>
> This is a Tier 2 action — it interferes with another developer's in-flight work.
> Confirm with their team first if possible.
>
> Reason for force-release?
```

```
Alice is on indefinite medical leave. Team decided to reassign.
```

```
Claim released. F-005 is now available for the next /pdlc brainstorm.
ADR-0042 recorded in DECISIONS.md.
Comment posted to the Roadmap issue.
```

## Relationship to doctor

`/pdlc doctor` surfaces candidates for `/pdlc release` as `[INFO]` findings under `stale-roadmap-claim`:

```
[INFO] F-005 claimed by alice@example.com since 2026-03-02 with no commits on
       feature/user-authentication in the last 30 days. Nudge the owner or
       run /pdlc release F-005.
```

Running doctor before releasing a claim is good hygiene — it confirms the claim really is stale and not just paused.

---

[← Previous: Extensibility](18-extensibility.md) | [Back to README](../../README.md) | [Next: Threat Modeling →](20-threat-modeling.md)
