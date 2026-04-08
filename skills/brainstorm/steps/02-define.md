# Sub-phase 2: DEFINE
## Steps 7–8

---

### Step 7 — Generate the PRD draft

**Before doing anything else**, send this message to the user so they know work is in progress:

> "Discovery is locked. I'm now reading the full brainstorm log and drafting the PRD — this takes a moment since I'm synthesizing everything from Socratic discovery, adversarial review, edge cases, and the confirmed summary. Hang tight."

Then read `[brainstorm-log]` completely before writing anything. Use it as the authoritative record of everything discussed — divergent standouts, Socratic Q&A, adversarial findings and follow-up answers, ingested external context, and the confirmed discovery summary. The PRD must reflect the full evolved understanding captured there, not just the last few messages in context.

Auto-generate a complete PRD draft from the brainstorm log. Use `templates/PRD.md` as the exact structure.

**Write the PRD incrementally, section by section.** After writing each section to the file, send a short progress message to the user so they can see work is happening. Use this exact pattern:

1. Create the file with frontmatter + **Overview** + **Problem Statement** + **Target User** → message: `"✏️ Overview, Problem Statement, Target User — done."`
2. Append **Requirements** + **Assumptions** → message: `"✏️ Requirements, Assumptions — done."`
3. Append **Acceptance Criteria** → message: `"✏️ Acceptance Criteria — done."`
4. Append **User Stories** → message: `"✏️ User Stories — done."`
5. Append **Non-Functional Requirements** + **Known Risks** + **Out of Scope** → message: `"✏️ NFRs, Known Risks, Out of Scope — done."`
6. Append **Design Docs** (placeholder) + **Related Episodes** + **Approval** (blank) → message: `"✏️ PRD draft complete."`

Each write appends to the file in progress — do not rewrite the entire file on each step. The groupings above balance progress visibility with avoiding excessive messages.

Section requirements:

- **Overview**: 2–4 sentences connecting the feature to a goal in INTENT.md
- **Problem Statement**: concrete, feature-specific problem from the discovery
- **Target User**: from the discovery answer, cross-referencing INTENT.md personas
- **Requirements**: numbered list using MUST/SHOULD/MAY (RFC 2119). Derive from the discovery answers. Include any edge cases triaged as "in scope" from the Edge Case Analysis. Minimum 4 requirements.
- **Assumptions**: surfaced from the discovery session. Minimum 3.
- **Acceptance Criteria**: numbered, binary pass/fail conditions. Map 1:1 or 1:many with requirements. Include a criterion for each in-scope edge case. Minimum 4.
- **User Stories**: BDD Given/When/Then format. Label as US-001, US-002, etc. One story per major acceptance criterion group. Cross-reference AC numbers.
- **Non-Functional Requirements**: performance, security, accessibility derived from constraints and CONSTITUTION.md
- **Known Risks**: include any edge cases triaged as "known risk" from the Edge Case Analysis, with deferral reasoning
- **Out of Scope**: from the discovery answer, plus any edge cases triaged as "out of scope" — include a brief note on why each is excluded
- **Design Docs**: leave as template placeholder — will be filled in after Design sub-phase
- **Approval**: leave blank — to be filled by human

Set **Status**: `Draft` and **Date**: today's date.

Save the file to: `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`

Apply Oracle's **Writing Quality Pass** (see `agents/oracle.md`) before presenting the PRD for approval.

---

### Step 8 — PRD approval gate

Tell the user:

> "PRD draft is ready at `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
>
> Please review it. Reply **approve** to continue to Design, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed to Design until the user approves.

If the user provides feedback: revise the PRD, save the updated file, and re-present for approval. Repeat until approved.

When approved: update the PRD's **Status** field to `Approved` and record the approver's name/initials and date in the Approval section.

Update `[brainstorm-log]` frontmatter:
```
status: prd-approved
last-updated: [ISO 8601 timestamp]
approved-by: [approver name/initials from PRD Approval section]
approved-date: [ISO 8601 timestamp]
prd: docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md
```

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Design`.

**Write the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block with:

```json
{
  "phase_completed": "Inception / Define",
  "next_phase": "Inception / Design",
  "feature": "[feature-name]",
  "key_outputs": [
    "docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md",
    "docs/pdlc/brainstorm/brainstorm_[feature-name]_[date].md"
  ],
  "decisions_made": ["[2-3 top-level decisions from the PRD — e.g. 'BDD stories cover 4 user flows', 'NFR: p95 latency < 200ms']"],
  "next_action": "Read skills/brainstorm/steps/03-design.md and begin Bloom's Taxonomy design questioning",
  "pending_questions": ["[any items user flagged during PRD review, or empty]"]
}
```

Then check context usage: run `cat /tmp/pdlc-ctx-*.json 2>/dev/null | sort -t'"' -k4 -r | head -1` to read the most recent bridge file. If `used_pct` is **65% or above**, strongly recommend clearing:

> "**Context is at ~[X]% — strongly recommend clearing now.**
> Your handoff is saved. Type `/clear` and the next session will resume seamlessly from Design."

If below 65% or the bridge file doesn't exist, don't mention it.

---

Return to `SKILL.md` and proceed to Sub-phase 3 — DESIGN.
