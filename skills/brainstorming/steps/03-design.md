# Sub-phase 3: DESIGN
## Steps 8–11

---

### Step 8 — Create the design directory

Run:
```bash
mkdir -p docs/pdlc/design/[feature-name]
```

---

### Step 9 — Generate design documents

Generate three design documents based on the approved PRD and the tech stack from `CONSTITUTION.md`:

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

### Step 10 — Update PRD design doc links

Update `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` to fill in the Design Docs section with relative links to the three files just created.

---

### Step 11 — Design approval gate

Tell the user:

> "Design documents are ready in `docs/pdlc/design/[feature-name]/`:
> - `ARCHITECTURE.md`
> - `data-model.md`
> - `api-contracts.md`
>
> Please review them. Reply **approve** to continue to Plan, or provide feedback and I will revise."

Wait for explicit approval. Do not proceed to Plan until the user approves.

If the user provides feedback: revise the relevant design doc(s), save the updated files, and re-present for approval. Repeat until approved.

Update `docs/pdlc/memory/STATE.md`: Current Sub-phase → `Plan`.
