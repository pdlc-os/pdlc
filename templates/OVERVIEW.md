# Overview
<!-- This file is the living, aggregated record of everything this product does and has shipped.
     It is updated automatically by PDLC after every successful merge to main (during Reflect sub-phase).
     Use it to orient yourself after time away, onboard a new teammate, or brief Claude in a fresh session.
     Do not edit manually — let PDLC maintain it. If you need to correct something, update and note the reason. -->

**Project:** <!-- Project name — set during /pdlc init -->
**Last updated:** <!-- YYYY-MM-DDTHH:MM:SSZ — set automatically after each merge -->

---

## Project Summary

<!-- 1–2 sentences describing what this product is and who it is for.
     Derived from INTENT.md and updated only if the product's core purpose changes.
     Example:
       Folia is a personal finance tracker for bootstrapped founders that connects to Stripe and bank
       accounts to show true runway in under 30 seconds — with zero manual entry. -->

<!-- Auto-populated from INTENT.md on first run. Human-editable thereafter. -->

---

## Active Functionality

<!-- A plain-language bullet list of everything the product currently does — as of last merge.
     Claude updates this list after every Reflect sub-phase to reflect the current shipped state.
     Think of it as the "what can a user actually do right now?" list.
     Example:
       - Users can sign up and log in via email/password or GitHub OAuth
       - Users can connect a Stripe account and see live MRR and churn
       - Users can set a monthly runway target and see a countdown
       - Admins can view all users and impersonate accounts
       - Automated weekly email digest of key metrics -->

<!-- None yet — update after first feature ships. -->

---

## Shipped Features

<!-- Auto-populated by PDLC after each successful merge to main.
     Each row added during the Reflect sub-phase.
     Do not delete rows — this is the permanent shipping record. -->

| # | Feature | Date Shipped | Episode | PR |
|---|---------|-------------|---------|-----|
| <!-- 001 --> | <!-- Feature name --> | <!-- YYYY-MM-DD --> | <!-- [ep-001](../memory/episodes/001_*.md) --> | <!-- [#1](https://github.com/org/repo/pull/1) --> |

---

## Architecture Summary

<!-- A concise description of the system architecture.
     Updated when the architecture changes significantly (e.g. new service added, DB migration, infra change).
     Include: tech stack layers, data flow, key integrations, and anything non-obvious.
     Aim for 3–6 bullet points or a short paragraph. Mermaid diagrams welcome.
     Example:
       - Next.js 14 App Router frontend served from Vercel; API routes handle all server-side logic
       - PostgreSQL database on Supabase; accessed via Drizzle ORM
       - Supabase Auth handles all authentication; JWTs passed in Authorization header to API routes
       - Stripe webhooks received at /api/webhooks/stripe, verified and queued for async processing
       - GitHub Actions CI runs lint → test → deploy on every merge to main
-->

<!-- Auto-populated during /pdlc init from CONSTITUTION.md and updated as architecture evolves. -->

---

## Known Tech Debt

<!-- A running list of technical debt acknowledged by the team.
     Each item is added during Reflect when a tradeoff was consciously accepted.
     Items are removed when resolved (with a note of when and in which episode).
     Format: - [Added YYYY-MM-DD] [Description] — [why it was accepted] — [episode ref]
     Example:
       - [2026-04-10] Auth tokens stored in localStorage instead of httpOnly cookies —
         accepted to ship faster; should move to cookies before public launch — ep-001
       - [2026-04-17] No pagination on /api/users — table is small now; add before 1k users — ep-002
-->

<!-- None yet. -->

---

## Decision Log Summary

<!-- A short summary of the most consequential decisions made across all episodes.
     Full ADR-style decisions live in docs/pdlc/memory/DECISIONS.md.
     This section highlights the 3–5 decisions most likely to affect future work.
     Updated by Claude during Reflect. -->

<!-- None yet — see docs/pdlc/memory/DECISIONS.md for the full log. -->
