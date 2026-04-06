# Status Bar

After installation, PDLC adds a live status bar to every Claude Code session:

```
Construction | bd-a1b2: Add auth middleware | my-app | ██████░░░░ 58%
```

| Element | Source |
|---------|--------|
| Phase | `docs/pdlc/memory/STATE.md` |
| Active task | Current Beads task (ID + title) |
| Context bar | Estimated from tool call count + token accumulation |

### Context usage estimation

Claude Code doesn't expose context window usage to hooks, so PDLC estimates it by tracking:
- **Tool call count** — each tool call adds to the running total
- **Token accumulation** — output size from Read, Grep, Bash, Agent, etc. is estimated (1 token ≈ 4 chars)
- **Turn overhead** — each conversation turn adds ~1500 tokens for message framing

The estimate is stored in a bridge file (`/tmp/pdlc-ctx-{sessionId}.json`) and updated after every tool call by the context monitor hook.

### Warning thresholds

| Level | Threshold | Behavior |
|-------|-----------|----------|
| Normal | < 50% | No warnings |
| **WARNING** | >= 50% | Warning injected every 5 tool calls: "Consider wrapping up" |
| **CRITICAL** | >= 65% | Warning on every tool call + auto-checkpoint saved to STATE.md |

At CRITICAL, the context checkpoint in STATE.md is updated with the session ID, tool count, and estimated usage so the next session can resume cleanly.

### Color coding

| Usage | Color | Meaning |
|-------|-------|---------|
| < 50% | Green | Plenty of context remaining |
| 50-64% | Yellow | Getting full — consider wrapping up current task |
| >= 65% | Red | Context is running low — finish current step and save state |

### Configuration

Context window size and thresholds are configurable in `CONSTITUTION.md` §9:

```markdown
**Context window (tokens):** 1000000
**Warning threshold:** 50
**Critical threshold:** 65
```

Common context window values:
- Claude Opus 4.6 (Claude Code / Anthropic API): `1000000`
- Claude Sonnet 4.6: `200000`
- Claude Haiku 4.5: `200000`
- Amazon Bedrock: check your deployment configuration

If you're on a consumption-based billing plan (Bedrock, API), set a smaller context window value to trigger earlier warnings — this saves money by encouraging shorter sessions with clean checkpoints.

> **Note:** These are estimates, not exact measurements. The actual context window may be more or less full depending on message sizes, system prompts, and compaction. Treat the warnings as a signal to save your progress, not as an exact countdown.

---

[← Previous: Safety Guardrails](09-safety-guardrails.md) | [Back to README](../../README.md) | [Next: Visual Companion →](11-visual-companion.md)
