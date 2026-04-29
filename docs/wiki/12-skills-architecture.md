# Skills Architecture

PDLC is built entirely from skills — markdown files that Claude reads and executes. Large skills are split into sub-files for context window efficiency.

### Phase skills (user-invocable)

| Skill | Command | What it does |
|-------|---------|-------------|
| **Init** | `/pdlc init` | Initialize PDLC for this project (run once) |
| **Brainstorm** | `/pdlc brainstorm <feature>` | Run Inception: Discover -> Define -> Design -> Plan |
| **Build** | `/pdlc build` | Run Construction: Build (TDD) -> Review -> Test |
| **Ship** | `/pdlc ship` | Run Operation: Ship -> Verify -> Reflect -> Next Feature |
| **Decision** | `/pdlc decide <text>` | Record a decision with full team impact assessment (any phase) |
| **What-If** | `/pdlc whatif <scenario>` | Read-only team analysis of a hypothetical scenario (any phase) |

### Supporting skills (referenced internally)

| Skill | What it governs |
|-------|-----------------|
| **TDD** | Red -> Green -> Refactor cycle; test-first enforcement; 3-attempt auto-fix cap |
| **Review** | Multi-agent review protocol; reviewer responsibilities; finding severity levels |
| **Test** | Six test layer execution order; Constitution gate checking |
| **Reflect** | Retro format; per-agent contributions; shipping streaks; metrics |
| **Decision** | Decision Review Party; 9-agent impact assessment; MOM generation; phase-aware reconciliation |
| **What-If** | Read-only scenario exploration; team analysis meeting; option to convert to formal decision |
| **Safety Guardrails** | Tier 1/2/3 definitions; double-RED override protocol |
| **Repo Scan** | Brownfield deep-scan; pre-populates memory files from existing codebase |
| **Visual Companion** | Browser-based mockup and diagram loop during Inception |
| **Writing Clearly** | Strunk's *Elements of Style* rules applied to all prose for human review |

### File structure

```
skills/
  init/
    SKILL.md                          <- orchestrator
    steps/
      01-setup.md                     <- brownfield detection + directories
      02-socratic-init.md             <- 7 Socratic questions
      03-generate-memory.md           <- create all memory files
      04-roadmap.md                   <- feature ideation + prioritization
      05-finalize.md                  <- Beads init + summary

  brainstorm/
    SKILL.md                          <- orchestrator
    visual-companion.md               <- browser server protocol
    steps/
      00-divergent-ideation.md        <- optional: 100+ ideas
      01-discover.md                  <- orchestrator for discovery
        discover/
          01-socratic-discovery.md    <- 3-round interview, max 4 q/round
          02-adversarial-review.md    <- 10+ findings, top 3 follow-ups
          03-edge-case-analysis.md    <- 9-category path tracing, max 3 user prompts
          04-synthesis.md             <- external context + summary
          05-blooms-taxonomy-design.md <- 3-round design questioning (Neo), max 3 q/round + synthesis
          06-progressive-thinking.md  <- agent team meeting (Oracle facilitates)
          07-ux-discovery.md          <- Muse leads, max 3 visual-first questions (conditional on UI/UX + visual companion)
      02-define.md                    <- PRD generation + approval
      03-design.md                    <- architecture, data model, API contracts (+ Step 10.5 threat-modeling handoff)
      threat-model.md                 <- Step 10.5 helper: Phantom-led threat-modeling party (triage + STRIDE + handoffs)
      04-plan.md                      <- Beads tasks + dependencies

  build/
    SKILL.md                          <- orchestrator
    steps/
      01-pre-flight.md                <- load state, create branch
      02-build-loop.md                <- Steps 4-11: the core TDD loop
      03-review.md                    <- party review + approval gate
      04-test.md                      <- 6 test layers + constitution gates
      05-wrap-up.md                   <- episode draft + completion
    party/
      orchestrator.md                 <- shared spawn protocol + MOM format
      01-wave-kickoff.md              <- standup for multi-task waves
      02-design-roundtable.md         <- optional pre-build design debate
      03-party-review.md              <- parallel review with cross-talk
      04-strike-panel.md              <- 3rd-failure root cause diagnosis
      deadlock-protocol.md            <- 6 deadlock types + resolution

  ship/
    SKILL.md                          <- orchestrator
    steps/
      01-ship.md                      <- merge, changelog, semver, Step 9.0 lint, CI/CD
      02-verify.md                    <- smoke tests + sign-off
      03-reflect.md                   <- retro + episode + roadmap + next feature
      custom-deploy-review.md         <- Step 9.2 helper: Deployment Review Party (when user provides custom artifact)
      fix-lint.md                     <- Step 9.0 helper: Pulse's first action — auto-detect tech stack, apply lint/format fixes

  decision/
    SKILL.md                          <- decision review party + reconciliation

  whatif/
    SKILL.md                          <- read-only scenario analysis

  doctor/
    SKILL.md                          <- comprehensive health check (8 checks)

  abandon/
    SKILL.md                          <- drop in-progress feature + cleanup

  rollback/
    SKILL.md                          <- revert shipped feature + post-mortem

  hotfix/
    SKILL.md                          <- emergency compressed build-ship + auto-resume

  pause/
    SKILL.md                          <- save current feature state for later

  resume/
    SKILL.md                          <- restore paused feature + rebase + reclaim task

  override-tier1/
    SKILL.md                          <- double-RED confirmation for Tier 1 overrides

  custom-template/
    SKILL.md                          <- template for creating custom skills

  sync-check.md                        <- remote sync check protocol (pre-flight)
  state-reconciliation.md             <- conflict resolution between state files

templates/                              <- versioned templates for memory files
  CONSTITUTION.md                     <- stamped with pdlc-template-version
  INTENT.md
  STATE.md
  OVERVIEW.md
  METRICS.md
  PRD.md
  review.md
  episode.md
  threat-model.md                     <- Step 10.5 deliverable template

agents/
  oracle.md, neo.md, bolt.md, ...     <- 9 built-in agent personas
  extensions/                         <- agent-wide extensions (load on every invocation)
    phantom-security-audit.md         <- example: extends Phantom with stack-aware security catalog
  custom-template/
    agent.md                          <- template for user-authored custom agents

  formatting.md                       <- ANSI color scheme + visual patterns
```

### Two extension layers

PDLC distinguishes two kinds of extensions, by what loads them:

- **Agent-wide extensions** at `agents/extensions/<agent>-<topic>.md` — the agent's persona file directs the read; fires on every invocation of that agent.
- **Phase / step-specific extensions** alongside the owning step file (e.g. `skills/ship/steps/fix-lint.md`, `skills/brainstorm/steps/threat-model.md`, `skills/ship/steps/custom-deploy-review.md`) — the step file references the helper; fires only when that step runs.

See [`21-agent-extensions.md`](21-agent-extensions.md) for the authoring conventions.


---

[← Previous: Deadlock Detection](11-deadlock-detection.md) | [Back to README](../../README.md) | [Next: Memory Bank →](13-memory-bank.md)
