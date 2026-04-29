# Deadlock Detection

When multiple agents or tasks work in parallel, they can get stuck. PDLC detects 6 types of deadlock and resolves them automatically or escalates to the human.

| Type | Detection | Auto-resolve | Escalate to human |
|------|-----------|-------------|-------------------|
| **Beads Circular Dependency** | `bd ready` empty but open tasks remain | Remove most-recently-added dep | Multiple overlapping cycles |
| **Agent Spawn Failure** | Agent returns empty/error | Continue without failed agent; solo fallback | All agents fail |
| **Consensus Failure** | Agents contradict after cross-talk | **Pitch Round + Vote** (bounded second attempt — each disagreeing agent delivers a closing argument, all participants vote; lead's authority is threshold-gated: supermajority binds the lead, simple majority strongly considers with override rationale, no majority is lead's discretion) | When pitch+vote can't converge OR lead is a party to the dispute and recused — vote tally is passed as input data |
| **Fix-Regenerate Loop** | 3 fix cycles without resolving Critical findings | N/A | Human chooses: continue, override, or abandon |
| **Strike Panel Cycling** | Same test fails through 2+ panels | Pass history to prevent re-proposals | 3rd panel: redesign, skip, or human control |
| **BUILD LOOP Stagnation** | Same task list returned repeatedly | Reconcile `bd done` state | Loop count exceeds total tasks |


---

[← Previous: Party Mode](10-party-mode.md) | [Back to README](../../README.md) | [Next: Skills Architecture →](12-skills-architecture.md)
