# Multi-Agent Code Review

## When this skill activates

Activate at the start of the **Review sub-phase** of Construction, immediately after all tests for the active Beads task have passed. Do not run review before tests pass — this is a hard ordering constraint.

This skill governs one full review cycle per task. If the human requests revisions after reading the review file, re-run only the affected reviewer domains (or all, if the change is broad), regenerate the review file, and re-present for approval.

---

## Protocol

### Step 1 — Establish context

Before any reviewer begins, load the following into context:

1. The active Beads task: `bd show [task-id]` — read title, description, acceptance criteria.
2. The PRD: `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` — check requirements, BDD stories, non-functional requirements, out-of-scope list.
3. `docs/pdlc/memory/CONSTITUTION.md` — rules, standards, definition of done.
4. `docs/pdlc/memory/DECISIONS.md` — architectural decisions already made; any deviation is a finding.
5. The design docs at `docs/pdlc/design/[feature-name]/` — ARCHITECTURE.md, data-model.md, api-contracts.md.
6. The full diff of all files changed in this task on the feature branch.

### Step 2 — Independent reviewer passes

Each reviewer operates independently within their domain. They do not wait for others. Run all four in parallel where possible. Each reviewer produces a list of findings — each finding has a title, description, affected file/line, and a severity note (Advisory / Recommended / Important — all are soft warnings; none are hard blocks).

**Neo — Architecture & PRD conformance**

Neo checks:
- Does the implementation match the architecture described in `docs/pdlc/design/[feature-name]/ARCHITECTURE.md`? Flag any divergence.
- Does the code implement what the PRD requires, and only what the PRD requires? Flag scope creep or missing requirements.
- Are any decisions recorded in `docs/pdlc/memory/DECISIONS.md` being violated or ignored?
- Is new tech debt being introduced? If so, is it intentional and documented?
- Are cross-cutting concerns (logging, error handling, config, auth) handled consistently with the rest of the codebase?
- Are module boundaries respected? Does new code reach across layers it should not?

**Phantom — Security**

Phantom checks against the OWASP Top 10 and general security hygiene:
- Injection: Is all user input validated and sanitized before use in queries, shell commands, or rendered output?
- Broken authentication: Are auth tokens validated correctly? Are session fixation, replay, and privilege escalation risks addressed?
- Sensitive data exposure: Are secrets, tokens, or PII exposed in logs, error messages, or API responses?
- Security misconfiguration: Are default credentials used? Are error pages leaking stack traces?
- Broken access control: Does the code enforce authorization at every access point, not just at the route level?
- Trust boundaries: Is data from external sources treated as untrusted until validated?
- Dependency risk: Are any new packages introduced that have known CVEs or unusual permissions?
- Are there any hardcoded secrets, API keys, or credentials anywhere in the diff?

**Echo — Test coverage & quality**

Echo checks:
- Does every acceptance criterion from the Beads task have at least one test?
- Are the Given/When/Then test names traceable to specific PRD user stories?
- Are edge cases covered: empty inputs, null values, boundary conditions, concurrent access, network failures?
- Are integration boundaries tested (not just mocked at every layer)?
- What is the regression risk? Have changes to shared utilities, base classes, or middleware been tested for downstream effects?
- Are there tests that are structurally present but not actually asserting meaningful behavior (i.e. tests that always pass regardless of implementation)?

**Jarvis — Documentation & API contracts**

Jarvis checks:
- Are all new public functions, methods, components, and APIs documented with inline comments or JSDoc/docstrings?
- If an API endpoint was added or changed: is `docs/pdlc/design/[feature-name]/api-contracts.md` up to date?
- Is the CHANGELOG entry for this task ready to be written? (Jarvis prepares a draft entry.)
- Are README or setup instructions impacted by this change? If so, are they updated?
- Are type signatures, return values, and error states documented accurately?

### Step 3 — Consolidate findings

After all four reviewers complete their passes:

1. Collect all findings into a single list.
2. Group by reviewer (Neo / Phantom / Echo / Jarvis).
3. Within each group, order by severity: Important → Recommended → Advisory.
4. Include the builder agent(s) who implemented the task as a named participant. They do not generate separate findings but are listed as contributors for traceability.

### Step 4 — Write the review file

Write the review file to:
```
docs/pdlc/reviews/REVIEW_[task-id]_[YYYY-MM-DD].md
```

The file must contain:

```
# Review: [task-id] — [task title]
Date: [YYYY-MM-DD]
Feature: [feature-name]
Reviewers: Neo, Phantom, Echo, Jarvis + [builder agent name(s)]

## Summary
[2–4 sentence summary of overall code quality and readiness]

## Neo — Architecture & PRD Conformance
[Findings, or "No findings."]

## Phantom — Security
[Findings, or "No findings."]

## Echo — Test Coverage & Quality
[Findings, or "No findings."]

## Jarvis — Documentation & API Contracts
[Findings, or "No findings." + draft CHANGELOG entry]

## Consolidated Finding Count
Important: X | Recommended: Y | Advisory: Z

## Human Decision Required
For each Important or Recommended finding, list:
- Finding title
- Proposed resolution
- Options: [ ] Fix now  [ ] Accept and move on  [ ] Defer to tech debt
```

### Step 5 — Human approval gate

Present the review file path to the human. State: "Review complete. Please read `docs/pdlc/reviews/REVIEW_[task-id]_[YYYY-MM-DD].md` and approve, or request changes."

Wait. Do not proceed to the Test sub-phase or push PR comments until the human explicitly approves.

If the human requests changes: address them, regenerate the review file, and re-present.

### Step 6 — Post approval actions

After human approval:

1. If GitHub integration is active: push findings as PR comments via the GitHub integration. Only push findings the human has not marked "Accept and move on."
2. For any finding marked "Defer to tech debt": add an entry to `docs/pdlc/memory/DECISIONS.md` under a "Tech Debt" section with the finding, the rationale for deferral, and a suggested remediation approach.
3. Update `docs/pdlc/memory/STATE.md`: mark review as approved for this task.
4. Proceed to the Test sub-phase.

---

## Rules

- Review runs only after all tests pass. Never before.
- All findings are soft warnings. No finding hard-blocks the build. Human decides: fix, accept, or defer.
- Human must approve the review file before PR comments are pushed. Never push PR comments automatically without approval.
- Severity labels — Important, Recommended, Advisory — are not severity scores for automation. They are signals to the human to help prioritize decisions.
- The builder agent(s) are always listed in the review file as participants. This is for traceability, not blame.
- Phantom security findings marked "Accept" must be logged as Tier 3 guardrail events in `docs/pdlc/memory/STATE.md`.
- Echo test coverage gaps marked "Accept" must also be logged as Tier 3 guardrail events in `docs/pdlc/memory/STATE.md`.
- Do not re-run the full review cycle for trivial fixes (e.g. a variable rename). Use judgment: re-run only the affected reviewer domain(s) when the human requests a change.

---

## Output

- `docs/pdlc/reviews/REVIEW_[task-id]_[YYYY-MM-DD].md` — the full review file, approved by human.
- PR comments pushed (if GitHub integration active) for non-accepted findings.
- Any deferred tech debt recorded in `docs/pdlc/memory/DECISIONS.md`.
- `docs/pdlc/memory/STATE.md` updated to reflect review approval.
- Task ready to proceed to the Test sub-phase.
