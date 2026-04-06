# Feature Highlights

### Inception — Deep Discovery

| Feature | What it does |
|---------|-------------|
| **Divergent Ideation** | Optional pre-discovery: 100+ raw ideas using structured domain rotation (Technical -> UX -> Business -> Edge Cases), cycling every 10 ideas to prevent semantic drift. Clusters into themes, surfaces 10-15 standouts. |
| **4-Round Socratic Interview** | Active + Challenging questioning posture across Problem Statement, Future State, Acceptance Criteria, and Current State. Minimum 5 questions per round. |
| **Progressive Thinking** | Required agent team meeting after Socratic discovery. Oracle facilitates 6 rounds with all agents: Concrete (facts) → Inferential (inferences) → Consequential (implications) → Speculative (unknowns) → Conflicting (disagreements) → Strategic (priorities). User escalation only when agents can't resolve. |
| **Adversarial Review** | Devil's advocate analysis across 10 dimensions (assumption gaps, scope leaks, metric fragility, technical blindspots, etc.). Minimum 10 findings. Top 5 become targeted follow-ups. |
| **Edge Case Analysis** | Mechanical path tracing across 9 categories (user flow branches, boundary data, concurrency, integration failures, etc.). User triages each finding: in-scope, out-of-scope, or known risk. |
| **Bloom's Taxonomy Design Questioning** | Neo leads 6 rounds during Design: Remember (facts) → Understand (mechanics) → Apply (stack-specific) → Analyze (trade-offs) → Evaluate (judgments) → Create (synthesis). Produces design discovery log before document generation. |
| **Brainstorm Log** | Progressive content record at `docs/pdlc/brainstorm/`. Captures all ideation and design discovery context for mid-session resume and document generation. Separate from STATE.md. |
| **Visual Companion** | Optional browser-based UI for mockups, wireframes, and architecture diagrams during Inception. Consent-based, per-question. |

### Initialization — Foundation

| Feature | What it does |
|---------|-------------|
| **Git & GitHub Setup** | Auto-detects missing git repo, offers to initialize with `.gitignore`. Verifies GitHub connectivity, walks through `gh` CLI auth and repo creation if needed. |
| **Roadmap Ideation** | Oracle brainstorms 5–15 features with you, assigns permanent `F-NNN` IDs, and collaboratively prioritizes by dependencies, user value, and technical risk. |
| **Brownfield Repo Scan** | Deep-scans existing codebases to pre-populate memory files from real code. All inferred content is marked for verification. |

### Construction — TDD + Multi-Agent Build

| Feature | What it does |
|---------|-------------|
| **TDD Enforcement** | No implementation code without a failing test first. Red -> Green -> Refactor per acceptance criterion. |
| **Party Mode** | 7 multi-agent meeting types. 3 spawn modes: Agent Teams (default — own context windows, direct cross-talk), Subagents (mediated), Solo (single LLM fallback). |
| **Meeting Announcements** | Before every party meeting: who called it, participants, purpose, and estimated duration. Progress updates if it runs long. |
| **3-Strike Loop Breaker** | After 3 failed auto-fix attempts, convenes a Strike Panel (Neo + Echo + domain agent) to diagnose root cause and produce 3 ranked approaches for the human. |
| **Deadlock Detection** | 6 types of deadlock detection with auto-resolution and human escalation paths. |
| **Critical Finding Gate** | Critical review findings must be fixed or explicitly overridden (Tier 1 event) before approval options appear. |
| **Phantom Security Sign-off** | Phantom's security findings get explicit visibility during review — Critical findings block, Important findings highlighted separately. |
| **7-Layer Testing** | Unit, Integration, E2E, Performance, Accessibility, Visual Regression, **Security** (dependency audit + secret scan + OWASP). Layer 7 always runs and cannot be skipped. |

### Operation — Ship + Reflect + Next Feature

| Feature | What it does |
|---------|-------------|
| **Merge Commit Strategy** | `git merge --no-ff` preserves full branch history. Semantic versioning with auto-tagging. |
| **CHANGELOG Generation** | Jarvis drafts Conventional Changelog entries from commit history during Ship. |
| **Smoke Test Verification** | Runs against deployed environment with human sign-off gate. |
| **Retrospective** | Per-agent contributions, what went well / broke / to improve, metrics snapshot. Episode file committed to permanent record. |
| **Roadmap Tracking** | Jarvis marks shipped features in ROADMAP.md with date and episode reference. Ad-hoc features retroactively added. |
| **Feature Loop** | After shipping, Oracle presents the next roadmap feature. Continue, pause, or switch to a different feature — the cycle repeats automatically. |
| **Rollback** | `/pdlc rollback` — revert a shipped feature with `git revert`, full post-mortem meeting (Oracle leads, all 9 agents), 3 ranked fix approaches. Options: fix and re-ship, abandon, or pause. |
| **Hotfix** | `/pdlc hotfix` — emergency compressed build-ship. Auto-pauses current feature, skips inception, TDD still enforced, Phantom+Echo security check, expedited verify. Auto-resumes paused feature with impact assessment + rebase. |

### Decision Registry (`/pdlc decision`)

| Feature | What it does |
|---------|-------------|
| **Any-Phase Decisions** | Record decisions at any point during Inception or Construction. The current phase lead runs the flow. |
| **Decision Review Party** | All 9 agents assess impacts on their owned artifacts — code, tests, architecture, PRD, roadmap, UX flows, environment config, documentation. |
| **Cross-Cutting Impact** | Identifies chain reactions (e.g., backend change → frontend update → test modification → roadmap resequencing). |
| **MOM with Recommendations** | Minutes of meeting with per-agent assessments, risk consensus, recommended changes table, and roadmap resequencing proposal. |
| **Phase-Aware Reconciliation** | Updates Beads tasks, PRDs, design docs, episode drafts, test flags, and announces decision context to the team on resume. |
| **Durable Checkpoints** | Decision and meeting progress saved to disk. Survives network failures, usage limits, and accidental exits. Session-start hook detects interrupted work and offers recovery. |

### What-If Analysis (`/pdlc whatif`)

| Feature | What it does |
|---------|-------------|
| **Read-Only Exploration** | Explore "what if" scenarios without modifying any project files. Only a MOM is created. |
| **Full Team Analysis** | All 9 agents assess the hypothetical scenario: architecture, code, tests, security, UX, docs, ops, roadmap, product impact. |
| **Iterative Deepening** | Explore further by drilling into specific aspects — each round produces a versioned MOM. |
| **Convert to Decision** | Accept the analysis as a formal decision — reuses the existing MOM (no duplicate meetings), then runs the decision workflow for reconciliation. |
| **Safe to Discard** | File the analysis for reference and resume where you left off. MOM files are kept permanently. |

### Cross-Cutting

| Feature | What it does |
|---------|-------------|
| **Safety Guardrails** | 3-tier system: Tier 1 hard blocks, Tier 2 pause-and-confirm, Tier 3 logged warnings. Configurable via Constitution. |
| **Colored Transitions** | Phase transitions (cyan), sub-phase transitions (yellow), and agent handoffs (magenta) with ANSI color codes. |
| **Humanized Handoffs** | Agent transitions include warm farewells and enthusiastic welcomes — feels like a real team. |
| **Material Design Visual Companion** | Browser-based UI with MD2 styling, Roboto font, elevation system, light/dark toggle. Click-to-select with dual input (browser + terminal). |
| **Auto-Resume** | Every session reads STATE.md and resumes from the exact last checkpoint. No work is lost. |
| **Durable Party Checkpoints** | All party meetings write progress to `.pending-party.json`. Interrupted meetings are detected on next session start and can be resumed. |
| **MOM Files** | Meeting minutes for all party sessions, capturing who said what, conclusions, and next steps. |
| **Episode Memory** | Permanent delivery records indexed in `episodes/index.md`. Searchable history of every feature shipped. |
| **Doctor** | `/pdlc doctor` — 8-check health scan: state consistency, doc/code drift, Beads integrity, rollback detection, multi-user conflicts, Constitution compliance. Read-only with optional fix mode. |

---

[← Previous: The PDLC Flow](01-pdlc-flow.md) | [Back to README](../../README.md) | [Next: Phases in Detail →](03-phases-in-detail.md)
