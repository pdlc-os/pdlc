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

### Episodic memory

Every time a feature is delivered, Claude drafts an episode file capturing what was built, key decisions, test results, tech debt, and the agent team's retro. Human approves before it's committed to permanent record.

---

← [Back to README](../../README.md) | [Next: Safety Guardrails →](09-safety-guardrails.md)
