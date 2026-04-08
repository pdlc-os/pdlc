# Party Mode: Party Review

**Topic slug:** `party-review`
**Trigger:** Automatic — replaces the sequential review step (Step 12) once all tasks are complete
**Purpose:** Run all reviewers in parallel with cross-talk so interconnected findings are explicitly linked, not siloed

---

## Why This Replaces Sequential Review

In sequential review, each agent reviews in isolation. A Phantom security finding and a Neo architecture finding may be two symptoms of the same root cause — but neither agent sees the other's output, so they're filed separately and the link is lost. Party review runs agents in parallel, then cross-talks findings that share an underlying cause. The result is a tighter review file with fewer duplicate fix actions.

---

## Participants

The four always-on reviewers. All four participate in every party review — no exceptions.

- **Neo** — Architecture & PRD conformance (leads and synthesizes)
- **Echo** — Test coverage & quality
- **Phantom** — Security
- **Jarvis** — Documentation & API contracts

---

## Context to Load

Before spawning agents, gather all of the following:

- Completed task list (from STATE.md Phase History)
- Full feature branch diff: `git diff main..feature/[feature-name]`
- All commits on branch: `git log main..feature/[feature-name] --oneline`
- `docs/pdlc/memory/CONSTITUTION.md`
- `docs/pdlc/memory/DECISIONS.md`
- `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md`
- All files in `docs/pdlc/design/[feature-name]/`

Pass this full context to every agent spawn. Do not abbreviate the diff — reviewers need the actual changes.

---

## Round 1 — Parallel Review Passes

Spawn all four reviewers simultaneously. Each gets the same full context but a different review mandate:

**Neo's mandate:**
```
Contribution: Architecture & PRD conformance review of the full feature diff.
Check:
- Does the implementation match the ARCHITECTURE.md design? Flag any drift.
- Does the code satisfy every acceptance criterion in the PRD? Name any AC that is
  not clearly addressed by the implementation.
- Are there any cross-cutting concerns (error handling, logging, observability) that
  were applied inconsistently across the tasks?
- Does anything violate the architectural constraints in CONSTITUTION.md §3?
- Any tech debt introduced that should be logged?

Output your findings as a numbered list. Label each: [Critical | Important | Advisory].
```

**Phantom's mandate:**
```
Contribution: Security review of the full feature diff.
Check OWASP Top 10 surface against the changed code:
- Input validation: are all user-supplied or external inputs validated before use?
- Authentication: are all new endpoints/routes protected correctly?
- Authorization: can a user access or modify another user's data?
- Secrets: are any credentials, tokens, or keys present in the diff?
- Injection: SQL, command, LDAP, template injection surfaces?
- Insecure direct object references?
- Any new dependency introduced — is it known safe?

Output your findings as a numbered list. Label each: [Critical | Important | Advisory].
For Critical findings, include the exact file and line range.
```

**Echo's mandate:**
```
Contribution: Test coverage and quality review of the full feature diff.
Check:
- Is every acceptance criterion from the PRD covered by at least one test?
  Map each AC to the test(s) that cover it. Flag any AC with no test.
- Are the tests testing behavior (Given/When/Then) or just implementation details?
- Are there edge cases in the implementation that have no corresponding test?
- Any test that would pass even if the implementation were wrong (false confidence)?
- Regression risk: any change to shared utilities, middleware, or base classes
  that could break existing tests not in this feature's test suite?

Output your findings as a numbered list. Label each: [Critical | Important | Advisory].
```

**Jarvis's mandate:**
```
Contribution: Documentation and API contract review of the full feature diff.
Check:
- Are new public functions, methods, and classes documented?
- Do the API contracts in api-contracts.md match what was actually implemented
  (method, path, request/response schema, error codes)?
- Is the README updated if the feature changes how the system is used or set up?
- Are commit messages clear and in Conventional Commits format?
- Draft a CHANGELOG entry for this feature in Conventional Changelog format.

Output your findings as a numbered list. Label each: [Important | Advisory].
Also output the draft CHANGELOG entry as a separate section.
```

---

## Round 2 — Cross-talk

After collecting all four responses, identify **interconnected findings**: cases where two agents flagged the same underlying problem from different angles.

For each identified interconnection, spawn the two relevant agents with each other's finding:

```
[Agent A] flagged: [finding]
[Agent B] flagged: [finding]

These appear to be related. Do you agree they share a root cause?
If yes, what is the single fix that resolves both findings — and which finding
should be the primary one in the review file, with the other cross-referenced?
If no, explain why they are independent.
```

Also route any Critical finding from Phantom or Echo to Neo:

```
[Phantom/Echo] flagged a Critical issue: [finding]
Does this have architectural implications beyond the immediate fix?
Should it trigger a DECISIONS.md entry or a change to CONSTITUTION.md?
```

---

## Review File Output

After cross-talk, write the unified review file to:
```
docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md
```

Follow `templates/review.md` structure. For each finding:
- State the finding
- Label it: Critical / Important / Advisory
- Include the reviewer who raised it
- If it was cross-referenced with another agent's finding, note: "Linked with [Agent]'s finding #N — same root cause. Single fix resolves both."

Add the draft CHANGELOG entry (from Jarvis) as the final section.

**Writing quality pass:** Each agent's findings must follow their **Writing Quality Pass** (see `agents/*.md`). Findings should be concrete ("SQL injection via unsanitized `user_id` in `/api/orders`") not vague ("potential security issue in order service").

---

## Proceed

After writing the review file, return to **Step 13** (Review approval gate) in `skills/build/SKILL.md`.
Write the MOM file per `orchestrator.md`.

The MOM for party review captures: what each agent flagged, which findings were linked in cross-talk, and the final tally (Critical / Important / Advisory counts).
