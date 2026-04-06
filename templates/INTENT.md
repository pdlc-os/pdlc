# Intent
<!-- pdlc-template-version: 2.1.0 -->
<!-- This file defines the core purpose of the product.
     It is set during /pdlc init and should rarely change.
     If the fundamental problem or user changes, update this file and record why in docs/pdlc/memory/DECISIONS.md.
     Claude reads this at the start of every Inception phase to anchor the Discover conversation. -->

**Project:** <!-- Your project name -->
**Created:** <!-- YYYY-MM-DD -->
**Last updated:** <!-- YYYY-MM-DD -->

---

## Project Name

<!-- Full name of the product or service. Include tagline if you have one.
     Example: "Folia — the personal finance tracker that doesn't judge you" -->

<!-- Your project name and tagline here -->

---

## Problem Statement

<!-- Describe the core problem this product solves. Be concrete — who is suffering, what is the pain,
     and why existing solutions fall short.
     Keep this to 3–5 sentences. Avoid solution language.
     Example:
       Small business owners spend 4–6 hours per week manually reconciling expenses
       in spreadsheets. Existing tools like QuickBooks are powerful but intimidating —
       they require accounting knowledge most owners don't have. The gap between
       "too simple" (a spreadsheet) and "too complex" (full accounting software) is
       where most small businesses live and struggle. -->

<!-- Your problem statement here -->

---

## Target User (Persona)

<!-- Describe your primary user in enough detail that Claude can make product decisions on their behalf.
     Include: who they are, what they know, what they want, and what frustrates them.
     Example:
       **Primary: The Bootstrapped Founder**
       - Solo founder or 2-person team at an early-stage B2B SaaS startup
       - Technical enough to read code but not their day job
       - Using multiple tools (Stripe, Linear, Notion) with no unified view
       - Frustrated by context-switching; wants answers fast, not dashboards
       - Will pay for something that saves 30 min/day; will churn if onboarding is > 5 min -->

<!-- Your target user persona here -->

**Secondary users (if any):**
<!-- Describe secondary users or leave this section blank -->

---

## Core Value Proposition

<!-- One or two sentences that capture why your target user would choose this over alternatives.
     Should complete the sentence: "Only [product] lets [target user] [achieve outcome] by [unique mechanism]."
     Example:
       "Only Folia lets bootstrapped founders see their true runway in under 30 seconds,
       by connecting directly to their bank and Stripe — with zero manual entry." -->

<!-- Your value proposition here -->

---

## What Success Looks Like

<!-- Define concrete, measurable outcomes for the first meaningful milestone (e.g. private beta, v1.0).
     Use specific metrics where possible.
     Example:
       - 50 active users in the first 30 days after launch
       - Average session time > 8 minutes (users are exploring, not bouncing)
       - 70% of users return within 7 days (sticky core loop working)
       - Time-to-value < 5 minutes (user sees their data on first visit)
       - NPS ≥ 40 from first 20 respondents
       - Zero Sev-1 bugs in the first 14 days post-launch -->

| Metric | Target | Timeframe |
|--------|--------|-----------|
| <!-- metric --> | <!-- target --> | <!-- e.g. 30 days post-launch --> |
| <!-- metric --> | <!-- target --> | <!-- timeframe --> |
| <!-- metric --> | <!-- target --> | <!-- timeframe --> |

---

## Out of Scope

<!-- List things this product explicitly will NOT do — at least for v1.
     This is as important as what it does. Being clear here prevents scope creep and
     helps Claude make tighter decisions during Discover.
     Example:
       - No mobile app in v1 (web only, mobile-responsive)
       - No multi-user/team support until v2
       - No custom reporting or data exports in v1
       - No integrations with accounting software (QuickBooks, Xero) in v1
       - No white-labelling -->

-
-
-

---

## Key Constraints

<!-- Real-world constraints that Claude must respect.
     Examples: budget, timeline, regulatory, technical, team size.
     Example:
       - Timeline: MVP must be shippable in 8 weeks with a 2-person team
       - Budget: No paid infrastructure over $200/month until first revenue
       - Regulatory: Cannot store raw bank credentials (must use OAuth / Plaid)
       - Team: Two engineers, no dedicated designer — UI must use a component library
       - Existing codebase: Must integrate with existing Rails API (not a greenfield) -->

-
-
-
