# Rollback — Revert a Shipped Feature

Run `/pdlc rollback [feature-name]` to revert a shipped feature that's causing production issues. Oracle (PM) leads.

---

### How it works

| Step | What happens |
|------|-------------|
| **Confirm** | Shows what will be reverted (merge commit, version, episode) and asks for confirmation |
| **Revert** | `git revert` of the merge commit (preserves history, no force-push). Rollback tag created. |
| **State update** | ROADMAP set to `Rolled Back`, CHANGELOG rollback entry, episode file updated with rollback details |
| **Post-Mortem Party** | Required meeting — Oracle leads all 9 agents through 3 rounds |
| **Options** | Fix and re-ship, abandon the feature, or pause |

### Post-Mortem meeting

The post-mortem is mandatory — it cannot be skipped. Oracle facilitates 3 rounds:

**Round 1 — Root cause diagnosis:** Each agent analyzes the failure from their domain (architecture, backend, frontend, tests, security, UX, ops, docs). Each produces: root cause assessment, whether it was preventable, severity.

**Round 2 — Cross-examination:** Oracle routes specific findings between agents for direct challenge. If Bolt says "API returned wrong schema," Jarvis is asked "Was the contract correct?" Maximum one cross-examination round.

**Round 3 — Fix proposals:** Each agent that identified a problem proposes a concrete fix with effort and risk assessment. Oracle synthesizes into **3 ranked approaches**:
1. **Recommended** — best fix with rationale
2. **Alternative** — different tradeoff
3. **Minimal** — smallest change that addresses the immediate issue

### Your options after the post-mortem

| Option | What happens |
|--------|-------------|
| **Fix and re-ship** (pick approach 1, 2, or 3) | ADR recorded, ROADMAP set to In Progress, Beads fix task created with `fix,post-mortem` labels, launches `/pdlc build` |
| **Abandon** | Closes all tasks, marks ROADMAP as Dropped, archives artifacts, hands off to Oracle for next feature |
| **Pause** | Saves post-mortem, sets STATE to Idle, decide later |

### What gets recorded

Every rollback produces:
- ADR entry in DECISIONS.md
- Post-mortem MOM file in `docs/pdlc/mom/`
- Rollback note in the episode file
- CHANGELOG rollback entry
- Rollback tag in git

---

[← Previous: Hotfix](16-hotfix.md) | [Back to README](../../README.md) | [Next: Abandon →](18-abandon.md)
