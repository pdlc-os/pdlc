# Sub-phase 3: DESIGN
## Steps 9–12

---

### Step 9 — Create the design directory

Run:
```bash
mkdir -p docs/pdlc/design/[feature-name]
```

---

### Step 9a — Bloom's Taxonomy design questioning

Before generating the design documents, Neo conducts a structured questioning round with the user to flesh out the architecture, data model, and API contracts. This uses Bloom's revised taxonomy — 6 rounds progressing from foundational recall to creative synthesis.

Read `skills/brainstorm/steps/discover/05-blooms-taxonomy-design.md` and execute it completely.

Return here when the brainstorm log's `## Design Discovery (Bloom's Taxonomy)` section is populated (or the user typed `skip`).

---

### Step 10 — Generate design documents

Using the approved PRD, the tech stack from `CONSTITUTION.md`, **and the design discovery answers from Step 9a**, generate three design documents:

**9a. `docs/pdlc/design/[feature-name]/ARCHITECTURE.md`**

Document how this feature fits into the existing architecture. Include:
- Where this feature lives in the system (which layer, which service)
- What existing modules or services it integrates with or extends
- New modules or services introduced (if any) and their boundaries
- Data flow: how data moves through the system for this feature's key user journeys
- Architectural decisions made for this feature (with rationale)
- How this conforms to the constraints in `CONSTITUTION.md` §3
- A Mermaid flowchart showing the high-level component interactions

Use the tech stack from CONSTITUTION.md to ensure the architecture is specific to the actual stack, not generic.

**9b. `docs/pdlc/design/[feature-name]/data-model.md`**

Document any new or modified data structures. Include:
- New database tables or collections, with all columns/fields and their types
- Modifications to existing tables (new columns, index changes)
- Relationships (foreign keys, references) and cardinality
- A Mermaid entity-relationship diagram
- Migration notes: what migration file(s) will be needed
- Any data that is deliberately NOT persisted and why

If this feature requires no data model changes, write: "No data model changes. This feature operates on existing schema." and explain why.

**9c. `docs/pdlc/design/[feature-name]/api-contracts.md`**

Document any new or modified API endpoints. For each endpoint:
- Method and path
- Authentication requirements
- Request body schema (with field types, required/optional, validation rules)
- Response body schema for success (200/201)
- Response body schemas for each error case (400, 401, 403, 404, 500)
- Example request and example response
- Rate limiting or pagination notes (if applicable)

If this feature requires no new API endpoints, write: "No new API endpoints. This feature is [client-only / uses existing endpoints / etc.]" and explain.

---

### Step 11 — Update PRD design doc links

Update `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` to fill in the Design Docs section with relative links to the three files just created.

---

### Step 12 — Design approval gate

Tell the user:

> "Design documents are ready in `docs/pdlc/design/[feature-name]/`:
> - `ARCHITECTURE.md`
> - `data-model.md`
> - `api-contracts.md`
>
> Please review them. Reply **approve** to continue to Plan, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed to Plan until the user approves.

If the user provides feedback: revise the relevant design doc(s), save the updated files, and re-present for approval. Repeat until approved.

Update `[brainstorm-log]` frontmatter:
```
status: design-approved
last-updated: [ISO 8601 timestamp]
```

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Plan`.

### Step 12a — Generate or update CLAUDE.md

**First feature only (no CLAUDE.md exists at project root):** Generate a project-level `CLAUDE.md` at the repository root. This gives Claude persistent context about the project across all sessions.

Read `docs/pdlc/memory/CONSTITUTION.md` (tech stack, constraints, coding standards), `docs/pdlc/memory/INTENT.md` (problem, target user), the approved PRD, and the three design documents just approved. Synthesise into:

```markdown
# [Project Name]

[1–2 sentence description from INTENT.md problem statement and value prop]

## Tech Stack

- **Language:** [from CONSTITUTION.md §2]
- **Framework:** [from CONSTITUTION.md §2]
- **Database:** [from CONSTITUTION.md §2]
- **Infrastructure:** [from CONSTITUTION.md §2, if specified]
- **Key libraries:** [from CONSTITUTION.md §2 or design docs]

## Project Structure

[Describe the directory layout planned in the architecture doc. Focus on top 2 levels — which directories contain what.]

## Development

- **Install:** `[install command — infer from tech stack, e.g. npm install]`
- **Dev server:** `[start command]`
- **Build:** `[build command]`
- **Test:** `[test command(s) from CONSTITUTION.md §7]`

## Architecture

[2–4 sentences from ARCHITECTURE.md — architectural style, key layers, data flow. Reference specific directories.]

## Coding Conventions

[From CONSTITUTION.md §5 — naming patterns, file organization, import style, error handling. List 3–6 conventions.]

## Key Files

[List the main entry points, route definitions, schema files, and config files planned in the architecture. Use format: `path/to/file` — one-line description.]
```

**Rules:**
- **Size limit: 180 lines.** If the generated content exceeds 180 lines, apply the overflow protocol in `skills/repo-scan/SKILL.md` (split overflowing sections into `.claude/docs/` sub-files with return directives, keep CLAUDE.md as the abbreviated entry point).
- Only include facts from the approved documents. Do not speculate.
- Do not duplicate PDLC-specific content (phases, agents, memory files) — that's in the PDLC plugin's own CLAUDE.md.
- For greenfield projects, some sections (Key Files, Project Structure) will be based on the planned architecture. Mark with `<!-- update after first build -->` so the ship phase knows to replace with actuals.

**Subsequent features (CLAUDE.md already exists):** Skip this step. CLAUDE.md is updated during `/pdlc ship` after each feature lands.

**Write the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block with:

```json
{
  "phase_completed": "Inception / Design",
  "next_phase": "Inception / Plan",
  "feature": "[feature-name]",
  "key_outputs": [
    "docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md",
    "docs/pdlc/design/[feature-name]/ARCHITECTURE.md",
    "docs/pdlc/design/[feature-name]/data-model.md",
    "docs/pdlc/design/[feature-name]/api-contracts.md"
  ],
  "decisions_made": ["[2-3 key architectural decisions — e.g. 'Supabase for auth + DB', 'Event-driven with webhooks']"],
  "next_action": "Read skills/brainstorm/steps/04-plan.md and break the feature into Beads tasks",
  "pending_questions": []
}
```

Then check context usage: run `cat /tmp/pdlc-ctx-*.json 2>/dev/null | sort -t'"' -k4 -r | head -1` to read the most recent bridge file. If `used_pct` is **65% or above**, strongly recommend clearing:

> "**Context is at ~[X]% — strongly recommend clearing now.**
> Your handoff is saved. Type `/clear` and the next session will resume seamlessly from Plan."

If below 65% or the bridge file doesn't exist, don't mention it.

---

Return to `SKILL.md` and proceed to Sub-phase 4 — PLAN.
