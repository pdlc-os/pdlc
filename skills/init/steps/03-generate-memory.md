# Generate Memory Files
## Steps 5–6

---

## Step 5 — Generate memory files

Using the answers from Step 4, create all memory files. Use today's date (ISO format: YYYY-MM-DD) wherever a date is required.

**Important:** Every template file in `templates/` contains a `<!-- pdlc-template-version: X.Y.Z -->` comment on the second line. Preserve this comment in every file you create — the upgrade command uses it to detect which template version was used and apply future migrations without destroying user customizations.

### 5a. `docs/pdlc/memory/CONSTITUTION.md`

Create this file based on the `templates/CONSTITUTION.md` structure. Fill in the following from the user's answers:

- **Project name** (header and metadata): from question 1
- **Tech Stack table** (Section 1): parse the tech stack answer from question 4 and fill in rows. Infer reasonable layer labels. Leave rationale cells blank if none given.
- **Architectural Constraints** (Section 3): use the answer from question 5. If "none", leave the placeholder bullets.
- **Test Gates** (Section 7): check the boxes the user selected in question 6. Uncheck all others.
- **Safety Guardrail Overrides** (Section 8): populate the table with any items from question 7. If "none", leave the placeholder row.
- **Interaction Mode** (Section 9): write `**Interaction Mode:** <Sketch|Socratic>` with the value chosen in Step 3.5. Default to `Sketch` if the user deferred.
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

Create this file with stub content (the full roadmap is populated in the next step during feature ideation):

```markdown
# Roadmap

**Project:** [project name from question 1]
**Last updated:** [today's date]

---

## Feature Backlog

<!-- Populated during roadmap ideation (Step 6). -->

| ID | Feature | Description | Priority | Status | Shipped | Episode |
|----|---------|-------------|----------|--------|---------|---------|
| — | — | — | — | — | — | — |

---

## Status Key

- **Planned** — Not yet started
- **In Progress** — Currently in brainstorm, build, or ship
- **Shipped** — Completed and deployed (date + episode link filled in)
- **Deferred** — Deprioritized or postponed
- **Dropped** — Removed from roadmap (reason noted)

<!-- None yet. -->
```

### 5e. `docs/pdlc/memory/DECISIONS.md`

Create this file with stub content:

```markdown
# Decision Registry

**Project:** [project name from question 1]
**Last updated:** [today's date]

<!-- PDLC Decision Registry (ADR format).
     Entries are appended by:
     - User: via /pdlc decide <text>
     - Agents: during Construction/Review (Step 14) and Reflect (Step 7)
     Each entry records: what was decided, who decided, why, what was considered,
     and what cross-cutting impacts were applied.
     This file is append-only. Mark superseded decisions as [SUPERSEDED by ADR-NNN]. -->

---

<!-- No decisions recorded yet. -->
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

### 5g. `docs/pdlc/memory/METRICS.md`

Create this file based on the `templates/METRICS.md` structure. Fill in:

- **Project**: from question 1
- **Last updated**: today's date

Preserve the `<!-- pdlc-template-version: X.Y.Z -->` comment from the template — this is used by the upgrade command to detect which version of the template was used.

---

## Trend Summary

<!-- Updated by Jarvis after every ship. Shows how the latest episode
     compares to the project average and the previous episode. -->

No trends yet — ship your first feature to start tracking.
```

### 5h. `docs/pdlc/memory/OVERVIEW.md`

Create this file based on the `templates/OVERVIEW.md` structure. Fill in:

- **Project name**: from question 1
- **Project Summary**: a 1–2 sentence description derived from questions 1–3.
- **Last updated**: today's date

Leave the Active Functionality, Shipped Features, Architecture Summary, Known Tech Debt, and Decision Log Summary sections with their default placeholder text.

### 5i. `docs/pdlc/memory/DEPLOYMENTS.md`

Create this file based on the `templates/DEPLOYMENTS.md` structure. Fill in:

- **Project name**: from question 1
- **Last updated**: today's date

Leave the Environments list, Cross-environment references, and Change Log sections with their template placeholders — Pulse populates them during the first Ship sub-phase. The file serves as scaffolding until a real deploy is recorded.

Preserve the `<!-- pdlc-template-version: X.Y.Z -->` comment for future upgrades.

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

## Step 5i — Generate scaffold CLAUDE.md

After the memory files are created, generate a lightweight scaffold `CLAUDE.md` at the project root. This gives Claude useful project context from the very first session, even before any code exists.

**If `CLAUDE.md` already exists at the project root**, skip this step — do not overwrite it.

Using the answers from the Socratic questions, create `CLAUDE.md`:

```markdown
# [Project Name]

<!-- pdlc-scaffold: true — This file was generated during PDLC initialization from Socratic answers. It will be expanded with architecture, conventions, and key files after the first brainstorm Design phase, and updated with actuals after each feature ships. -->

[1–2 sentence description derived from question 2 (problem statement) and question 3 (target user)]

## Tech Stack

- **Language:** [from question 4]
- **Framework:** [from question 4]
- **Database:** [from question 4, if mentioned]
- **Infrastructure:** [from question 4, if mentioned]

## Development

- **Install:** `[infer from tech stack, e.g. npm install, pip install -r requirements.txt]`
- **Test:** `[from question 6 — e.g. npm test, pytest]`

## Architectural Constraints

[From question 5. If "none", write "No constraints defined yet."]
```

This scaffold is intentionally minimal (~25–30 lines). It captures only what the user has confirmed. Sections like Architecture, Coding Conventions, Key Files, and Project Structure are **not included yet** — they will be added by brainstorm Step 12a after the Design phase produces real architecture docs.

---

## Transition to Roadmap Ideation

After all memory files, the episodes index, and the scaffold CLAUDE.md are created, **you must immediately continue** to the next step. Do not stop, do not wait for user input, and do not end your turn here.

Output the following to the user:

> "Memory files created ✓ — CONSTITUTION, INTENT, STATE, ROADMAP (stub), DECISIONS, CHANGELOG, METRICS, OVERVIEW, DEPLOYMENTS, episodes index, and scaffold CLAUDE.md are all in place.
>
> Now let's figure out **what to build**. I'm going to generate a starter list of candidate features based on everything you've told me."

Then return to `SKILL.md` and proceed to Roadmap Ideation (Steps 6a–6d) without pausing.
