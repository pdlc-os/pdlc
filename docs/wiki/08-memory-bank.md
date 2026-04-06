# Memory Bank

All PDLC-generated files live under `docs/pdlc/` inside your repo, version-controlled alongside your code:

```
docs/pdlc/
  memory/
    CONSTITUTION.md        <- rules, standards, test gates, guardrail overrides
    INTENT.md              <- problem statement, target user, value proposition
    STATE.md               <- current phase, active task, party mode, phase history
    ROADMAP.md             <- prioritized feature backlog (F-NNN IDs, separate priority column)
    DECISIONS.md           <- decision registry (ADR format, links to MOM files)
    CHANGELOG.md           <- what shipped and when
    OVERVIEW.md            <- aggregated delivery state
    episodes/
      index.md             <- searchable episode index
      001_auth_2026-04-04.md
  prds/
    PRD_[feature]_[date].md
    plans/
      plan_[feature]_[date].md
  design/
    [feature]/
      ARCHITECTURE.md
      data-model.md
      api-contracts.md
  reviews/
    REVIEW_[feature]_[date].md
  brainstorm/
    brainstorm_[feature]_[date].md
  mom/
    [feature]_[topic]_mom_[YYYY]_[MM]_[DD].md
    MOM_decision_[ADR-NNN]_[YYYY-MM-DD].md
```

### Temporary state files

In addition to the permanent memory files, PDLC uses temporary files for crash recovery:

| File | Purpose | Lifetime |
|------|---------|----------|
| `docs/pdlc/memory/.pending-party.json` | In-progress meeting state | Created before meeting, deleted on completion |
| `docs/pdlc/memory/.pending-decision.json` | In-progress decision state | Created before decision flow, deleted on completion |
| `docs/pdlc/memory/.paused-feature.json` | Feature state snapshot during hotfix | Created when hotfix pauses a feature, deleted on resume |

These files are detected on session start. If multiple pending files exist, they're resolved innermost-first (meeting → decision → phase). Files older than 24 hours are treated as stale and cleaned up. See `skills/state-reconciliation.md` for the full protocol.

### State authority hierarchy

When state files disagree (e.g., after a crash mid-operation):

1. **STATE.md** is the single source of truth for where the workflow is
2. **ROADMAP.md** is reconciled to match STATE.md's active feature
3. **Beads** task status is reconciled to match STATE.md's active task
4. **Pending files** indicate interrupted sub-operations within the current phase

### Episodic memory

Every time a feature is delivered, Claude drafts an episode file capturing what was built, key decisions, test results, tech debt, and the agent team's retro. Human approves before it's committed to permanent record.

---

[← Previous: Skills Architecture](07-skills-architecture.md) | [Back to README](../../README.md) | [Next: Safety Guardrails →](09-safety-guardrails.md)
