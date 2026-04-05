# Step 4 — Edge case analysis

This step is **method-driven, not attitude-driven** — unlike the adversarial review, which takes a critical stance, edge case analysis is mechanical: exhaustively walk every branching path and boundary condition in the feature concept and report only the ones that lack explicit handling.

**Your role:** Pure path tracer. Do not comment on whether the feature design is good or bad. Only enumerate unhandled scenarios. Discard handled ones silently.

**Content to trace:** Everything captured so far — the feature concept, Socratic answers, adversarial follow-up answers, and divergent standouts (if run). Treat this as the full specification scope.

Walk every branching path across these edge case categories. Derive the relevant cases from the feature itself — do not apply a fixed checklist mechanically:

- **User flow branches** — alternative paths through the feature: cancel mid-flow, back-navigate, double-submit, timeout while waiting, session expiry during a multi-step flow
- **Empty and boundary data** — null/empty inputs, zero-item lists, single-item edge, maximum limits (length, size, count), values at exact boundaries (e.g. exactly the limit vs. one over)
- **Invalid and malformed inputs** — wrong type, unexpected format, SQL/script injection surface, encoding edge cases
- **Permission and access boundaries** — unauthenticated request, insufficient role, resource belonging to a different user/tenant, expired or revoked token mid-operation
- **Concurrency and timing** — two users acting on the same record simultaneously, a background job failing partway through, stale data read between write and commit, optimistic lock conflicts
- **Integration failure modes** — external API is down, returns an unexpected response format, times out, rate-limits the caller, returns a partial response
- **Scale and load conditions** — single item vs. thousands, paginated vs. bulk operations, large file/payload, slow network
- **Partial completion and rollback** — what if the operation succeeds on one side of a transaction but fails on the other; how does the system recover; is there an undo path
- **Migration and transition states** — data that existed before this feature was shipped, users mid-flow during a deploy, feature-flag partial rollout

For each unhandled path found, record:
- **Category** (from the list above)
- **Scenario** (one sentence describing the situation)
- **Trigger condition** (what causes this path to be reached, max 15 words)
- **Currently addressed?** (yes / no / partial — based on what was discussed in discovery)
- **Risk if unhandled** (what could actually go wrong, max 15 words)

Discard any path that was explicitly addressed in the Socratic answers or adversarial follow-ups.

Present findings in a table:

```
EDGE CASE ANALYSIS — [feature-name]

| # | Category | Scenario | Trigger Condition | Addressed? | Risk if Unhandled |
|---|----------|----------|------------------|------------|-------------------|
| 1 | ...      | ...      | ...              | No         | ...               |
```

After the table, ask the user to triage each unhandled finding into one of three buckets:

> "For each unhandled edge case, tell me how to handle it:
>
> - **In scope** — add to acceptance criteria in the PRD
> - **Out of scope** — explicitly exclude it with a note on why
> - **Known risk** — record it as a known risk / deferred item in the PRD
>
> You can respond with a list like: `1=in scope, 2=out of scope, 3=risk, 4=in scope` or address them one at a time."

Process the user's triage. For any item marked **in scope**, ask one targeted follow-up to capture enough detail to write an acceptance criterion (e.g. "What should happen when X? What's the expected system response?"). Do not ask follow-ups for out-of-scope or risk items.

Store the triage decisions as `[edge-case-triage]` — they feed directly into the PRD's Requirements, Acceptance Criteria, and Known Risks sections.

---

## Brainstorm log update

**When edge case analysis is complete**, append a new `## Edge Case Analysis` section to `[brainstorm-log]`:

````markdown
## Edge Case Analysis

**Completed:** [ISO 8601 timestamp]

### Findings

| # | Category | Scenario | Trigger Condition | Addressed? | Risk if Unhandled |
|---|----------|----------|------------------|------------|-------------------|
[table rows]

### Triage Decisions

| # | Decision | Notes |
|---|----------|-------|
| 1 | In scope | [acceptance criterion captured] |
| 2 | Out of scope | [reason] |
| 3 | Known risk | [deferred — reason] |
[repeat for each finding]
````

Update `last-updated` in the frontmatter to now.

Return to `01-discover.md` and proceed to Step 5.
