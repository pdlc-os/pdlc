# Hotfix — Emergency Compressed Build-Ship

Run `/pdlc hotfix <name>` when production is broken and can't wait for the normal feature cycle. Pulse (DevOps) leads.

---

### How it works

| Step | What happens |
|------|-------------|
| **Auto-pause** | Current feature's full state saved to `.paused-feature.json`. Beads task unclaimed. No confirmation needed — production emergencies take priority. |
| **Branch** | `hotfix/[name]` created from main |
| **Describe** | You answer 3 questions: what's broken, suspected cause, severity |
| **Build** | TDD enforced (failing test → fix → pass). No Party Review — just Phantom + Echo security check. 3-strike rule still applies. |
| **Ship** | Merge to main, patch version bump, deploy trigger |
| **Verify** | Expedited: HTTP health check + specific reproduction check + your confirmation |
| **Episode** | Compact hotfix episode created (shorter format than full feature episodes) |
| **Impact** | Diffs the hotfix against the paused feature branch. Rebases if overlap found. Neo + Echo assess if design/tests need updating. |
| **Resume** | Restores STATE.md from snapshot, switches to feature branch, lead agent announces context |

### What's different from normal build-ship

| Aspect | Normal feature | Hotfix |
|--------|---------------|--------|
| Inception (brainstorm/design) | Full Discover → Define → Design → Plan | Skipped entirely — 3-line description |
| Party Review | Full 4-agent parallel review | Phantom + Echo only |
| Test layers | All 7 layers | Existing test suite + security scan |
| Version bump | Minor or major | Patch only |
| Verify | Full smoke test + user journey | Quick health check + reproduction test |
| Episode | Full template | Compact format |

### Auto-resume mechanics

After the hotfix ships, PDLC automatically restores the paused feature:

1. Reads `.paused-feature.json` for the saved state
2. Diffs the hotfix commits against the feature branch for file overlap
3. Rebases the feature branch on main (which now includes the hotfix)
4. If the hotfix changed files the feature depends on, Neo and Echo assess the impact
5. Restores STATE.md, switches to the feature branch
6. Lead agent announces any impact before continuing


---

[← Previous: Pause & Resume](05-pause-resume.md) | [Back to README](../../README.md) | [Next: Rollback →](07-rollback.md)
