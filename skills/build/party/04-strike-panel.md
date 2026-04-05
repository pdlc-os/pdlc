# Party Mode: Strike Panel

**Topic slug:** `strike-panel`
**Trigger:** Automatic — fires on the 3rd failed test attempt, before presenting A/B/C to the human
**Purpose:** Diagnose the root cause and generate concrete ranked approaches so the human makes an informed decision, not a blind one

---

## When to Trigger

Inside Step 9c of the build loop: when the auto-fix attempt counter reaches 3 and the test is still failing.

Do NOT trigger on attempt 1 or 2 — those are normal TDD iteration. The strike panel fires only when the loop is genuinely stuck.

---

## Participants

- **Neo** (always — diagnosis lead)
- **Echo** (always — test failure specialist)
- Domain agent for the task's primary label (Bolt / Friday / Pulse)

Three agents. No more — this is a focused diagnosis session, not a broad review.

---

## Context to Load

Provide every agent with:
- The failing test: full test name, full test code
- The current implementation: the relevant file(s) and function(s)
- The full error output from all 3 attempts (verbatim — do not summarize)
- The acceptance criterion this test maps to (from the PRD)
- **Design Roundtable context (if available):** check `docs/pdlc/mom/` for a `[feature-name]_design-roundtable_mom_*.md` file for this task. If found, include the Implementation Decision from it. If not found, include the relevant section of `docs/pdlc/design/[feature-name]/ARCHITECTURE.md` instead, and note "No design roundtable was run for this task."

---

## Round 1 — Root Cause Diagnosis

Spawn all three agents in parallel. Each has a different diagnostic lens.

**Neo's mandate:**
```
Contribution: Architectural diagnosis.
Review the 3 error outputs and the current implementation. Answer:
1. What is the actual root cause of the failure — not the symptom, but the underlying
   reason the test keeps failing?
2. Is this a design problem (the implementation approach is wrong) or an
   implementation problem (the approach is right but the code has a bug)?
3. If it is a design problem: what is the correct design, stated in 2-3 sentences?
4. Propose one concrete approach to fix this. Be specific — name the function,
   class, or module that needs to change, and what the change is.
```

**Echo's mandate:**
```
Contribution: Test failure diagnosis.
Review the test code, the error output from all 3 attempts, and the implementation.
Answer:
1. Is the test itself correct? Does it test what the acceptance criterion requires,
   or is there a flaw in the test that is causing false failures?
2. Is the error consistent across all 3 attempts, or did it change? What does
   the pattern of errors tell us about what is and isn't working?
3. If the test is correct: what specific behavior is the implementation missing?
4. Propose one concrete approach to fix this. If you believe the test needs to
   change (not just the implementation), explain why and what the test should check.
```

**Domain agent's mandate:**
```
Contribution: Implementation-level diagnosis.
Review the current implementation code and the error output.
Answer:
1. What is the specific implementation bug — the line or lines where it goes wrong?
2. Is this a common pattern in this tech stack that has a known correct solution?
3. Propose one concrete approach to fix this, at the code level. Be specific:
   show or describe the exact change needed — not just the direction.
```

---

## Round 2 — Convergence Check

After the three responses, check whether the agents agree on the root cause:

**If they agree on root cause but propose different fixes:**
Skip spawning. Synthesize the three proposed fixes and rank them by:
1. Least risk of introducing new failures
2. Closest to the original design intent
3. Shortest implementation path

**If they disagree on root cause:**
Spawn Neo with Echo's and the domain agent's responses:

```
Echo believes the root cause is: [Echo's diagnosis]
[Domain agent] believes the root cause is: [domain agent's diagnosis]

Which diagnosis is correct, or is there a synthesis?
Make a final call on root cause and commit to one fix approach.
```

---

## Output — Ranked Approaches for Human

After diagnosis, produce exactly **3 ranked approaches** for the human. Even if agents converged on one fix, present three paths:

```
STRIKE PANEL DIAGNOSIS — [task-id] — [test name]

Root Cause: [1-2 sentences. Agreed diagnosis, or "Neo and Echo disagree — see
approach descriptions."]

──────────────────────────────────────────────
Approach 1 (Recommended): [name]
[2-3 sentences describing what changes and why this is preferred]
Risk: [what could go wrong with this approach]
──────────────────────────────────────────────
Approach 2: [name]
[2-3 sentences]
Risk: [what could go wrong]
──────────────────────────────────────────────
Approach 3 (Escalate): Hand it to the human
[Brief summary of what the human would need to do manually]
──────────────────────────────────────────────

Panel confidence: [High / Medium / Low — based on agent agreement]
```

Then present the human with:

> "(A) Implement approach 1 — [name]
> (B) Implement approach 2 — [name]
> (C) Take the wheel — I'll guide you
>
> What is your choice?"

Wait for the human's decision. Do not proceed without it.

Write the MOM file per `orchestrator.md`.

---

## Proceed

After human chooses A or B: implement the selected approach, then resume the TDD loop (attempt 4+, now reset with a fresh approach — the 3-strike cap resets after a human-approved direction change).

After human chooses C: human provides guidance; resume TDD with that guidance as context.

Return to **Step 9** (TDD: Build the task) in `skills/build/SKILL.md`.
