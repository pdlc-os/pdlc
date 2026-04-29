# Feature Highlights

### Inception — Deep Discovery

| Feature | What it does |
|---------|-------------|
| **Sketch vs Socratic Mode** | User picks the question cadence once during `/pdlc init` (persisted in CONSTITUTION §9). **Sketch** (default) drafts proposed answers from CONSTITUTION, INTENT, CLAUDE.md, and prior episodes, then batches every round as a single block for confirm/edit/replace. **Socratic** asks one question at a time. Both cover identical depth — Socratic discovery, Adversarial follow-ups, Edge-case triage, and Bloom's design questioning all respect the chosen mode. Change anytime by editing §9. |
| **Grounded Divergent Ideation** | Optional pre-discovery: 100+ raw ideas using structured domain rotation (Technical -> UX -> Business -> Edge Cases), cycling every 10 ideas to prevent semantic drift. **Before generation**, reads OVERVIEW, episodes index, ROADMAP (including Dropped with reasons), and the 1–2 most recent episodes, then emits an `ALREADY BUILT` context block. Ideas that duplicate shipped features or revisit dropped paths are flagged during clustering and kept out of standouts. Clusters into themes, surfaces 10-15 standouts. |
| **3-Round Socratic Interview** | Active + Challenging questioning posture across Problem Statement, Future State, and Acceptance Criteria. Maximum 4 questions per round. Out-of-scope, risks, and current-state context are caught downstream by Adversarial Review and Edge Case Analysis rather than re-asked here. |
| **Progressive Thinking** | Required agent team meeting after Socratic discovery. Atlas facilitates 6 rounds with all agents: Concrete (facts) → Inferential (inferences) → Consequential (implications) → Speculative (unknowns) → Conflicting (disagreements) → Strategic (priorities). User escalation only when agents can't resolve. |
| **Adversarial Review** | Devil's advocate analysis across 10 dimensions (assumption gaps, scope leaks, metric fragility, technical blindspots, etc.). Minimum 10 findings surfaced; **top 3 become targeted follow-ups**. Remaining findings flow into the PRD's known-risks section without dedicated user prompts. |
| **Edge Case Analysis** | Mechanical path tracing across 9 categories (user flow branches, boundary data, concurrency, integration failures, etc.). User triages each finding: in-scope, out-of-scope, or known risk. **Maximum 3 user-facing prompts**: 1 triage block + up to 2 follow-ups for the highest-risk in-scope items. |
| **UX Discovery (conditional)** | Muse leads. Runs only when the feature has UI/UX elements **and** the visual companion is available — visual companion is required for this step (re-offered if previously declined; otherwise skipped with a logged reason). **Maximum 3 visual-first questions**: look-and-feel (layout & hierarchy), flow (user journey across screens), and state coverage (empty / loading / error / success). Every option is grounded in the project's existing UI inventory — shipped UX patterns from OVERVIEW + episodes, the repo component library, design tokens, and prior DECISIONS.md UX entries — so new features inherit the established look-and-feel rather than introducing disjointed UX. Deviations from existing patterns require explicit rationale, captured in the brainstorm log and flagged for potential DECISIONS.md entries. |
| **Bloom's Taxonomy Design Questioning** | Neo leads 3 condensed rounds during Design: Mechanics → Apply (stack-specific) → Trade-offs and Judgments. Maximum 3 questions per round (9 max), plus a final synthesis check where Neo proposes the architecture and the user validates. Produces design discovery log before document generation. |
| **Brainstorm Log** | Progressive content record at `docs/pdlc/brainstorm/`. Captures all ideation and design discovery context for mid-session resume and document generation. Separate from STATE.md. |
| **Visual Companion** | Optional browser-based UI for mockups, wireframes, and architecture diagrams during Inception. Consent-based, per-question. |

### Initialization — Foundation

| Feature | What it does |
|---------|-------------|
| **Git & GitHub Setup** | Auto-detects missing git repo, offers to initialize with `.gitignore`. Verifies GitHub connectivity, walks through `gh` CLI auth and repo creation if needed. |
| **Roadmap Ideation** | Atlas brainstorms 5–15 features with you, assigns permanent `F-NNN` IDs, and collaboratively prioritizes by dependencies, user value, and technical risk. |
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
| **Beads Roadmap Claim (multi-dev safe)** | Each feature on the roadmap is a Beads task with labels `roadmap` + `F-NNN` + `priority:N`, created at init. `/pdlc brainstorm` (no arg) runs `bd ready --label roadmap` + `bd claim` — atomic, so two developers can never accidentally start the same priority-next feature. Claims survive session crashes: the session-start hook reconciles STATE.md against Beads and rebuilds the cache when they diverge. **`/pdlc release <F-NNN>`** force-releases a stuck claim when a teammate can't continue, recording an ADR with the reason. The ROADMAP.md `Claimed by` column and a read-only pinned GitHub issue (synced at each ship) give stakeholders visibility without needing repo access. |
| **Merge Commit Strategy** | `git merge --no-ff` preserves full branch history. Semantic versioning with auto-tagging. |
| **CHANGELOG Generation** | Jarvis drafts Conventional Changelog entries from commit history during Ship. |
| **Custom Deploy Artifact Support** | At the start of Ship, Pulse asks whether you have a custom deploy/CI/CD/build script. If yes, Pulse composes it with PDLC's default pipeline and runs a **Deployment Review Party** — full team assesses from every angle (architecture, security, tests, ops, UX, PRD). User preferences take precedence; Critical security findings become Tier 1 blocks. |
| **Deployment Register** | `DEPLOYMENTS.md` — canonical per-environment register: URL, deploy/rollback commands, workflow file, required env-var names, extensible tags (app-id, instance-id, region, cloud-provider, tenant, cost-center, compliance-scope, etc.), per-deploy history, change log. |
| **Smoke Test Verification** | Runs against deployed environment with human sign-off gate. |
| **Retrospective** | Per-agent contributions, what went well / broke / to improve, metrics snapshot. Episode file committed to permanent record. |
| **Roadmap Tracking** | Jarvis marks shipped features in ROADMAP.md with date and episode reference. Ad-hoc features retroactively added. |
| **Auto-Archive** | After shipping or abandoning, PRDs, design docs, reviews, brainstorm logs, and MOMs are moved to `docs/pdlc/archive/`. Beads is purged and compacted. Active directories stay clean. |
| **Delivery Metrics** | `METRICS.md` tracks cycle time, test pass rate, review rounds, strikes, security findings per episode. Trend summary compares each episode to project average and previous episode. |
| **Feature Loop** | After shipping, Atlas presents the next roadmap feature. Continue, pause, or switch to a different feature — the cycle repeats automatically. |
| **Rollback** | `/pdlc rollback` — revert a shipped feature with `git revert`, full post-mortem meeting (Atlas leads the full team — 9 built-in agents plus any matching custom agents), 3 ranked fix approaches. Options: fix and re-ship, abandon, or pause. |
| **Hotfix** | `/pdlc hotfix` — emergency compressed build-ship. Auto-pauses current feature, skips inception, TDD still enforced, Phantom+Echo security check, expedited verify. Auto-resumes paused feature with impact assessment + rebase. |
| **Pause / Resume** | `/pdlc pause` saves full state, unclaims Beads task. `/pdlc resume` restores state, rebases on main, reclaims Beads task, checks for changes since pause, and picks up exactly where you left off. |
| **Abandon** | `/pdlc abandon` — cleanly drop an in-progress feature. Closes Beads tasks, marks ROADMAP as Dropped, creates abandonment episode with lessons learned, records ADR, hands off to next roadmap feature. Artifacts preserved for reference. |

### Decision Registry (`/pdlc decide`)

| Feature | What it does |
|---------|-------------|
| **Any-Phase Decisions** | Record decisions at any point during Inception or Construction. The current phase lead runs the flow. |
| **Decision Review Party** | The full team (9 built-in agents plus any matching custom agents from `.pdlc/agents/`) assesses impacts on their owned artifacts — code, tests, architecture, PRD, roadmap, UX flows, environment config, documentation. |
| **Cross-Cutting Impact** | Identifies chain reactions (e.g., backend change → frontend update → test modification → roadmap resequencing). |
| **MOM with Recommendations** | Minutes of meeting with per-agent assessments, risk consensus, recommended changes table, and roadmap resequencing proposal. |
| **Phase-Aware Reconciliation** | Updates Beads tasks, PRDs, design docs, episode drafts, test flags, and announces decision context to the team on resume. |
| **Durable Checkpoints** | Decision and meeting progress saved to disk. Survives network failures, usage limits, and accidental exits. Session-start hook detects interrupted work and offers recovery. |

### What-If Analysis (`/pdlc whatif`)

| Feature | What it does |
|---------|-------------|
| **Read-Only Exploration** | Explore "what if" scenarios without modifying any project files. Only a MOM is created. |
| **Full Team Analysis** | The full team (9 built-in agents plus any matching custom agents) assesses the hypothetical scenario: architecture, code, tests, security, UX, docs, ops, roadmap, product impact, and any custom-agent focus areas. |
| **Iterative Deepening** | Explore further by drilling into specific aspects — each round produces a versioned MOM. |
| **Convert to Decision** | Accept the analysis as a formal decision — reuses the existing MOM (no duplicate meetings), then runs the decision workflow for reconciliation. |
| **Safe to Discard** | File the analysis for reference and resume where you left off. MOM files are kept permanently. |

### Cross-Cutting

| Feature | What it does |
|---------|-------------|
| **Shortform Command Aliases** | Every `/pdlc <subcommand>` has a top-level alias so `/pdlc ship` and `/ship` are equivalent. The 14 aliases: `/setup`, `/brainstorm`, `/build`, `/ship`, `/decide`, `/whatif`, `/diagnose` (for `doctor` — avoids Claude Code built-in), `/rollback`, `/hotfix`, `/abandon`, `/release`, `/pause`, `/continue` (for `resume` — avoids Claude Code built-in), `/override`. All args forward through. Installed and removed by the same install/uninstall machinery as the `/pdlc` router. Custom skills remain `/pdlc <name>` only — top-level namespace is reserved for built-ins. |
| **Safety Guardrails** | 3-tier system: Tier 1 hard blocks, Tier 2 pause-and-confirm, Tier 3 logged warnings. Configurable via Constitution. |
| **Colored Transitions** | Phase transitions (cyan), sub-phase transitions (yellow), and agent handoffs (magenta) with ANSI color codes. |
| **Humanized Handoffs** | Agent transitions include warm farewells and enthusiastic welcomes — feels like a real team. |
| **Material Design Visual Companion** | Browser-based UI with MD2 styling, Roboto font, elevation system, light/dark toggle. Click-to-select with dual input (browser + terminal). |
| **Auto-Resume** | Every session reads STATE.md and resumes from the exact last checkpoint. No work is lost. |
| **Durable Party Checkpoints** | All party meetings write progress to `.pending-party.json`. Interrupted meetings are detected on next session start and can be resumed. |
| **MOM Files** | Meeting minutes for all party sessions, capturing who said what, conclusions, and next steps. |
| **Episode Memory** | Permanent delivery records indexed in `episodes/index.md`. Searchable history of every feature shipped. |
| **Remote Sync Check** | Pre-flight sync check at every phase boundary (brainstorm, build, ship, hotfix, rollback). If local is behind remote, 6-agent Sync Assessment meeting analyzes the diff, assesses conflict risk, and recommends pull/review/proceed. |
| **Doctor** | `/pdlc doctor` — 8-check health scan: state consistency, doc/code drift, Beads integrity, rollback detection, multi-user conflicts, Constitution compliance. Read-only with optional fix mode. |
| **Custom Skills** | Drop a `SKILL.md` into `.pdlc/skills/<name>/` — automatically available as `/pdlc <name>`. Template provided. |
| **Custom Agents** | Drop an agent `.md` into `.pdlc/agents/` — automatically included in meetings when task labels match. Template provided. |
| **Custom Test Layers** | Add rows to CONSTITUTION.md §7 Custom Test Layers table — runs after built-in 7 layers during Test sub-phase. |


---

[← Previous: The PDLC Flow](01-pdlc-flow.md) | [Back to README](../../README.md) | [Next: Phases in Detail →](03-phases-in-detail.md)
