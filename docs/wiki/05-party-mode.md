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
```

### Spawn modes

Set once at the first Wave Kickoff, applies for the session:

| Mode | How it works | Best for |
|------|-------------|----------|
| **Agent Teams** | Main Claude embodies Neo; others are real subagents spawned in parallel | Complex tasks with multiple concerns |
| **Subagents** | All agents including Neo spawned independently; main Claude is pure orchestrator | Zero-bias multi-perspective review |
| **Solo** | Single LLM roleplays all agents in one response | Fast iteration, fallback when spawning fails |

All meetings produce MOM (minutes of meeting) files at `docs/pdlc/mom/`.

### Meeting announcements

Before every meeting, PDLC tells you what's happening: which agents are participating, what they're discussing, and roughly how long it will take (~30s for a standup, ~2–4 min for a full Decision Review). If the meeting runs long, you'll see a progress update about what the team is debating.

### Durable checkpoints

Every party meeting writes a `.pending-party.json` checkpoint file before spawning agents. Progress is tracked at milestones (`started` → `round-1-complete` → `cross-talk-complete` → `mom-written` → `presented`). If a session is interrupted (network, usage limits, accidental exit), the next session detects the pending meeting and offers to resume from the last milestone or restart. The checkpoint file is deleted when the meeting completes normally.

---

← [Back to README](../../README.md)
