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
| **Oracle** | PM | Opus | Requirements clarity, scope, acceptance criteria | Scope guardian, pushes for testable definitions |
| **Pulse** | DevOps | Opus | CI/CD, infra, deployment, environment config | Ops-first, questions anything that doesn't deploy cleanly |

> **Model strategy:** Opus (5 agents) handles complex reasoning — architecture, product decisions, backend/frontend engineering, deployment. Sonnet (4 agents) handles focused specialized work — testing, security review, documentation, UX design.

---

### Lead agents by phase

| Phase / Sub-phase | Lead Agent | Also leads `/pdlc decision` |
|-------------------|-----------|----------------------------|
| Init | Oracle | Yes |
| Brainstorm — Discover + Define | Oracle | Yes |
| Brainstorm — Design + Plan | Neo | Yes |
| Build (all sub-phases) | Neo | Yes |
| Ship — Ship + Verify | Pulse | Yes |
| Ship — Reflect | Jarvis | Yes |
| Ship — Next Feature | Oracle | Yes |
| Idle / between phases | — | Oracle |


---

[← Previous: Abandon](08-abandon.md) | [Back to README](../../README.md) | [Next: Party Mode →](10-party-mode.md)
