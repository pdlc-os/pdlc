# Party Mode

Party mode brings multiple agents together for structured discussions. Five meeting types fire at specific points in the workflow.

### Meeting types

| Meeting | Phase | Trigger | Participants | Output |
|---------|-------|---------|-------------|--------|
| **Progressive Thinking** | Inception / Discover | After Socratic discovery completes (required, cannot skip) | Atlas (facilitates) + all 8 other agents | Refined feature understanding: confirmed facts, inferences, consequences, risks, priorities |
| **Wave Kickoff** | Construction / Build | Start of a new Beads wave (2+ tasks) | Neo + domain agents + Echo (if 3+ tasks) | Wave execution plan, dependency updates |
| **Design Roundtable** | Construction / Build | Complex task claimed (auto-suggested) | Neo + Echo + domain agent | Implementation Decision for TDD |
| **Party Review** | Construction / Review | All tasks complete | Neo + Echo + Phantom + Jarvis (+ Muse when `ux-review.md` exists with Lite/Full triage from Step 10.6) | Unified review file with linked findings; *As-Built Audit* section appended to `ux-review.md` when Muse participates |
| **Strike Panel** | Construction / Build | 3rd failed auto-fix attempt | Neo + Echo + domain agent | 3 ranked approaches for human |
| **Decision Review** | Any phase | `/pdlc decide` or deferred findings | Full team † | MOM with impact assessment, roadmap resequencing, recommended changes |
| **What-If Analysis** | Any phase | `/pdlc whatif` | Full team † | Read-only MOM with feasibility, effort, risks, trade-offs, recommendation |
| **Post-Mortem** | Operation / Rollback | `/pdlc rollback` | Full team † (Atlas leads) | Root cause diagnosis, cross-examination, 3 ranked fix approaches |
| **Deployment Review** | Operation / Ship | User provides a custom deploy/CI/CD/build artifact | Full team † (Pulse leads) | Consolidated deploy plan: adopted from user, PDLC scaffolding, recommended modifications, Tier 1 blocks |
| **Sync Assessment** | Pre-flight (brainstorm, build, ship, hotfix, rollback) | Local main behind origin | Neo + Atlas + Bolt + Friday + Echo + Phantom (6 agents) | Remote diff analysis, conflict risk, pull/review/proceed recommendation |

<sub>† **Full team** = the 9 built-in agents plus any custom agents in `.pdlc/agents/` that are `always_on: true` or whose `auto_select_on_labels` match the current context.</sub>

### Meeting map across phases

```
Init ──────────────── (no meetings — Atlas works solo with user)

Brainstorm
  Discover ─────────── Progressive Thinking (required, agents-only)
  Define ───────────── (no meetings — Atlas generates PRD)
  Design ───────────── Threat Modeling Party at Step 10.5 (Phantom-led, only on Full triage)
  Design ───────────── Design-Laws Roundtable at Step 10.6 (Muse-led, only on Full triage)
  Plan ─────────────── (no meetings — Neo generates tasks)

Build
  Build Loop ───────── Wave Kickoff → [Design Roundtable] → Build → [Strike Panel] → ...
  Review ───────────── Party Review
  Test ─────────────── (no meetings)

Ship
  Ship ─────────────── Deployment Review (only if user provides a custom deploy artifact)
  Verify ───────────── (no meetings — Pulse runs smoke tests)
  Reflect ──────────── (no meetings — Jarvis writes retro)

Any phase ──────────── Decision Review (/pdlc decide)
Any phase ──────────── What-If Analysis (/pdlc whatif)
Post-ship ──────────── Post-Mortem (/pdlc rollback)

Pre-flight (brainstorm, build, ship, hotfix, rollback):
  ──────────────────── Sync Assessment (if local behind remote)
```

### Collaboration patterns

Each meeting follows a base pattern (Round 1 → optional Cross-talk → Conclusion) but customizes it:

| Meeting | Leader | Rounds | Cross-talk | How it works |
|---------|--------|--------|-----------|-------------|
| **Progressive Thinking** | Atlas | 6 (Concrete → Inferential → Consequential → Speculative → Conflicting → Strategic) | Built into Rounds 5-6 | Atlas questions agents, not the user. Conflict resolution built in. User escalation only when agents disagree and can't resolve. Cannot be skipped. |
| **Wave Kickoff** | Neo | 1 + optional dependency updates | Only if tasks conflict | Neo frames coordination question, domain agents identify hidden dependencies and shared-state conflicts. Max 4 agents. |
| **Design Roundtable** | Neo | 1 + up to 3 cross-talk (positions → reactions) | Always — agents react to each other | Neo frames the design question, agents propose approaches, then react to each other's proposals across up to 3 cross-talk rounds. Converges to single Implementation Decision. |
| **Party Review** | Neo | 1 + up to 3 cross-talk (independent review → cross-linking) | Always — interconnected findings routed between agents | All 4 always-on agents (Neo, Echo, Phantom, Jarvis) review the same diff with different mandates simultaneously. **Muse joins conditionally** when `docs/pdlc/design/[feature]/ux-review.md` exists with Lite/Full triage from Step 10.6 — her mandate is the as-built UX audit (Nielsen scorecard delta, 8-state coverage delta, anti-patterns introduced, new findings only visible in real code). Custom and label-matched agents also join. Up to 3 cross-talk rounds link related findings to shared root causes. As-built scorecard appends to `ux-review.md`; findings flow into the unified review file. P0 UX findings cannot be accepted-as-tradeoff — they block merge until fixed or `/pdlc override` invoked. |
| **Strike Panel** | Neo | 1 + up to 3 cross-talk (diagnosis → ranked approaches) | Yes — agents react to diagnoses | Focused on a specific test failure. Produces 3 ranked approaches for the human to choose from. |
| **Decision Review** | Phase lead | 1 + up to 3 cross-talk (individual assessment → team discussion) | Yes — cross-cutting concerns | Full team (9 built-in + matching custom agents) assess owned artifacts. Includes roadmap resequencing discussion. |
| **What-If Analysis** | Phase lead | 1 + up to 3 cross-talk (individual assessment → team discussion) | Yes — cross-cutting concerns | Same pattern as Decision Review but read-only — no files modified. |
| **Post-Mortem** | Atlas | 1 + up to 3 cross-examination + 1 fix proposals (root cause → cross-examination → fix proposals) | Yes — agents cross-examine each other's findings | Atlas facilitates. Each agent diagnoses from their domain. Cross-examination follows the canonical bounded loop (up to 3 rounds, exit on consensus). Produces 3 ranked fix approaches. Required — cannot be skipped. |
| **Deployment Review** | Pulse | 1 + up to 3 cross-talk + 1 consolidated plan (per-agent assessment → cross-talk → consolidated plan) | Yes — overlapping findings routed for single-fix resolution | Pulse leads. Runs only when user provides a custom deploy/CI/CD/build artifact. Critical security findings (hardcoded secrets, exposed credentials) become Tier 1 blocks. User preference wins on non-Tier-1 conflicts. |
| **Threat Modeling** | **Phantom** | 3 (Surface → Prioritize → Mitigate) + up to 3 cross-talk per layer | Yes — chained threats only surface across agents | Phantom leads with explicit Neo→Phantom and Phantom→Neo handoffs at the boundaries. Runs at Brainstorm Design Step 10.5 only when triage produces 2+/3 yeses (Full); a 1/3 triage runs Lite mode (Phantom solo, no party); 0/3 skips with a one-line audit-trail record. STRIDE per trust boundary; DREAD-flavored severity; 4 mitigation buckets (mitigate now / later / accept / transfer). Output is `threat-model.md` reviewed at the Step 12 design approval gate alongside the other three design docs. See [`20-security.md`](20-security.md). |
| **Design-Laws Roundtable** | **Muse** | 5 sub-procedures (Setup → Heuristic Scoring → Operational Checks → Anti-Pattern Scan → Cross-talk + Approval) + up to 3 cross-talk in the final sub-procedure | Yes — chained UX findings only surface when one agent's lens triggers another's | Muse leads with explicit Neo→Muse and Muse→Neo handoffs at the boundaries. Runs at Brainstorm Design Step 10.6 only when triage produces 2+/3 yeses (Full); a 1/3 triage (UI surface but no new flow) runs Lite mode (Muse solo, anti-pattern + UX-writing + 8-state spot-check); 0/3 skips with a one-line audit-trail record. Nielsen 10 heuristics scorecard (0–40), 8-state coverage matrix, cognitive-load 8-item assessment, anti-pattern refuse list; severity tags P0/P1/P2/P3 (P0 blocks ship). Output is `ux-review.md` reviewed at the Step 12 design approval gate alongside the other four design docs. Catalog content from `agents/extensions/muse-ux-design.md`. |
| **Sync Assessment** | Phase lead | 1 (parallel assessment of remote diff) | Only if conflict risk is Medium/High | 6 agents assess remote changes from their domain. Lightweight (~1-2 min). Only fires when local is behind remote. |

**Cross-talk cap:** Up to 3 cross-talk rounds per meeting, with early exit on consensus (except Progressive Thinking, which has conflict resolution built into its structure). Most disagreements resolve in 1–2 rounds; rounds 2 and 3 only run when agents are still moving toward consensus. If positions stay locked between rounds, cross-talk stops early.

**Pitch Round + Vote (when cross-talk fails):** if cross-talk terminates without consensus (3 rounds exhausted or early-exited on locked positions), the meeting runs a second bounded resolution attempt before any human escalation:

1. **Pitch Round** — each disagreeing agent delivers a 1–3 paragraph closing argument addressing the strongest counterargument from cross-talk and explaining why their position should win on the merits. Only parties to the disagreement pitch.
2. **Vote** — all meeting participants vote on the pitched positions; abstention is valid when the disagreement is outside the agent's domain. The lead votes too, unless they are themselves a party to the dispute (in which case they recuse from voting AND from the threshold-based authority described next).
3. **Threshold determines lead's authority:**
   - **Supermajority** (≥66.7% on one position) — lead **must** follow the supermajority; cannot override on their own. Escalating to human is the only escape.
   - **Simple majority** (>50% but <66.7%) — lead **strongly considers** but may override; override requires an explicit rationale in the MOM.
   - **No majority** (no position >50%) — lead's discretionary call, citing the strongest pitch.
4. **MOM records each pitch verbatim, each agent's vote (or abstention), the threshold reached, and the lead's decision** with rationale. Every override-with-rationale becomes a durable receipt.

If pitch+vote still doesn't yield a workable resolution (or the lead recused and escalated), the disagreement surfaces in the MOM as an open question for the human, with the vote tally attached as input data. **Pitch+vote does not apply to Tier 1 hard blocks** — security/safety blocks cannot be voted out. It also does not apply in a binding way to the Threat Modeling Party at Step 10.5 or the Design-Laws Roundtable at Step 10.6 (the human owns final acceptance at the Step 12 design approval gate by design; pitch+vote informs the *party recommendation* the human reviews). P0 UX findings from Step 10.6 are non-negotiable on the same basis as Tier 1 hard blocks — they cannot be voted out and must be resolved before ship or via `/pdlc override`.

See `skills/build/party/spawn-and-mom.md` → "Cross-talk Rounds" and "Pitch Round + Vote" for the full rules.

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
