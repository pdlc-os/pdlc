# PDLC — Product Development Lifecycle

A Claude Code plugin that guides small startup-style teams (2–5 engineers) through the full arc of feature development — from raw idea to shipped, production feature — using structured phases, a named specialist agent team, persistent memory, and safety guardrails.

PDLC combines the best of three Claude Code workflows:
- **[obra/superpowers](https://github.com/obra/superpowers)** — TDD discipline, systematic debugging, visual brainstorming companion
- **[gstack](https://github.com/garrytan/gstack)** — specialist agent roles, sprint workflow, real browser automation
- **[get-shit-done-cc](https://github.com/gsd-build/get-shit-done)** — context-rot prevention, spec-driven execution, file-based persistent memory

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [The PDLC Flow](#the-pdlc-flow)
4. [Phases in Detail](#phases-in-detail)
5. [The Team](#the-team)
6. [Skills](#skills)
7. [Memory Bank](#memory-bank)
8. [Safety Guardrails](#safety-guardrails)
9. [Status Bar](#status-bar)
10. [Visual Companion](#visual-companion)
11. [pdlc-os Marketplace](#pdlc-os-marketplace)
12. [Requirements](#requirements)
13. [License](#license)

---

## Installation

### Option A — npx (no global install)

```bash
npx @pdlc-os/pdlc install
```

### Option B — global npm install

```bash
npm install -g @pdlc-os/pdlc
pdlc install
```

### Option C — directly from GitHub (always latest)

```bash
npm install -g pdlc-os/pdlc
pdlc install
```

Pin to a specific release tag:

```bash
npm install -g pdlc-os/pdlc#v0.1.0
pdlc install
```

### Option D — clone and install

```bash
git clone https://github.com/pdlc-os/pdlc.git
cd pdlc
node bin/pdlc.js install
```

All options register PDLC's hooks and status bar in `~/.claude/settings.json`. Start a new Claude Code session to activate.

### Verify installation

```bash
npx @pdlc-os/pdlc status
```

### Uninstall

```bash
npx @pdlc-os/pdlc uninstall
```

### Keep up to date

```bash
# From npm
npx @pdlc-os/pdlc@latest install

# From GitHub (latest main)
npm install -g pdlc-os/pdlc && pdlc install
```

Re-running `install` is idempotent — it strips old hook paths and re-registers with the current version.

### Prerequisites

| Dependency | Install |
|-----------|---------|
| Node.js ≥ 18 | [nodejs.org](https://nodejs.org) |
| Claude Code | [claude.ai/code](https://claude.ai/code) |
| [Beads (bd)](https://github.com/gastownhall/beads) | `npm install -g @beads/bd` or `brew install beads` |
| Git | Built into macOS/Linux |

---

## Quick Start

Once installed, open any project in Claude Code:

```
/init
```

PDLC will ask you 7 questions about your project (tech stack, constraints, test gates) and scaffold the full memory bank. Then start your first feature:

```
/brainstorm user-authentication
```

Work through Inception (discovery → PRD → design → plan), then:

```
/build
```

Build, review, and test the feature. When ready:

```
/ship
```

Merge, deploy, reflect, and commit the episode record.

---

## The PDLC Flow

```mermaid
flowchart TD
    START([Session Start]) --> RESUME{STATE.md exists?}
    RESUME -->|No| INIT
    RESUME -->|Yes| AUTOLOAD[Auto-resume from last checkpoint]
    AUTOLOAD --> PHASE_CHECK{Current phase?}
    PHASE_CHECK -->|Inception| INCEPTION
    PHASE_CHECK -->|Construction| CONSTRUCTION
    PHASE_CHECK -->|Operation| OPERATION

    %% ── PHASE 0: INIT ──────────────────────────────────────────────
    INIT["/init"] --> PREREQ[Check prereqs\nbd + git]
    PREREQ --> FIELD{Existing code?}
    FIELD -->|Brownfield| SCAN[Offer repo scan\nskills/repo-scan]
    SCAN -->|Accepted| SCANRUN[Deep-scan codebase\nPresent findings for approval]
    SCANRUN --> MEM
    SCAN -->|Declined| SOC
    FIELD -->|Greenfield| SOC[7 Socratic questions\nor type skip to proceed early]
    SOC --> MEM[Generate memory files\nCONSTITUTION · INTENT · STATE\nROADMAP · DECISIONS · CHANGELOG · OVERVIEW]
    MEM --> BDI[bd init → .beads/]
    BDI --> INITPROMPT{Start brainstorming now?}
    INITPROMPT -->|Yes| INCEPTION
    INITPROMPT -->|No| IDLE1([Idle — run /brainstorm])

    %% ── PHASE 1: INCEPTION ─────────────────────────────────────────
    INCEPTION["/brainstorm feature-name"] --> PREF[Load CONSTITUTION.md + INTENT.md]
    PREF --> SCOPE{Scope check}
    SCOPE -->|Too large — multiple subsystems| DECOMP[Decompose into sub-projects\nRun first sub-project through full cycle\nRemaining sub-projects queued for future sessions]
    DECOMP --> SCOPE
    SCOPE -->|Single scoped feature| VCOFF{Visual content likely?}
    VCOFF -->|Yes — standalone offer| VCASK{User accepts\nvisual companion?}
    VCASK -->|Yes| VCSTART[Start local server\nCapture screen_dir + state_dir]
    VCASK -->|No| D_LOOP
    VCOFF -->|No| D_LOOP
    VCSTART --> D_LOOP

    D_LOOP[DISCOVER\nSocratic Q&A — one question at a time\nPer-question: browser if visual · terminal if text\nExternal context: web · Figma · Notion · docs\nType skip to proceed with collected answers] --> DSUM[Present discovery summary]
    DSUM --> DCONF{Human confirms\nsummary?}
    DCONF -->|Adjust| DSUM
    DCONF -->|Confirmed| PRD[DEFINE\nAuto-generate PRD\nBDD user stories · AC · NFRs\nskills/writing-clearly-and-concisely]
    PRD --> PRDGATE{Approve PRD?}
    PRDGATE -->|Revise| PRD
    PRDGATE -->|Approved| DESIGN[DESIGN\nARCHITECTURE.md · data-model.md · api-contracts.md\nMermaid diagrams · linked from PRD\nskills/writing-clearly-and-concisely]
    DESIGN --> DGATE{Approve design?}
    DGATE -->|Revise| DESIGN
    DGATE -->|Approved| PLAN[PLAN\nBreak into Beads tasks\nSet dependencies · Generate tree\nDependency graph → visual companion if running]
    PLAN --> PGATE{Approve plan?}
    PGATE -->|Revise| PLAN
    PGATE -->|Approved| VCSTOP[Stop visual server\nUpdate STATE.md]
    VCSTOP --> INCPROMPT{Start building now?}
    INCPROMPT -->|Yes| CONSTRUCTION
    INCPROMPT -->|No| IDLE2([Idle — run /build])

    %% ── PHASE 2: CONSTRUCTION ──────────────────────────────────────
    CONSTRUCTION["/build"] --> BPRE[Load STATE.md + CONSTITUTION.md\nCreate or checkout feature branch]
    BPRE --> READY{bd ready\nreturns tasks?}
    READY -->|No — queue empty| REVIEW
    READY -->|Yes| PICK[Select highest-priority\nunblocked task\nbackend → frontend → devops]
    PICK --> CLAIM[bd update --claim · Update STATE.md]
    CLAIM --> MODE{Execution mode?}
    MODE -->|A — Agent Teams| TEAM[Neo · Echo · Phantom · Jarvis\n+ Bolt · Friday · Muse · Oracle · Pulse\nbased on task labels]
    MODE -->|B — Sub-Agent| SOLO[Single focused agent]
    TEAM & SOLO --> TDD[TDD per acceptance criterion\nRed — write failing test\nGreen — minimal implementation\nRefactor — clean up]
    TDD --> TPASS{Tests pass?}
    TPASS -->|Fail — attempt 1 or 2| TDD
    TPASS -->|Fail — attempt 3| STRIKE{3-strike:\nhuman decision}
    STRIKE -->|A — auto approach 1\nB — auto approach 2| TDD
    STRIKE -->|C — take the wheel| GUIDE[Human suggests\ncourse of action]
    GUIDE --> TDD
    TPASS -->|All pass + no regressions| TASKDONE[bd done · Commit to feature branch\nUpdate STATE.md]
    TASKDONE --> READY

    REVIEW[REVIEW — skills/review/SKILL.md\nNeo · Echo · Phantom · Jarvis] --> RFILE[Generate REVIEW_feature_date.md\nArchitecture · Security · Coverage · Docs]
    RFILE --> RGATE{Human decision?}
    RGATE -->|Fix| REVIEW
    RGATE -->|Accept warnings| RLOG[Log Tier 3 events\nDeferred items → DECISIONS.md]
    RGATE -->|Approve| RLOG
    RLOG --> TEST[TEST — skills/test/SKILL.md\nUnit → Integration → E2E real Chromium\n→ Performance → Accessibility → Visual Regression]
    TEST --> TGATE{Constitution\ngates pass?}
    TGATE -->|Failure| TFAIL{Human decision}
    TFAIL -->|A — Fix| TEST
    TFAIL -->|B — Accept| TACC[Log Tier 3 warning]
    TFAIL -->|C — Defer| TDEF[Append to tech debt]
    TACC & TDEF --> TGATE
    TGATE -->|Pass| EPIDRAFT[Draft episode file\nWhat built · Links · Decisions\nFiles · Test results · Tech debt]
    EPIDRAFT --> BUILDPROMPT{Ship now?}
    BUILDPROMPT -->|Yes| OPERATION
    BUILDPROMPT -->|No| IDLE3([Idle — run /ship])

    %% ── PHASE 3: OPERATION ─────────────────────────────────────────
    OPERATION["/ship"] --> SGATES[Verify Constitution test gates\nvs episode file Test Summary]
    SGATES --> SGATE{Confirm merge\nto main?}
    SGATE -->|No| SBLOCK([Blocked — resolve before re-running /ship])
    SGATE -->|Yes| MERGE[git merge --no-ff\nfeature branch → main]
    MERGE --> CHLOG[Jarvis: CHANGELOG entry\nDetermine semver — patch · minor · major]
    CHLOG --> TAG[git tag vX.Y.Z · push main + tag]
    TAG --> CICD[Trigger CI/CD\nPulse: npm deploy · make deploy · gh workflow · manual]
    CICD --> SMOKE[VERIFY\nHTTP health checks · Primary user journey\nAuth flow if applicable]
    SMOKE --> VGATE{Human sign-off?}
    VGATE -->|Issues found| DIAG[Diagnose with human]
    DIAG --> SMOKE
    VGATE -->|Approved| RETRO[REFLECT — skills/reflect/SKILL.md\nPer-agent contributions · Metrics snapshot\nWhat went well · What broke · Improvements]
    RETRO --> EUPDATE[Update episode file\nAppend Reflect notes · Set Status → Approved]
    EUPDATE --> EGATE{Approve episode?}
    EGATE -->|Changes| EUPDATE
    EGATE -->|Approved| COMMIT[Commit episode\nUpdate OVERVIEW.md · episodes/index.md\nUpdate STATE.md → Idle]
    COMMIT --> DONE([Feature delivered\nRun /brainstorm for next feature])

    %% ── STYLE ──────────────────────────────────────────────────────
    style STRIKE fill:#ff4444,color:#fff
    style SBLOCK fill:#ff4444,color:#fff
    style SGATE fill:#f0a500,color:#fff
    style PRDGATE fill:#f0a500,color:#fff
    style DGATE fill:#f0a500,color:#fff
    style PGATE fill:#f0a500,color:#fff
    style RGATE fill:#f0a500,color:#fff
    style VGATE fill:#f0a500,color:#fff
    style EGATE fill:#f0a500,color:#fff
```

### Approval gates

PDLC stops and waits for explicit human approval at eight checkpoints:

| Gate | When |
|------|------|
| Discover output | Before PRD is drafted |
| PRD | Before Design begins |
| Design docs | Before Beads planning begins |
| Beads task list | Before Construction begins |
| Review file | Before PR comments are posted |
| Merge & deploy | Before merging to main |
| Smoke tests | Before Reflect begins |
| Episode file | Before it is committed |

### 3-strike loop breaker

When Claude enters a bug-fix loop during Construction, PDLC caps automatic retries at **3 attempts**. On the third failure it pauses and asks:

- **(A) Continue automatically** — Claude tries a fresh approach
- **(B) Human takes the wheel** — human reviews the error and suggests a course of action

---

## Phases in Detail

### Phase 0 — Initialization (`/init`)

Run once per project. PDLC detects whether you're starting fresh or bringing in an existing codebase.

**Greenfield project** (empty or new repo): PDLC asks 7 Socratic questions and scaffolds memory files from your answers.

**Brownfield project** (existing code detected): PDLC offers to deep-scan the repository first. If you accept, it:

1. Maps the directory structure and reads key manifest files (`package.json`, `Gemfile`, `go.mod`, etc.)
2. Reads entry points, routers, models, and core source files to identify existing features and architecture
3. Reads existing tests to assess coverage
4. Reads git history to infer key decisions and recent activity
5. Presents a structured findings summary for your review and approval
6. Generates fully pre-populated memory files from the verified findings — existing features in `OVERVIEW.md`, inferred architecture decisions in `DECISIONS.md`, a pre-PDLC baseline in `CHANGELOG.md`, and observed constraints in `CONSTITUTION.md`

All inferred content is clearly marked `(inferred — please verify)` so the team can review before trusting it.

**Either way, PDLC scaffolds:**

- `docs/pdlc/memory/CONSTITUTION.md` — your project's rules, standards, and test gates
- `docs/pdlc/memory/INTENT.md` — problem statement, target user, value proposition
- `docs/pdlc/memory/STATE.md` — live phase/task state, updated continuously
- `docs/pdlc/memory/ROADMAP.md`, `DECISIONS.md`, `CHANGELOG.md`, `OVERVIEW.md`
- `docs/pdlc/memory/episodes/index.md` — searchable episode history
- `.beads/` — Beads task database (via `bd init`)

### Phase 1 — Inception (`/brainstorm <feature>`)

Four sub-phases, each with a human approval gate:

At any point during Socratic questioning, type **`skip`** to stop questions and proceed immediately with the information collected so far.

| Sub-phase | Output |
|-----------|--------|
| **Discover** | Socratic Q&A + external context (web, Figma, Notion, OneDrive) + optional visual companion |
| **Define** | `docs/pdlc/prds/PRD_[feature]_[date].md` — BDD user stories, requirements, acceptance criteria |
| **Design** | `docs/pdlc/design/[feature]/` — ARCHITECTURE.md, data-model.md, api-contracts.md |
| **Plan** | Beads tasks created with epic/story labels and blocking dependencies |

### Phase 2 — Construction (`/build`)

Three sub-phases run per task from the Beads ready queue:

| Sub-phase | What happens |
|-----------|-------------|
| **Build** | TDD enforced (failing test → implement → pass). Choose Agent Teams or Sub-Agent mode per task. |
| **Review** | Always-on team (Neo, Echo, Phantom, Jarvis) + builder produce `docs/pdlc/reviews/REVIEW_[task-id]_[date].md` |
| **Test** | 6 layers: Unit → Integration → E2E (real Chromium) → Performance → Accessibility → Visual Regression |

### Phase 3 — Operation (`/ship`)

| Sub-phase | What happens |
|-----------|-------------|
| **Ship** | Merge commit to main, CI/CD trigger (Pulse), CHANGELOG entry (Jarvis), semantic version tag |
| **Verify** | Smoke tests against deployed environment + manual human sign-off |
| **Reflect** | gstack-style retro: per-agent contributions, shipping streaks, metrics, what went well / broke / to improve |

After Reflect, Claude drafts the episode file. On human approval it commits to `docs/pdlc/memory/episodes/` and updates `OVERVIEW.md`.

---

## The Team

PDLC assigns a named specialist agent to each area of concern.

### Always-on (every task, every time)

| Name | Role | Focus |
|------|------|-------|
| **Neo** | Architect | Design integrity, PRD conformance, tech debt, cross-cutting concerns |
| **Echo** | QA Engineer | TDD discipline, test completeness, edge cases, regression risk |
| **Phantom** | Security Reviewer | OWASP Top 10, auth, input validation, secrets, injection risks |
| **Jarvis** | Tech Writer | Inline docs, API contracts, CHANGELOG entries, episode file drafting |

### Auto-selected (by task labels)

| Name | Role | Activated by labels |
|------|------|-------------------|
| **Bolt** | Backend Engineer | `backend`, `api`, `database`, `services` |
| **Friday** | Frontend Engineer | `frontend`, `ui`, `components` |
| **Muse** | UX Designer | `ux`, `design`, `user-flow` |
| **Oracle** | PM | `requirements`, `scope`, `product` |
| **Pulse** | DevOps | `devops`, `infrastructure`, `deployment`, `ci-cd` |

---

## Skills

PDLC is built entirely from skills. Phase skills are user-invocable via slash command. Supporting skills are referenced internally by the phases.

### Phase skills (user-invocable)

| Skill | Invoke with | What it does |
|-------|-------------|--------------|
| **Init** | `/init` | Initialize PDLC for this project (run once) |
| **Brainstorm** | `/brainstorm <feature>` | Run the Inception phase: Discover → Define → Design → Plan |
| **Build** | `/build` | Run the Construction phase: Build (TDD) → Review → Test |
| **Ship** | `/ship` | Run the Operation phase: Ship → Verify → Reflect |

### Supporting skills (referenced internally)

| Skill | File | What it governs |
|-------|------|-----------------|
| **TDD** | `skills/tdd/SKILL.md` | Red → Green → Refactor cycle; test-first enforcement; 3-attempt auto-fix cap |
| **Review** | `skills/review/SKILL.md` | Multi-agent review protocol; reviewer responsibilities; soft-warning severity |
| **Test** | `skills/test/SKILL.md` | Six test layer execution order; Constitution gate checking; results → episode file |
| **Reflect** | `skills/reflect/SKILL.md` | Retro format; per-agent contributions; shipping streaks; metrics snapshot |
| **Safety Guardrails** | `skills/safety-guardrails/SKILL.md` | Tier 1/2/3 definitions; double-RED override protocol; Tier 2→3 downgrade via Constitution |
| **Repo Scan** | `skills/repo-scan/SKILL.md` | Brownfield deep-scan; pre-populates memory files from existing codebase |
| **Visual Companion** | `skills/brainstorming/visual-companion.md` | Browser-based mockup and diagram loop during Inception |
| **Writing Clearly and Concisely** | `skills/writing-clearly-and-concisely/SKILL.md` | Strunk's *Elements of Style* rules applied to PRDs, design docs, episode files, and any prose for human review |

---

## Memory Bank

All PDLC-generated files live under `docs/pdlc/` inside your repo, version-controlled alongside your code:

```
docs/pdlc/
  memory/
    CONSTITUTION.md       ← rules, standards, test gates, guardrail overrides
    INTENT.md             ← problem statement, target user, value proposition
    STATE.md              ← current phase, active task, last checkpoint (live)
    ROADMAP.md            ← phase-by-phase plan
    DECISIONS.md          ← architectural decision log (ADR-style)
    CHANGELOG.md          ← what shipped and when
    OVERVIEW.md           ← aggregated delivery state, updated after every merge
    episodes/
      index.md            ← searchable episode index
      001_auth_2026-04-04.md
      002_billing_2026-04-10.md
  prds/
    PRD_[feature]_[date].md
    plans/
      plan_[feature]_[date].md
  design/
    [feature]/
      ARCHITECTURE.md
      data-model.md
      api-contracts.md
  reviews/
    REVIEW_[task-id]_[date].md
```

### Episodic memory

Every time a feature is delivered (commit → PR → merge to main), Claude drafts an episode file capturing:

- What was built and why
- Link to the PRD and PR
- Key decisions and their rationale
- Files created and modified
- Test results across all six layers
- Known tradeoffs and tech debt introduced
- The agent team that worked on it

Human reviews and approves the episode before it is committed.

---

## Safety Guardrails

PDLC enforces a three-tier safety system on Bash commands. Rules can be adjusted in `CONSTITUTION.md`.

### Tier 1 — Hard block

Blocked by default. Requires **double confirmation in red text** to override.

- Force-push to `main` or `master`
- `DROP TABLE` without a prior migration file
- `rm -rf` outside files created on the current feature branch
- Deploy with failing Constitution test gates

### Tier 2 — Pause and confirm

PDLC stops and asks before proceeding. Individual items can be downgraded to Tier 3 in `CONSTITUTION.md`.

- Any `rm -rf`
- `git reset --hard`
- Production database commands
- Modifying `CONSTITUTION.md`
- Any external API write call (POST / PUT / DELETE to external URLs)

### Tier 3 — Logged warning

PDLC proceeds and records the decision in `STATE.md`.

- Skipping a test layer
- Overriding a Constitution rule
- Accepting a Phantom security warning without fixing
- Accepting an Echo test coverage gap

---

## Status Bar

After installation, PDLC adds a live status bar to every Claude Code session showing:

```
Construction │ bd-a1b2: Add auth middleware │ my-app │ ██████░░░░ 58%
```

| Element | Source |
|---------|--------|
| Phase | `docs/pdlc/memory/STATE.md` |
| Active task | Current Beads task (ID + title) |
| Context bar | Colour-coded: green < 50% · yellow 50–65% · orange 65–80% · red ≥ 80% |

A background hook fires after every tool call and injects a context warning at ≥ 65% and a critical alert at ≥ 80%, automatically saving your position to `STATE.md` so no work is lost if the context window compacts.

---

## Visual Companion

During the Inception phase (`/brainstorm`), PDLC can optionally run a local Node.js + WebSocket server and give you a `localhost` URL to open in your browser.

**Consent-based:** At the start of Discover, if the feature is likely to involve visual questions (layouts, wireframes, architecture diagrams), Claude will ask — in a standalone message — whether you want to use the visual companion. You can decline and work entirely in the terminal.

**Per-question, not per-session:** Even after accepting, Claude decides on each question whether to use the browser or the terminal. The rule: use the browser only when the content itself is visual (mockups, layout comparisons, Mermaid diagrams). Use the terminal for requirements questions, conceptual choices, and tradeoff discussions.

**What appears in the browser:**
- UI wireframes and layout comparisons (click to select your preference)
- Mermaid architecture diagrams and data flow charts
- Side-by-side design options with pros/cons
- The Beads task dependency graph at the end of Plan

**How interaction works:** Click any option card in the browser to record your selection. Claude reads your clicks from the session's event log on its next turn, alongside your terminal message.

**Cleanup:** A "Continuing in terminal..." waiting screen is pushed whenever the conversation moves to a non-visual question, so the browser doesn't show stale content. The server shuts down automatically when Inception ends or after 30 minutes of inactivity. Mockup files persist in `.pdlc/brainstorm/` for later reference.

---

## pdlc-os Marketplace

| Resource | URL |
|----------|-----|
| GitHub org | https://github.com/pdlc-os |
| Core package | https://www.npmjs.com/package/@pdlc-os/pdlc |
| Registry index | https://github.com/pdlc-os/registry |
| Contribution guide | https://github.com/pdlc-os/registry/blob/main/CONTRIBUTING.md |

The `pdlc-os` GitHub organisation hosts community-contributed extensions that extend PDLC's built-in capabilities. All packages are published under the `@pdlc-os/` npm scope.

**What the marketplace hosts:**

| Type | Examples |
|------|---------|
| **Workflow templates** | `@pdlc-os/workflow-saas-mvp`, `@pdlc-os/workflow-api-service` |
| **Role packs** | `@pdlc-os/agent-fintech-security`, `@pdlc-os/agent-accessibility-auditor` |
| **Stack adapters** | `@pdlc-os/stack-nextjs-supabase`, `@pdlc-os/stack-rails-postgres` |
| **Integration plugins** | `@pdlc-os/integration-linear`, `@pdlc-os/integration-notion` |
| **Skill packs** | `@pdlc-os/skill-hipaa`, `@pdlc-os/skill-seo-audit` |

**Trust model:**

- Anyone can publish under their own npm scope
- `pdlc-os/verified` badge for packages reviewed by maintainers
- Every package must declare its permissions (network access, filesystem writes, external API calls)
- PDLC warns when installing an unverified package and shows declared permissions before confirming

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18 |
| Claude Code | Latest |
| [Beads (bd)](https://github.com/gastownhall/beads) | Latest |
| Git | Any recent version |

---

## License

MIT © pdlc-os contributors
