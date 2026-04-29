# Sub-phase 3: DESIGN
## Steps 9–12

---

### Step 9 — Create the design directory

Run:
```bash
mkdir -p docs/pdlc/design/[feature-name]
```

---

### Step 9a-pre — UX Discovery handoff (conditional)

Before starting Bloom's Taxonomy, check `[brainstorm-log]` for a `## UX Discovery` section.

**If UX Discovery completed** (section exists and is not marked `Skipped:`), Neo performs two pre-checks:

1. **DECISIONS.md candidate scan.** Search the brainstorm log's `## UX Discovery` → "Design Deviations" subsection for entries marked `DECISIONS.md candidate: yes`. For each one, present it to the user:

   > **Neo (Architect):** "Muse flagged this deviation as a DECISIONS.md candidate during UX Discovery:
   >
   > - **Deviation:** [text from log]
   > - **Established pattern:** [text from log]
   > - **Rationale:** [verbatim user reason from log]
   >
   > Should I record this in DECISIONS.md before we move on? (yes / no / let me adjust the rationale first)"

   If yes: invoke `/pdlc decide` with the deviation framed as a decision (a Decision Review Party will run; the resulting ADR is recorded in DECISIONS.md). After the decision lands, resume here.
   If no or "adjust": continue without recording. Note the user's choice in the brainstorm log so future audits can see the deliberate skip.

   If no candidates were flagged, skip this sub-step silently.

2. **Bloom's pre-flight prep.** Read the brainstorm log's `## UX Discovery` Q2 (User Flow) selection. Pass it as input to Bloom's Round 1 so Neo can build on the captured flow rather than re-asking the user to walk through it. The Bloom's file (`05-blooms-taxonomy-design.md`) already handles this — confirm the flow is loaded into working context before invoking it.

**If UX Discovery was skipped or absent**, skip this entire sub-step and proceed directly to Step 9a (Bloom's). Do not prompt the user about UX in Design — they already declined or the feature is non-UI.

---

### Step 9a — Bloom's Taxonomy design questioning

Before generating the design documents, Neo conducts a structured questioning round with the user to flesh out the architecture, data model, and API contracts. This uses a condensed Bloom's revised taxonomy — 3 rounds (Mechanics → Apply → Trade-offs and Judgments) plus a Synthesis closing step.

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
- Data flow: how data moves through the system for this feature's key user journeys (when UX Discovery captured the user flow, mirror its structure here so the system data flow and the user flow are aligned, not separately invented)
- Architectural decisions made for this feature (with rationale)
- How this conforms to the constraints in `CONSTITUTION.md` §3
- A Mermaid flowchart showing the high-level component interactions
- **UX-driven design decisions** *(conditional, only if UX Discovery completed)*: a dedicated section titled `## UX-Driven Design Decisions` with three subsections:
  - **Component Reuse**: list each existing component composed by the chosen layout/flow/state selections, naming the component and the shipped feature whose pattern it inherits. This makes the inheritance auditable.
  - **New Components**: list any new components this feature introduces (gaps where no existing component fit). For each, note the component's responsibility and which existing component family it should belong to going forward (so future features inherit *this* feature's additions).
  - **Design Deviations**: copy each deviation entry from the PRD's User Experience section verbatim. For deviations recorded in DECISIONS.md (per Step 9a-pre), link to the ADR by ID. For deviations the user declined to record, note the deliberate skip with the user's reason.

  Omit the entire `## UX-Driven Design Decisions` section if UX Discovery was skipped — do not leave an empty section.

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

### Step 10.5 — Threat Modeling Party (Phantom leads)

After the three design documents are generated and committed, **before** PRD link updates and the design approval gate, the team pressure-tests the design for security threats. Neo hands lead off to Phantom for the duration of this step; Phantom hands lead back at the end.

#### Neo → Phantom handoff (always)

Output an **Agent Handoff** block (per `skills/formatting.md`) before any threat-model work begins:

> **Neo (Architect):** "Phantom — design documents are generated and committed at `docs/pdlc/design/[feature-name]/` (`ARCHITECTURE.md`, `data-model.md`, `api-contracts.md`). Before we lock the design at Step 12, the team needs to pressure-test it for security threats. You're up — run the triage, and convene the party if it warrants. I'll continue Step 11 (PRD link updates) and walk us into the design approval gate at Step 12 once your threat model is in place. The three design docs are the source of truth for the trust-boundary walk, and if UX Discovery ran (Step 4.5), pull the user-flow diagram into your modeling — attackers think like users do."
>
> **Phantom (Security Reviewer):** "On it. I'll triage the new attack surface against ARCHITECTURE.md and data-model.md, decide whether a full party is warranted, and bring you back a `threat-model.md` plus MOM if we convene. If the triage comes out Skip, you'll have the file as a one-line record so the audit trail is complete either way."

#### Run the threat-modeling skill

Read `skills/brainstorm/steps/threat-model.md` and execute it completely. The skill handles its own triage (Skip / Lite / Full), runs the party if needed (using the existing party-mode orchestrator from `skills/build/party/orchestrator.md` and Progressive Thinking pattern from `skills/brainstorm/steps/discover/06-progressive-thinking.md`), writes `docs/pdlc/design/[feature-name]/threat-model.md`, and writes the MOM at `docs/pdlc/mom/MOM_threat-model_[feature-name]_[YYYY-MM-DD].md` if a full party convened.

The threat model uses the template at `templates/threat-model.md`. Preserve the `<!-- pdlc-template-version -->` comment as with all other templates.

#### Phantom → Neo handoff back (always)

After triage and (if applicable) the party complete, Phantom hands lead back to Neo. The exact text varies by triage outcome — see the three handoff variants in `skills/brainstorm/steps/threat-model.md` (Phase E). Neo resumes lead at Step 11 and carries all four design artifacts forward to the Step 12 approval gate.

---

### Step 11 — Update PRD design doc links

Update `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` to fill in the Design Docs section with relative links to **all four** design artifacts now in `docs/pdlc/design/[feature-name]/`:

- `ARCHITECTURE.md`
- `data-model.md`
- `api-contracts.md`
- `threat-model.md` *(always present — Skip mode produces a one-line record so the audit trail is complete)*

---

### Step 12 — Design approval gate

Tell the user:

> "Design documents are ready in `docs/pdlc/design/[feature-name]/`:
> - `ARCHITECTURE.md`
> - `data-model.md`
> - `api-contracts.md`
> - `threat-model.md` *(triage outcome: [Skip / Lite / Full])*
>
> Please review them. The threat model surfaces [N] threats requiring decisions — for each, the party recommended a path (mitigate now / mitigate later / accept / transfer). You can confirm each recommendation, override it, or reject and require redesign. **Open questions for you** are listed at the bottom of `threat-model.md` — please address each before approval.
>
> Reply **approve** to continue to Plan, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed to Plan until the user approves.

If the user provides feedback on the design: revise the relevant design doc(s), save the updated files, and re-present for approval. Repeat until approved.

If the user provides feedback on the threat model (override a recommendation, add a missed threat, change a severity): update `threat-model.md` accordingly, fill in the **Approval Outcomes** table at the bottom of that file, and re-present. For any threat tagged "Mitigate later" or "Accept" after human decision, **draft an ADR entry in `docs/pdlc/memory/DECISIONS.md`** before proceeding — deferring or accepting known security debt is a deliberate decision worth durable record.

Update `[brainstorm-log]` frontmatter:
```
status: design-approved
last-updated: [ISO 8601 timestamp]
```

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Plan`.

### Step 12a — Expand CLAUDE.md with design context

This step enriches the project's `CLAUDE.md` with architecture, conventions, and key file information from the just-approved design documents. The behavior depends on what exists:

**If CLAUDE.md exists with `<!-- pdlc-scaffold: true -->` marker (normal greenfield flow):**

Read the existing scaffold. Also read `docs/pdlc/memory/CONSTITUTION.md`, `docs/pdlc/memory/INTENT.md`, the approved PRD, and the three design documents. **Expand the scaffold in place** — preserve the existing sections (project name, description, Tech Stack, Development, Architectural Constraints) and add new sections:

1. **Update Tech Stack**: Add `Key libraries` from design docs if not already listed.
2. **Update Development**: Add `Dev server`, `Build`, and `Deploy` commands if inferrable from the design docs.
3. **Add new sections** after the existing ones:

```markdown
## Project Structure

<!-- update after first build -->
[Describe the directory layout planned in the architecture doc. Focus on top 2 levels — which directories contain what.]

## Architecture

<!-- update after first build -->
[2–4 sentences from ARCHITECTURE.md — architectural style, key layers, data flow. Reference specific directories.]

## Coding Conventions

[From CONSTITUTION.md §5 — naming patterns, file organization, import style, error handling. List 3–6 conventions.]

## Key Files

<!-- update after first build -->
[List the main entry points, route definitions, schema files, and config files planned in the architecture. Use format: `path/to/file` — one-line description.]
```

4. **Remove the scaffold marker**: Replace `<!-- pdlc-scaffold: true ... -->` with `<!-- pdlc-expanded: true — Updated with architecture and design context. Actuals replace planned content after first ship. -->`

**If CLAUDE.md exists without the scaffold marker (brownfield, or user-created):**

The file was either generated by repo-scan or created by the user. Do not restructure it. Only add or update sections that are missing and that the design docs provide (Architecture, Coding Conventions, Key Files). Preserve all existing content.

**If CLAUDE.md does not exist (user deleted it, or init was run before this feature was added):**

Generate the full CLAUDE.md by combining the scaffold content (from CONSTITUTION + INTENT) with the design expansion (architecture, conventions, key files) in a single pass, following the full template from `skills/repo-scan/SKILL.md`.

**Subsequent features (CLAUDE.md already exists, no scaffold marker):** Skip this step. CLAUDE.md is updated during `/pdlc ship` after each feature lands.

**Rules:**
- **Size limit: 180 lines.** If the expanded content exceeds 180 lines, apply the overflow protocol in `skills/repo-scan/SKILL.md` (split overflowing sections into `.claude/docs/` sub-files with return directives, keep CLAUDE.md as the abbreviated entry point).
- Only include facts from the approved documents. Do not speculate.
- Do not duplicate PDLC-specific content (phases, agents, memory files) — that's in the PDLC plugin's own CLAUDE.md.
- Sections based on planned architecture (not yet built) are marked with `<!-- update after first build -->` so the ship phase knows to replace with actuals.

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
