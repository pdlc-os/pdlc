# Pause & Resume

Explicitly save your current feature state and resume later — across sessions, days, or context window resets.

---

### Pause (`/pdlc pause`)

Cleanly saves your exact position so nothing is lost:

- Full state snapshot saved to `.paused-feature.json` (phase, sub-phase, active task, checkpoint, branch)
- Active Beads task unclaimed (returns to the ready queue)
- STATE.md set to `Idle — Paused`
- ROADMAP.md stays `In Progress` — work will resume

Only one feature can be paused at a time. The session-start hook detects `.paused-feature.json` and reminds you on every new session.

### Resume (`/pdlc resume`)

Restores your paused feature with full context awareness:

1. **Checks for changes** — scans `git log` on main since the pause timestamp
2. **Rebases** — if main has new commits (teammate work, hotfixes), rebases the feature branch to incorporate them
3. **Conflict handling** — if rebase has conflicts, stops and asks you to resolve
4. **Impact assessment** — if changes include hotfixes, Neo and Echo assess whether the feature's design or tests need updating
5. **Reclaims Beads task** — the task that was active at pause time is reclaimed via `bd update --claim`. If the task was completed or modified while paused, picks the next ready task instead.
6. **Restores STATE.md** — full state restored from snapshot
7. **Lead agent announcement** — the appropriate phase lead greets you with a summary of what changed since the pause

### When to use

- End of day — pause, close Claude Code, resume tomorrow
- Context window getting full — pause cleanly before compaction
- Need to switch to a different feature — pause one, brainstorm the other
- Before running `/pdlc hotfix` — hotfix auto-pauses for you, but manual pause works too

### Relationship to hotfix

`/pdlc hotfix` uses the same `.paused-feature.json` mechanism internally. If you manually pause and then run a hotfix, the hotfix detects the existing paused state and warns you.


---

[← Previous: Doctor](04-doctor.md) | [Back to README](../../README.md) | [Next: Hotfix →](06-hotfix.md)
