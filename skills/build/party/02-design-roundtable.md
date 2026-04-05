# Party Mode: Design Roundtable

**Topic slug:** `design-roundtable`
**Trigger:** Optional per-task — offered after Step 6 (claim), before Step 9 (TDD build)
**Purpose:** Debate implementation approach before any code is written; surface architectural disagreements early

---

## When to Trigger

**Auto-suggest** the design roundtable when ANY of the following are true:
- The task has 3+ acceptance criteria
- The task labels span multiple domains (e.g. `backend,frontend` or `backend,devops`)
- The task description mentions words like "architecture," "design," "schema," "migration," "refactor," or "replace"
- The task's description references an external API or third-party integration
- The task is the first one to touch a new module or service introduced in the ARCHITECTURE.md

**Skip silently** (do not offer) when:
- The task is clearly mechanical: "add field X to table Y", "update copy on page Z", "bump dependency version"
- The task is a direct continuation of the previous task (same domain, same module, no new interfaces)

**Offer message** (when auto-suggest triggers):

> "This task looks non-trivial. Want a quick design roundtable before we start?
> Neo, Echo, and [domain agent] will debate the implementation approach — takes 2–3 minutes.
>
> - **Yes** — run roundtable, then build
> - **No** — start building now"

Wait for the user's answer. If no, proceed to Step 7.

---

## Participants

- **Neo** (always — leads)
- **Echo** (always — raises testability and regression concerns)
- Domain agent for this task's primary label (Bolt / Friday / Muse / Pulse)
- If the task spans two domains, include both domain agents (max 4 total)

---

## Context to Load

- Full task details: `bd show [task-id]`
- PRD: `docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md` — the user stories and ACs for this task
- Architecture doc: `docs/pdlc/design/[feature-name]/ARCHITECTURE.md`
- Data model: `docs/pdlc/design/[feature-name]/data-model.md`
- API contracts: `docs/pdlc/design/[feature-name]/api-contracts.md`
- CONSTITUTION.md §2 (coding standards) and §3 (architectural constraints)
- Any completed tasks this session (from STATE.md Phase History) — for context on what has already been built

---

## Round 1 — Approach Proposals

**Neo's opening (leads in Neo mode; spawned in subagent/solo mode):**

```
Contribution: Propose 2 implementation approaches for this task.
For each approach:
- Name it (1-3 words)
- Describe it in 2-3 sentences
- State the key tradeoff vs. the other approach
- Give your recommendation and why

Ground your proposals in the ARCHITECTURE.md constraints. Be opinionated.
```

**Domain agent's contribution:**

```
Contribution: From a [role] perspective, evaluate the two approaches Neo will propose
(or propose your own if you see a better option neither approach covers).
Specifically address:
- Which approach is easier to implement correctly
- Which approach is more consistent with the existing codebase patterns
- Any implementation trap or gotcha that Neo's high-level analysis might have missed
```

**Echo's contribution:**

```
Contribution: From a testing perspective, evaluate the implementation approaches.
Address:
- Which approach produces more testable units (pure functions, injected deps, etc.)
- Which approach has more edge cases to cover
- Whether either approach will require test infrastructure that doesn't exist yet
- Any acceptance criterion in the task that is hard to test regardless of approach
```

---

## Round 2 — Cross-talk (if approaches diverge)

If Neo and the domain agent propose different approaches, or Echo raises a testability concern that favors one approach over the other:

Spawn Neo with the domain agent's response and Echo's response. Ask:

```
Echo flagged [testability concern] and [domain agent] prefers approach [X] because [reason].
Does this change your recommendation? Make a final call: which approach should we use,
and what specific adjustments address Echo's concern?
```

---

## Consensus Failure

If after Round 2 Neo cannot converge on a single implementation approach — either because agents' contradictions remain unresolved or no clear synthesis is possible — do not proceed to Step 9. Read `skills/build/party/deadlock-protocol.md` and apply **Deadlock Type 3** for the Design Roundtable case. This requires human escalation with the exact disagreement framed as a forced choice before implementation begins.

---

## Output — Implementation Decision

After discussion, Neo (or orchestrator in subagent/solo) states the agreed implementation approach as a single decision:

```
IMPLEMENTATION DECISION — [task-id]

Approach: [name]
Summary: [2-3 sentences describing what will be built and how]
Key constraints to keep in mind during TDD:
- [constraint 1]
- [constraint 2]
Accepted tradeoff: [what we're knowingly giving up]
```

This decision is passed to Step 9 as the implementation plan — the builder starts TDD with this approach, not a blank slate.

Write the MOM file per `orchestrator.md`.

---

## Proceed

After the roundtable, return to **Step 7** (Choose execution mode) in `skills/build/SKILL.md`, carrying the Implementation Decision as context for Step 9.
