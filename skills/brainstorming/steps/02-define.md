# Sub-phase 2: DEFINE
## Steps 6–7

---

### Step 6 — Generate the PRD draft

Read `[brainstorm-log]` completely before writing anything. Use it as the authoritative record of everything discussed — divergent standouts, Socratic Q&A, adversarial findings and follow-up answers, ingested external context, and the confirmed discovery summary. The PRD must reflect the full evolved understanding captured there, not just the last few messages in context.

Auto-generate a complete PRD draft from the brainstorm log. Use `templates/PRD.md` as the exact structure. Fill in every section:

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

---

### Step 7 — PRD approval gate

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
