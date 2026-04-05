# Phases in Detail

### Phase 0 -- Initialization (`/pdlc init`)

```mermaid
flowchart LR
    GIT[Git + GitHub\nsetup] --> QUESTIONS[Socratic\nquestions] --> MEMORY[Generate\nmemory files] --> ROADMAP[Roadmap\nideation] --> BEADS[bd init] --> START{Start\nfirst feature?}
    START -->|Yes| BRAINSTORM([to /pdlc brainstorm])
    START -->|No| IDLE([Idle])
    style BRAINSTORM fill:#1e3a5f,color:#fff
```

Run once per project. **Oracle** leads. PDLC checks prerequisites, then detects whether you're starting fresh or bringing in an existing codebase.

**Git & GitHub setup**: If no git repo exists, PDLC offers to initialize one with a `.gitignore` (node_modules, .claude, .env, etc.). Then verifies GitHub connectivity — if no remote is configured, walks you through creating a repo (GitHub.com or GitHub Enterprise) and authenticating with the `gh` CLI. This ensures `/pdlc ship` can create PRs without issues later.

**Greenfield** (empty repo): PDLC asks 7 Socratic questions and scaffolds memory files from your answers.

**Brownfield** (existing code): PDLC offers to deep-scan the repository, mapping structure, reading key files, analyzing tests and git history. Scan findings are presented for approval, then used to pre-populate memory files. All inferred content is marked `(inferred -- please verify)`.

**Roadmap Ideation**: Oracle brainstorms 5-15 candidate features, validates priority sequence for dependency conflicts, and captures the backlog in `ROADMAP.md` with permanent `F-NNN` IDs. Auto-launches the first priority feature on confirmation.

**PDLC scaffolds:** CONSTITUTION, INTENT, STATE, ROADMAP, DECISIONS, CHANGELOG, OVERVIEW, episodes/index, and `.beads/`.

### Phase 1 -- Inception (`/pdlc brainstorm <feature>`)

```mermaid
flowchart LR
    subgraph DISCOVER["Discover - Oracle"]
        DIV[Divergent\nIdeation] --> SOC[Socratic\n4 rounds] --> PROG["Progressive\nThinking"] --> ADV[Adversarial\nReview] --> EDGE[Edge Case\nAnalysis] --> SUM["Summary"]
    end
    subgraph DEFINE["Define - Oracle"]
        PRD["Generate PRD"]
    end
    subgraph DESIGN["Design - Neo"]
        BLOOM[Bloom Taxonomy\n6 rounds] --> DOCS["Architecture\nData Model\nAPI Contracts"]
    end
    subgraph PLAN_PHASE["Plan - Neo"]
        TASKS["Beads tasks\n+ dependencies"]
    end
    FROMINIT(["from /pdlc init"]) --> DISCOVER
    DISCOVER --> DEFINE --> DESIGN --> PLAN_PHASE
    PLAN_PHASE --> TOBUILD(["to /pdlc build"])

    style PROG fill:#5c2d91,color:#fff
    style TOBUILD fill:#1e3a5f,color:#fff
    style FROMINIT fill:#1e3a5f,color:#fff
```

Oracle leads Discover + Define, then hands off to Neo for Design + Plan. The feature's ROADMAP.md status is set to `In Progress` when brainstorm begins.

| Sub-phase | Lead | Key activities | Output |
|-----------|------|---------------|--------|
| **Discover** | Oracle | Divergent ideation (optional), Socratic interview (4 rounds), **Progressive Thinking** (required agent meeting), Adversarial review, Edge case analysis | Confirmed discovery summary |
| **Define** | Oracle | Auto-generate PRD from brainstorm log | `PRD_[feature]_[date].md` |
| **Design** | Neo | Bloom's Taxonomy questioning (6 rounds), Architecture + data model + API contracts | `docs/pdlc/design/[feature]/` |
| **Plan** | Neo | Beads tasks with dependencies, dependency graph | Plan file |

### Phase 2 -- Construction (`/pdlc build`)

```mermaid
flowchart TD
    FROMBRAINSTORM(["from /pdlc brainstorm"]) --> BRANCH[Create feature branch]
    BRANCH --> READY{Tasks ready?}
    READY -->|"2+ tasks"| WAVE["Wave Kickoff"] --> PICK
    READY -->|1 task| PICK[Claim task]
    PICK --> COMPLEX{Complex?}
    COMPLEX -->|Yes| ROUND["Design Roundtable"] --> TDD
    COMPLEX -->|No| TDD["TDD Loop"]
    TDD --> PASS{Tests pass?}
    PASS -->|"Fail 1-2"| TDD
    PASS -->|Fail 3| STRIKE["Strike Panel"] --> TDD
    PASS -->|Pass| DONE[bd done] --> READY
    READY -->|All done| REVIEW["Party Review"]
    REVIEW --> TEST[Test 6 layers]
    TEST --> EPISODE[Draft episode]
    EPISODE --> TOSHIP(["to /pdlc ship"])

    style WAVE fill:#5c2d91,color:#fff
    style ROUND fill:#5c2d91,color:#fff
    style STRIKE fill:#ff4444,color:#fff
    style REVIEW fill:#5c2d91,color:#fff
    style FROMBRAINSTORM fill:#1e3a5f,color:#fff
    style TOSHIP fill:#1e3a5f,color:#fff
```

**Neo** leads the entire phase.

| Sub-phase | Meetings | What happens |
|-----------|----------|-------------|
| **Build** | Wave Kickoff, Design Roundtable, Strike Panel | TDD per task. Wave standup for 2+ tasks. Optional roundtable for complex tasks. 3-strike cap. |
| **Review** | Party Review | Neo, Echo, Phantom, Jarvis in parallel with cross-talk. Critical findings gate. Deferred findings via Decision Review. |
| **Test** | -- | 6 layers. Constitution gates determine required. Human decides on failures. |

### Phase 3 -- Operation (`/pdlc ship`)

```mermaid
flowchart LR
    subgraph SHIP["Ship + Verify - Pulse"]
        MERGE[Merge to main\nCHANGELOG + semver] --> CICD[CI/CD] --> SMOKE["Smoke tests"]
    end
    subgraph REFLECT["Reflect - Jarvis"]
        RETRO[Retrospective\nEpisode + ROADMAP update]
    end
    subgraph NEXT["Next Feature - Oracle"]
        ROADMAP{Next on\nroadmap?}
    end
    FROMBUILD(["from /pdlc build"]) --> SHIP --> REFLECT --> NEXT
    ROADMAP -->|Continue| TOBRAINSTORM(["to /pdlc brainstorm"])
    ROADMAP -->|Pause| IDLE([Idle])
    ROADMAP -->|Switch| TOBRAINSTORM

    style FROMBUILD fill:#1e3a5f,color:#fff
    style TOBRAINSTORM fill:#1e3a5f,color:#fff
```

| Sub-phase | Lead | What happens |
|-----------|------|-------------|
| **Ship** | Pulse | Merge commit to main, CHANGELOG entry, semantic version tag, CI/CD trigger |
| **Verify** | Pulse | Smoke tests against deployed environment + human sign-off |
| **Reflect** | Jarvis | Per-agent retro, metrics, episode finalization, ROADMAP.md marked `Shipped` |
| **Next Feature** | Oracle | Reviews roadmap, presents next priority. **Continue**, **pause**, or **switch** |

### Pivoting with `/pdlc decision <text>`

Use `/pdlc decision` to **pivot** the design mid-flight -- change tech stack, rearchitect a component, alter scope, switch databases, or any other significant change. Available at any point during Inception, Construction, or Operation. The lead agent for the current phase runs the flow:

| Step | What happens |
|------|-------------|
| **Checkpoint** | Pauses current workflow, saves recovery state |
| **Classify** | Tag source (user vs PDLC flow), phase, sub-phase, agent |
| **Decision Review Party** | All 9 agents assess impacts on their owned artifacts |
| **MOM** | Minutes with assessments, cross-cutting concerns, risk consensus, roadmap resequencing proposal |
| **User approval** | Recommended changes table. Apply all, selectively, modify, or cancel |
| **Reconciliation** | Beads tasks, PRDs, design docs, episode drafts, test flags, roadmap all updated |
| **Resume** | Returns to the paused checkpoint with updated context |

Feature IDs (`F-NNN`) are permanent. Priority is a separate column -- resequencing never renumbers IDs or ADRs.

### Scenario planning with `/pdlc whatif <scenario>`

Use `/pdlc whatif` for **scenario planning** -- explore hypothetical changes without committing. The full team analyzes feasibility, effort, risks, and trade-offs in a read-only meeting. No files are modified.

| Outcome | What happens |
|---------|-------------|
| **Explore further** | Drill deeper into a specific aspect -- versioned MOM |
| **Accept as decision** | Converts to formal decision, reuses the What-If MOM (no duplicate meeting), runs decision workflow for reconciliation |
| **Discard** | Files the MOM for reference, resumes paused workflow |

Together, `/pdlc decision` and `/pdlc whatif` give you a full **pivot and scenario planning toolkit**: explore ideas safely with whatif, then commit to them with decision when ready.

---

← [Back to README](../../README.md)
