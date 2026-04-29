# The Agent Team

PDLC assigns named specialist agents to each area of concern. Each has a distinct focus and personality that shapes their contributions.

### Always-on (every task, every review)

| Name | Role | Model | Focus | Style |
|------|------|-------|-------|-------|
| **Neo** | Architect | Opus | High-level design, cross-cutting concerns, tech debt radar | Decisive, big-picture, challenges scope creep |
| **Echo** | QA Engineer | Sonnet | Test strategy, edge cases, regression coverage | Methodical, pessimistic about happy-path assumptions |
| **Phantom** | Security Reviewer | Sonnet | Auth, input validation, OWASP Top 10, secrets | Paranoid, precise, never lets "we'll fix it later" slide |
| **Jarvis** | Tech Writer | Sonnet | Docs, API contracts, CHANGELOG, README | Clear, audience-aware, flags ambiguous naming |

### Auto-selected (based on task labels)

| Name | Role | Model | Focus | Style |
|------|------|-------|-------|-------|
| **Bolt** | Backend Engineer | Opus | APIs, services, DB, business logic | Pragmatic, performance-aware, opinionated about data models |
| **Friday** | Frontend Engineer | Opus | UI components, state, UX implementation | Detail-oriented, accessibility-conscious |
| **Muse** | UX Designer | Sonnet | User flows, interaction design, mental models | Empathetic, non-technical framing, pushes back on dev-centric thinking |
| **Atlas** | PM | Opus | Requirements clarity, scope, acceptance criteria | Scope guardian, pushes for testable definitions |
| **Pulse** | DevOps | Opus | CI/CD, infra, deployment, environment config | Ops-first, questions anything that doesn't deploy cleanly |

> **Model strategy:** Opus (5 agents) handles complex reasoning — architecture, product decisions, backend/frontend engineering, deployment. Sonnet (4 agents) handles focused specialized work — testing, security review, documentation, UX design.

---

### Lead agents by phase

| Phase / Sub-phase | Lead Agent | Also leads `/decide` |
|-------------------|-----------|----------------------|
| Init | Atlas | Yes |
| Brainstorm — Discover + Define | Atlas | Yes |
| Brainstorm — Discover Step 4.5 (UX Discovery, conditional) | Muse | — *(returns to Atlas)* |
| Brainstorm — Design + Plan | Neo | Yes |
| Brainstorm — Design Step 10.5 (Threat Modeling Party) | **Phantom** | — *(returns to Neo)* |
| Build (all sub-phases) | Neo | Yes |
| Ship — Ship + Verify | Pulse | Yes |
| Ship — Reflect | Jarvis | Yes |
| Ship — Next Feature | Atlas | Yes |
| Idle / between phases | — | Atlas |

Step 4.5 (UX Discovery) and Step 10.5 (Threat Modeling) are conditional / triaged sub-phases inside the larger Discover and Design sub-phases. Each carries an explicit handoff banner block in/out — see [`20-security.md`](20-security.md) for the threat-modeling handoff pattern.

### Agent extension framework

PDLC supports two extension patterns that let projects layer additional behavior onto built-in agents and skills without forking:

- **Agent-wide extensions** at `agents/extensions/<agent>-<topic>.md` — load on every invocation of that agent. *Example: `phantom-security-audit.md` extends Phantom with stack-aware security catalogs.*
- **Phase / step-specific extensions** at `skills/<phase>/steps/<topic>.md` — load only when a specific step references them. *Example: `skills/ship/steps/fix-lint.md` invoked by Ship Step 9.0 as Pulse's first action on takeover.*

See [`21-agent-extensions.md`](21-agent-extensions.md) for the full authoring guide and conventions.

### Model declarations use tier aliases

Every built-in agent's `model:` frontmatter uses **tier aliases** (`opus` / `sonnet` / `haiku`) rather than version-pinned IDs. Tier aliases resolve to the current latest model in that tier at runtime, so agents stay current as Anthropic ships new models without requiring a PDLC release.

PDLC's tier choice per role: **Opus** for Bolt, Friday, Neo, Atlas, Pulse (leadership and complex-reasoning roles); **Sonnet** for Echo, Jarvis, Muse, Phantom (focused specialist work). Custom agents you author should use the same convention; reserve specific-version pinning for the rare case where reproducibility (compliance, regression testing) demands it.

Override per-session via the `CLAUDE_CODE_SUBAGENT_MODEL` environment variable. See [`17-design-decisions.md`](17-design-decisions.md) for rationale.


---

[← Previous: Abandon](08-abandon.md) | [Back to README](../../README.md) | [Next: Party Mode →](10-party-mode.md)
