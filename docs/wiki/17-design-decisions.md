# Design Decisions

The architecture of PDLC reflects deliberate choices about how small teams should build software with AI assistance. Each decision below was made for a specific reason.

### File-based memory instead of a database

All state lives as human-readable markdown in the repo, version-controlled via git. No external service dependency. You can understand project state by reading files, not querying APIs. Git log becomes the audit trail. Everything survives Claude Code restarts and context window resets.

### Beads as external peer dependency, not bundled

Task management is a distinct domain. Beads handles complex dependency resolution, wave-based scheduling, and persistent task state — capabilities expensive to re-implement. Keeping it external means both tools evolve independently, and teams can use Beads outside PDLC. PDLC orchestrates phases; Beads manages task flow.

### TDD enforced by default

Small startup teams cannot afford untested features. The cost of a production bug outweighs upfront test investment. No implementation code is written without a failing test first. Test names use exact Given/When/Then language from PRD user stories, enforcing specificity. The 3-attempt auto-fix cap prevents infinite debugging cycles and forces a conversation about whether the design itself is wrong.

### Three spawn modes for party meetings

Each mode trades off independence, speed, and fidelity:

- **Agent Teams** (default): Highest fidelity. Each agent has its own context window with independent reasoning. Agents talk to each other directly and the user can interact with any agent. Best for complex discussions where cross-agent debate matters.
- **Subagents**: Medium fidelity, faster. Primary agent spawns sub-agents that report back individually — they cannot talk to each other. Cross-talk is mediated by the primary agent. Best when speed matters more than direct debate.
- **Solo**: Lowest fidelity, fastest. Single LLM roleplays all personas in one response — risks false consensus since one model maintains all viewpoints. Emergency fallback or when spawning fails.

Users pick once per session. The choice is stored in STATE.md and never asked again.

### Adversarial review requires 10+ findings, but only top 3 become user follow-ups

Requiring a minimum of 10 findings forces the reviewer past surface-level concerns into root causes — assumptions, scope leaks, dependency blindspots. If 10 issues aren't found, the feature concept is probably solid. If they're found easily, there are serious blindspots to address before building. The full 10+ findings stay visible in the brainstorm log and feed downstream steps (Edge Case Analysis, PRD known-risks section); only the top 3 by risk become targeted user-facing follow-ups, keeping the prompt count tight without losing analytical depth.

### Edge case analysis is method-driven, orthogonal to adversarial review

Adversarial review asks "what's wrong with this idea?" (attitude-driven, critical). Edge case analysis asks "what paths are unhandled?" (method-driven, mechanical). Adversarial catches design flaws and assumption conflicts. Edge cases catch unhandled user flows, boundary conditions, and error paths. Running both ensures complementary coverage — neither subsumes the other.

### UX Discovery is conditional, visual-required, and grounded in existing UI

A separate UX questioning round exists (Step 4.5) instead of folding UX into Bloom's Taxonomy or Socratic Discovery for three reasons. **First**, UX-heavy features need a focused round — backend-only features should pay no UX-questioning cost, so the round is conditional on Step 1's "this feature has UI/UX elements" assessment. **Second**, UX answers are only meaningful when the user sees options; text-only "describe your layout preference" prompts produce vague answers and re-decisions during build. The visual companion is therefore required for this step (re-offered if previously declined; the round is skipped with a logged reason if unavailable). **Third**, every option presented in the round is grounded in the project's existing UI inventory — shipped UX patterns from OVERVIEW + episodes, the repo component library, design tokens, and prior DECISIONS.md UX entries — so new features inherit the established design language rather than introducing disjointed look-and-feel. Deviations are allowed but require explicit rationale captured in the brainstorm log, with substantive deviations flagged for DECISIONS.md.

### Brainstorm log is separate from STATE.md

Different retention and scope. The brainstorm log (`docs/pdlc/brainstorm/`) is a content record for a single feature's discovery: ideas, Q&A, adversarial findings, edge case triage. STATE.md is a project-wide operational state: current phase, active task, party mode, append-only phase history. Keeping them separate lets brainstorm logs be archived without losing project state, and keeps STATE.md lean.

### Approval gates are human-only

Every gate pauses for explicit human confirmation. "Looks good" counts as approval; silence does not. This prevents silent feature drift, catches misalignment early (rejecting a PRD is cheaper than discovering the problem on day 3 of construction), and establishes clear decision ownership. PDLC surfaces options; humans own the final call.

### 3-strike cap before Strike Panel

Attempts 1-3 are normal TDD iteration. If a test still fails after 3 different fixes, the problem is likely the design, not the code. The cap forces a structured conversation: the Strike Panel (Neo + Echo + domain agent) diagnoses root cause and produces ranked approaches. This prevents infinite auto-fix loops while providing expert diagnosis instead of just "try again."

### Deadlock protocol for multi-agent coordination

When 2+ agents or tasks work in parallel, they can deadlock in ways a single developer never would: circular task dependencies, agent spawn failures, consensus failures, stagnating build loops. Each of the 6 deadlock types has a detection condition, auto-resolution path (for unambiguous cases), and human escalation path (for ambiguous or irreversible decisions). Without this protocol, a stuck agent team would spin forever.

### MOM files for meeting minutes

Meeting minutes (`docs/pdlc/mom/`) capture what agents said and decided — the reasoning behind decisions, not just the decisions themselves. Episode files capture what was delivered. Keeping them separate means MOMs can be cleaned up after shipping while episodes remain as permanent records. MOMs feed into episodes, but episodes synthesize beyond any single meeting.

### Constitution as single source of truth

One file to override all defaults. `CONSTITUTION.md` governs tech stack, architectural constraints, test gates, guardrail overrides, and coding standards. Everything else in PDLC is a default. Different teams have different risk profiles, and different projects have different constraints. Rather than forking PDLC per project, edit Constitution.

### Guardrails cover all write tools, not just Bash

Destructive actions can happen through Claude's Edit and Write tools, not just Bash commands. A `sed` editing CONSTITUTION.md is caught by the Bash guardrail, but a direct Edit tool call would bypass it. So guardrails fire on Bash, Edit, and Write — checking if the target file is a protected PDLC memory file. CONSTITUTION.md and DECISIONS.md are Tier 2 (pause and confirm); STATE.md, ROADMAP.md, INTENT.md, OVERVIEW.md, and CHANGELOG.md are Tier 3 (logged warning). STATE.md was moved from Tier 2 to Tier 3 because it is a working file that PDLC commands update on every phase transition — blocking those edits interrupted PDLC's own operational flow (e.g., init couldn't proceed to brainstorm because the STATE.md update kept triggering Tier 2 confirmation blocks). For the same reason, a first-time `Write` of CONSTITUTION.md or DECISIONS.md (file not yet on disk) is downgraded to Tier 3: `/setup` Step 5 generates both files from templates, and there is no prior state to drift from on creation. Overwrites and Edits on existing copies still pause and confirm.

### Tier-aliased model declarations in agent frontmatter

Every agent's `model:` frontmatter field uses **tier aliases** (`opus` / `sonnet` / `haiku`) rather than fully-qualified model IDs (`claude-opus-4-7`, `claude-sonnet-4-6`, etc.). Tier aliases are documented in Claude Code's harness as first-class values for the `model:` field; they resolve to the current latest model in that tier at runtime. Pinning a specific version means every Anthropic model release silently makes PDLC stale until the next PDLC release catches up — and we proved this when v2.16.0 found 5 of 10 agents still pointing at Opus 4.6 long after Opus 4.7 had shipped. Tier aliases let agents move forward with the platform automatically. We keep PDLC's intentional tier choice per agent role (Opus for Bolt/Friday/Neo/Oracle/Pulse — leadership and complex-reasoning roles; Sonnet for Echo/Jarvis/Muse/Phantom — focused specialist work) since that's a deliberate cost/quality calibration. Specific-version pinning is reserved for the rare case where reproducibility (compliance, regression testing) requires it; the override path is `CLAUDE_CODE_SUBAGENT_MODEL` at the session level.

### Agent extensions framework

Agents need to be extensible per-project without forking PDLC. The framework uses two locations: `agents/extensions/<agent>-<topic>.md` for *agent-wide* extensions (loaded on every invocation of that agent — Phantom's universal security audit catalog is the first example), and `skills/<phase>/steps/<topic>.md` for *phase-specific* extensions (loaded by a particular skill step — Pulse's deploy-time lint pass invoked at Ship Step 9.0 is the first example). The split is load-bearing: agent-wide content belongs at the agent layer because the agent file itself directs the read; step-specific content belongs at the step layer because the step is the loader. Mixing them would either misload (extension fires when not relevant) or hide intent (extension lives at agent layer but only fires for one phase). Both extension types use the same precedence rule: where the extension and the base file conflict, the extension wins, but the extension delegates voice and structure back to the base file rather than redefining them.

### Threat modeling integrated into Brainstorm Design as a Phantom-led party

Threat modeling is a security analysis activity that traditionally happens out-of-band (before kickoff, in a separate workshop, or — most commonly — never). PDLC integrates it into Brainstorm Design at Step 10.5, between design-doc generation and the design approval gate. This placement is load-bearing: the design artifacts (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`) are concrete enough to model threats against, but design isn't yet locked, so threat findings can drive design revisions before approval. Phantom takes lead with explicit Neo→Phantom and Phantom→Neo handoffs at the boundaries; the human reviews the resulting `threat-model.md` alongside the other three design documents at the existing Step 12 approval gate. The skill uses PDLC's existing party-mode + progressive-thinking + cross-talk machinery — no new infrastructure. A triage gate (3 questions) decides depth: Skip (no new attack surface, audit-trail one-liner), Lite (Phantom solo, single-pass STRIDE), or Full (full team party). The depth tiers prevent the lean-process tax for low-risk features and let the full team converge on high-risk ones.

### Skills split into sub-files

Large skill files (400+ lines) are broken into sub-files in `steps/` subdirectories. Each sub-file is self-contained, reads cleanly in isolation, and ends with an explicit "Return to SKILL.md" instruction. The main SKILL.md becomes a lightweight orchestrator. This keeps each file within context limits, makes individual steps easier to update, and reduces context usage per step — leaving more room for implementation code.

### Template versioning for non-destructive upgrades

PDLC templates evolve between versions (new sections, new fields). User projects have customized copies of these templates. Rather than requiring users to manually diff and merge after every upgrade, each template has a version stamp (`<!-- pdlc-template-version: X.Y.Z -->`). The upgrade command compares the user's file version against the current template, identifies sections present in the template but missing from the user's file, and appends them — without touching any section the user has customized. This is essentially a schema migration for markdown files: additive only, never destructive. Missing memory files are created from the template. The version stamp is the only line the upgrade modifies in existing content.

### Merge commits instead of squash

`git merge --no-ff` preserves full branch history. If a bug appears later, `git bisect` can trace it through the feature branch. The development narrative stays intact for future team members. Every merge commit is tagged with version and feature name, making `git log --merges` a readable timeline of shipped features.

### Soft warnings for review findings

Phantom (security), Echo (QA), and Neo (architecture) findings are soft warnings by default — human decides: fix, accept, or defer. Exception: Critical findings are hard blocks until fixed or explicitly overridden (Tier 1 event). Why soft? "Perfect code" doesn't exist. A security warning might be acceptable for v1; a coverage gap might be acceptable for well-understood logic. Soft warnings prevent review fatigue while keeping the human in control. All accepted warnings are logged as Tier 3 events.

### STATE.md phase history is append-only

Nothing is deleted, only appended. You can ask "when did we start building feature X?" without re-running git log. If a deadlock happens, the event sequence is visible. Cycle time and throughput metrics can be calculated directly from the log. The state file itself becomes the audit trail.

### Design pivots via `/pdlc decide`

Software projects change direction. A mid-build decision to switch databases, rearchitect a service, or change scope needs to propagate cleanly: update the architecture docs, rewrite affected Beads tasks, flag tests that need changing, resequence the roadmap. Without a structured pivot mechanism, these changes fragment across conversations and files, creating drift between what was designed and what exists. The Decision Review Party ensures every agent assesses the blast radius before anything changes, and the phase-aware reconciliation updates all downstream artifacts in one pass.

### Scenario planning via `/pdlc whatif`

Before committing to a change, you want to know the cost. "What if we switched to GraphQL?" is a question with implications for architecture, frontend, tests, docs, deployment, and timeline -- but asking it shouldn't force you to commit. What-If analysis lets the full team assess a hypothetical in a read-only meeting, producing a MOM with feasibility, effort, risks, and trade-offs. If the analysis is promising, convert it to a decision (reusing the existing MOM -- no duplicate meeting). If not, discard it and resume where you were. This separates exploration from commitment.

### State reconciliation over distributed locks

PDLC state is spread across multiple files: STATE.md (phase/task), ROADMAP.md (feature status), Beads (task status), and temporary pending files (meetings/decisions). A crash at any point can leave these files inconsistent. Rather than using distributed locks (which add complexity and their own failure modes), PDLC uses a reconciliation protocol: STATE.md is the single source of truth, other files are reconciled to match on resume. Pending files are resolved innermost-first (meeting → decision → phase) with a 24-hour staleness threshold. Write-order rules (pending file first, cleanup last) minimize the inconsistency window. This approach is simpler, debuggable (all state is human-readable markdown/JSON), and resilient to any crash point.


---

[← Previous: Visual Companion](16-visual-companion.md) | [Back to README](../../README.md) | [Next: Extensibility →](18-extensibility.md)
