# Abandon — Drop an In-Progress Feature

Run `/pdlc abandon` to cleanly stop work on a feature that is no longer viable. Oracle (PM) leads — this is a product decision.

---

### When to use

- Feature discovered to be technically infeasible mid-build
- Business priorities changed — this feature no longer matters
- Scope creep made the feature unmanageable
- Dependencies can't be resolved
- User feedback invalidated the original premise

### How it works

| Step | What happens |
|------|-------------|
| **Confirm** | Oracle shows current state (phase, open tasks, existing artifacts) and asks for the reason |
| **Record** | ADR entry in DECISIONS.md with reason, work completed, phase reached |
| **Close tasks** | All open Beads tasks closed with abandonment note. Beads purged and compacted. |
| **Update ROADMAP** | Status set to `Dropped` with date and episode reference |
| **Episode** | Compact abandonment episode: reason, work completed, decision record, lessons learned |
| **Archive** | PRDs, design docs, reviews, brainstorm logs, MOMs moved to `docs/pdlc/archive/` |
| **Next feature** | Oracle presents next roadmap item — continue, pause, or switch |

### What's preserved vs archived

| Artifact | What happens |
|----------|-------------|
| PRD | Moved to `docs/pdlc/archive/prds/` |
| Design docs | Moved to `docs/pdlc/archive/design/[feature]/` |
| Review files | Moved to `docs/pdlc/archive/reviews/` |
| Brainstorm log | Moved to `docs/pdlc/archive/brainstorm/` |
| MOM files | Moved to `docs/pdlc/archive/mom/` |
| Episode file | Stays in `docs/pdlc/memory/episodes/` (permanent record) |
| Feature branch | Kept in git (not merged, not deleted — user can prune manually) |

### Abandonment vs pause

| | Abandon | Pause |
|---|---------|-------|
| **Intent** | Permanently stop — feature is dropped | Temporarily stop — will resume later |
| **ROADMAP** | Set to `Dropped` | Stays `In Progress` |
| **Beads tasks** | Closed | Unclaimed (returned to queue) |
| **Artifacts** | Archived | Left in place |
| **Episode** | Abandonment episode created | No episode |
| **Reversible?** | No — to revisit, add as a new `F-NNN` | Yes — `/pdlc resume` |


---

[← Previous: Rollback](07-rollback.md) | [Back to README](../../README.md) | [Next: The Agent Team →](09-agent-team.md)
