# Safety Guardrails

PDLC enforces a three-tier safety system. Rules can be adjusted in `CONSTITUTION.md`.

### Tier 1 — Hard block

Blocked by default. Requires the **double-RED confirmation protocol** to override: run `/pdlc override "<command>"`, then confirm twice (type `OVERRIDE`, then `I ACCEPT FULL RESPONSIBILITY`). Every override is permanently logged in STATE.md and DECISIONS.md.

- Force-push to `main` or `master`
- `DROP TABLE` without a prior migration file
- `rm -rf` outside files created on the current feature branch
- Deploy with failing Constitution test gates
- Accepting hardcoded secrets detected by Layer 7 security scan
- Shipping with critical dependency vulnerabilities (from `npm audit`)
- Shipping with P0 UX findings from Ship Verify (Step 11.5) — verbatim ban-list copy violations ("An error occurred", "Something went wrong", "Invalid input", "Error: undefined", "Error 500…"), keyboard-broken interactives where the design committed to focus, accessibility regressions vs the as-built scorecard. Override path: `/pdlc override` with the `OVERRIDE UX-P0` confirmation token.

### Tier 2 — Pause and confirm

PDLC stops and asks before proceeding. Individual items can be downgraded to Tier 3 in `CONSTITUTION.md`. Guardrails fire on **Bash, Edit, and Write** tools.

- Any `rm -rf` or bulk delete
- `git reset --hard`
- Production database commands
- Any external API write call (POST/PUT/DELETE to external URLs)
- Modifying `CONSTITUTION.md` (via any tool — Bash, Edit, or Write)
- Modifying `DECISIONS.md` directly (append-only registry)
- Closing all open Beads tasks at once

### Tier 3 — Logged warning

PDLC proceeds and records the decision in `STATE.md`.

- Modifying `STATE.md` directly (working file — PDLC commands update it on every phase transition)
- Skipping a test layer
- Overriding a Constitution rule
- Accepting a Phantom security warning without fixing
- Accepting an Echo test coverage gap
- Editing `ROADMAP.md`, `INTENT.md`, `OVERVIEW.md`, or `CHANGELOG.md` directly (normally managed by PDLC)


---

[← Previous: Memory Bank](13-memory-bank.md) | [Back to README](../../README.md) | [Next: Status Bar →](15-status-bar.md)
