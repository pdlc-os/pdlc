# Party Mode

Party mode brings multiple agents together for structured discussions. Five meeting types fire at specific points in the workflow.

### Meeting types

| Meeting | Phase | Trigger | Participants | Output |
|---------|-------|---------|-------------|--------|
| **Progressive Thinking** | Inception / Discover | After Socratic discovery completes (required, cannot skip) | Oracle (facilitates) + all 8 other agents | Refined feature understanding: confirmed facts, inferences, consequences, risks, priorities |
| **Wave Kickoff** | Construction / Build | Start of a new Beads wave (2+ tasks) | Neo + domain agents + Echo (if 3+ tasks) | Wave execution plan, dependency updates |
| **Design Roundtable** | Construction / Build | Complex task claimed (auto-suggested) | Neo + Echo + domain agent | Implementation Decision for TDD |
| **Party Review** | Construction / Review | All tasks complete | Neo + Echo + Phantom + Jarvis | Unified review file with linked findings |
| **Strike Panel** | Construction / Build | 3rd failed auto-fix attempt | Neo + Echo + domain agent | 3 ranked approaches for human |
| **Decision Review** | Any phase | `/pdlc decision` or deferred findings | All 9 agents | MOM with impact assessment, roadmap resequencing, recommended changes |
| **What-If Analysis** | Any phase | `/pdlc whatif` | All 9 agents | Read-only MOM with feasibility, effort, risks, trade-offs, recommendation |
| **Post-Mortem** | Operation / Rollback | `/pdlc rollback` | All 9 agents (Oracle leads) | Root cause diagnosis, cross-examination, 3 ranked fix approaches |
| **Sync Assessment** | Pre-flight (brainstorm, build, ship, hotfix, rollback) | Local main behind origin | Neo + Oracle + Bolt + Friday + Echo + Phantom (6 agents) | Remote diff analysis, conflict risk, pull/review/proceed recommendation |

### Meeting map across phases

```
Init ──────────────── (no meetings — Oracle works solo with user)

Brainstorm
  Discover ─────────── Progressive Thinking (required, agents-only)
  Define ───────────── (no meetings — Oracle generates PRD)
  Design ───────────── (no meetings — Neo questions user via Bloom's Taxonomy, then generates docs)
  Plan ─────────────── (no meetings — Neo generates tasks)

Build
  Build Loop ───────── Wave Kickoff → [Design Roundtable] → Build → [Strike Panel] → ...
  Review ───────────── Party Review
  Test ─────────────── (no meetings)

Ship
  Ship ─────────────── (no meetings — Pulse handles merge/deploy)
  Verify ───────────── (no meetings — Pulse runs smoke tests)
  Reflect ──────────── (no meetings — Jarvis writes retro)

Any phase ──────────── Decision Review (/pdlc decision)
Any phase ──────────── What-If Analysis (/pdlc whatif)
Post-ship ──────────── Post-Mortem (/pdlc rollback)

Pre-flight (brainstorm, build, ship, hotfix, rollback):
  ──────────────────── Sync Assessment (if local behind remote)
```

### Collaboration patterns

Each meeting follows a base pattern (Round 1 → optional Cross-talk → Conclusion) but customizes it:

| Meeting | Leader | Rounds | Cross-talk | How it works |
|---------|--------|--------|-----------|-------------|
| **Progressive Thinking** | Oracle | 6 (Concrete → Inferential → Consequential → Speculative → Conflicting → Strategic) | Built into Rounds 5-6 | Oracle questions agents, not the user. Conflict resolution built in. User escalation only when agents disagree and can't resolve. Cannot be skipped. |
| **Wave Kickoff** | Neo | 1 + optional dependency updates | Only if tasks conflict | Neo frames coordination question, domain agents identify hidden dependencies and shared-state conflicts. Max 4 agents. |
| **Design Roundtable** | Neo | 2 (positions → reactions) | Always — agents react to each other | Neo frames the design question, agents propose approaches, then react to each other's proposals. Converges to single Implementation Decision. |
| **Party Review** | Neo | 2 (independent review → cross-linking) | Always — interconnected findings routed between agents | All 4 agents review the same diff with different mandates simultaneously. Cross-talk links related findings to shared root causes. |
| **Strike Panel** | Neo | 2 (diagnosis → ranked approaches) | Yes — agents react to diagnoses | Focused on a specific test failure. Produces 3 ranked approaches for the human to choose from. |
| **Decision Review** | Phase lead | 2 (individual assessment → team discussion) | Yes — cross-cutting concerns | All 9 agents assess owned artifacts. Includes roadmap resequencing discussion. |
| **What-If Analysis** | Phase lead | 2 (individual assessment → team discussion) | Yes — cross-cutting concerns | Same pattern as Decision Review but read-only — no files modified. |
| **Post-Mortem** | Oracle | 3 (root cause → cross-examination → fix proposals) | Yes — agents cross-examine each other's findings | Oracle facilitates. Each agent diagnoses from their domain. Produces 3 ranked fix approaches. Required — cannot be skipped. |
| **Sync Assessment** | Phase lead | 1 (parallel assessment of remote diff) | Only if conflict risk is Medium/High | 6 agents assess remote changes from their domain. Lightweight (~1-2 min). Only fires when local is behind remote. |

**Cross-talk cap:** Maximum 1 cross-talk round per meeting (except Progressive Thinking which has conflict resolution built into its structure). If disagreement persists, it's surfaced in the MOM as an open question for the human.

**Tool access by mode:**
- **Agent Teams** (default): Agents can use tools (Read, Grep, Bash) to verify claims — e.g., read source code, check test files
- **Subagents**: Agents respond with perspective only, no tool access
- **Solo**: Single LLM, no tool access

### Spawn modes

Default is Agent Teams. If Agent Teams is not enabled in Claude Code settings, PDLC falls back to Subagent mode and informs the user. The mode is checked during init (Step 1c-ii) and again at runtime before each meeting.

| Mode | How it works | Best for |
|------|-------------|----------|
| **Agent Teams** (default) | Each agent has its own context window. Agents talk to each other directly and the user can interact with any agent. Agents can use tools. | Complex multi-perspective discussions, highest fidelity |
| **Subagents** (fallback) | Primary agent spawns sub-agents via Agent tool. Sub-agents report back to primary only — they cannot talk to each other. No tool access. | Faster execution, or when Agent Teams is not enabled |
| **Solo** | Single LLM roleplays all agents in one response | Fast iteration, fallback when spawning fails |

All meetings produce MOM (minutes of meeting) files at `docs/pdlc/mom/`.

### Meeting announcements

Before every meeting, PDLC tells you what's happening: which agents are participating, what they're discussing, and roughly how long it will take (~30s for a standup, ~2–4 min for a full Decision Review). If the meeting runs long, you'll see a progress update about what the team is debating.

### Durable checkpoints

Every party meeting writes a `.pending-party.json` checkpoint file before spawning agents. Progress is tracked at milestones (`started` → `round-1-complete` → `cross-talk-complete` → `mom-written` → `presented`). If a session is interrupted (network, usage limits, accidental exit), the next session detects the pending meeting and offers to resume from the last milestone or restart. The checkpoint file is deleted when the meeting completes normally.


---

[← Previous: The Agent Team](09-agent-team.md) | [Back to README](../../README.md) | [Next: Deadlock Detection →](11-deadlock-detection.md)
