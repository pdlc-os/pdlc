# Generate Memory Files
## Steps 5–6

---

## Step 5 — Generate memory files

Using the answers from Step 4, create all 7 memory files. Use today's date (ISO format: YYYY-MM-DD) wherever a date is required.

### 5a. `docs/pdlc/memory/CONSTITUTION.md`

Create this file based on the `templates/CONSTITUTION.md` structure. Fill in the following from the user's answers:

- **Project name** (header and metadata): from question 1
- **Tech Stack table** (Section 1): parse the tech stack answer from question 4 and fill in rows. Infer reasonable layer labels. Leave rationale cells blank if none given.
- **Architectural Constraints** (Section 3): use the answer from question 5. If "none", leave the placeholder bullets.
- **Test Gates** (Section 7): check the boxes the user selected in question 6. Uncheck all others.
- **Safety Guardrail Overrides** (Section 8): populate the table with any items from question 7. If "none", leave the placeholder row.
- Set `Last updated:` to today's date.

Leave all other sections with their default placeholder text — do not remove comments or examples.

### 5b. `docs/pdlc/memory/INTENT.md`

Create this file based on the `templates/INTENT.md` structure. Fill in:

- **Project name**: from question 1
- **Problem Statement**: expand the one-sentence answer from question 2 into a 2–4 sentence description. Stay faithful to the user's answer — do not invent new problems.
- **Target User (Persona)**: use the answer from question 3. Format as "**Primary: [persona label]**" followed by the description.
- **Core Value Proposition**: draft one sentence in the "Only [product] lets [user] [achieve outcome]" format, derived from questions 1–3.
- **Created** and **Last updated**: today's date.

Leave the success metrics table and out-of-scope / constraints sections with placeholder text.

### 5c. `docs/pdlc/memory/STATE.md`

Create this file based on the `templates/STATE.md` structure. Set:

- **Current Phase**: `Initialization`
- **Current Feature**: `none`
- **Active Beads Task**: `none`
- **Current Sub-phase**: `none`
- **Last Checkpoint**: `Initialization / — / [today's date]T00:00:00Z`
- **Phase History table**: one row — today's timestamp, event `init`, Phase `Initialization`, Sub-phase `—`, Feature `none`
- **Last updated**: today's date and time (ISO 8601)

### 5d. `docs/pdlc/memory/ROADMAP.md`

Create this file with stub content:

```markdown
# Roadmap

**Project:** [project name from question 1]
**Last updated:** [today's date]

---

## Current Focus

<!-- Populated after first /brainstorm session. -->

---

## Planned Features

<!-- Add features here as they are defined via /brainstorm. -->

| # | Feature | Status | Target |
|---|---------|--------|--------|
| — | — | — | — |

---

## Completed Features

<!-- Auto-populated from docs/pdlc/memory/episodes/index.md after each ship. -->

<!-- None yet. -->
```

### 5e. `docs/pdlc/memory/DECISIONS.md`

Create this file with stub content:

```markdown
# Architectural Decision Log

**Project:** [project name from question 1]
**Last updated:** [today's date]

<!-- Decisions recorded here use a lightweight ADR format.
     Each entry: what was decided, why, what was considered and rejected.
     PDLC agents (Neo, Phantom, Jarvis) append entries here during Build and Review.
     Do not delete entries — mark superseded decisions as [SUPERSEDED by ADR-NNN]. -->

---

<!-- No decisions recorded yet. The first entries will appear after /brainstorm. -->
```

### 5f. `docs/pdlc/memory/CHANGELOG.md`

Create this file with stub content:

```markdown
# Changelog

**Project:** [project name from question 1]

<!-- Format: Conventional — newest entries at top.
     Each entry added by Jarvis during the Ship sub-phase.
     Format per release:

     ## v[X.Y.Z] — [YYYY-MM-DD]
     ### Added
     - ...
     ### Changed
     - ...
     ### Fixed
     - ...
     ### Breaking Changes
     - ... (only if applicable)
-->

---

<!-- No releases yet. -->
```

### 5g. `docs/pdlc/memory/OVERVIEW.md`

Create this file based on the `templates/OVERVIEW.md` structure. Fill in:

- **Project name**: from question 1
- **Project Summary**: a 1–2 sentence description derived from questions 1–3.
- **Last updated**: today's date

Leave the Active Functionality, Shipped Features, Architecture Summary, Known Tech Debt, and Decision Log Summary sections with their default placeholder text.

---

## Step 6 — Create the episodes index

Create `docs/pdlc/memory/episodes/index.md` with this content:

```markdown
# Episode Index

**Project:** [project name from question 1]
**Last updated:** [today's date]

<!-- This file is the searchable index of all PDLC feature episodes.
     Each row is auto-appended by PDLC during the Reflect sub-phase after a feature ships.
     Do not edit manually. -->

| # | Feature | Date Shipped | Episode File | PR | Status |
|---|---------|-------------|--------------|-----|--------|
| — | — | — | — | — | — |
```

---

Return to `SKILL.md` and proceed to Step 7.
