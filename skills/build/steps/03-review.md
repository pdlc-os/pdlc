## REVIEW

Once `bd ready` is empty (all tasks complete):

### Step 12 — Run the Party Review

Read `skills/build/party/orchestrator.md` then `skills/build/party/03-party-review.md` and execute the full party review protocol.

The party review replaces the sequential four-pass review. All four always-on agents (Neo, Echo, Phantom, Jarvis) run in parallel with cross-talk, producing a unified review file where interconnected findings are explicitly linked. **Muse joins conditionally** when `docs/pdlc/design/[feature-name]/ux-review.md` exists with Lite/Full triage from Step 10.6 — her mandate is the as-built UX audit (compare design-time scorecard against implementation, flag deltas, surface new findings only visible in real code); her scorecard delta + new findings append to the *As-Built Audit* section of `ux-review.md`. Custom and label-matched agents also join when applicable. P0 UX findings from Muse cannot be accepted-as-tradeoff — they block merge until fixed or `/pdlc override` invoked.

The review file is written to:
```
docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md
```

### Step 13 — Review approval gate

First check the review file for any **Critical** findings (labeled `[Critical]` by any agent). If any Critical findings exist:

> "Review complete, but **[N] Critical finding(s)** require resolution before proceeding:
>
> [list each Critical finding — agent, summary, file/location]
>
> Critical findings must be fixed. Please choose:
> - **Fix** — I address the Critical issues, regenerate the review, then re-present
> - **Override** — I acknowledge this is a Tier 1 override; I accept full responsibility (requires typing **OVERRIDE CRITICAL** to confirm)"

Do not present the Approve/Accept/Defer options until all Critical findings are resolved or explicitly overridden. Log any Critical override as a Tier 1 event in STATE.md.

If no Critical findings, present the standard gate:

> "Review complete. Please read `docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md` and decide:
>
> - **Approve** — ship as-is; post PR comments (if GitHub integration active)
> - **Fix** — I address the listed issues, regenerate the review, then re-present
> - **Accept warning** — ship despite Important/Advisory warnings (Tier 3 logged)
> - **Defer** — move items to tech debt log
>
> What is your decision?"

Wait for explicit human decision. Do not proceed to Test without approval.

If the user requests fixes: increment `[review-fix-cycles]`, address the issues, recommit to the feature branch, regenerate the review file, and re-present. If `[review-fix-cycles]` reaches 3 without resolving all Critical findings, read `skills/build/party/deadlock-protocol.md` and apply **Deadlock Type 4** (Unbounded Fix-Regenerate Loop) instead of attempting another fix cycle.

### Step 13a — Phantom security sign-off

After the review file is written but before presenting the approval gate, check Phantom's findings specifically:

**If Phantom flagged zero Critical or Important security findings:**
> "Phantom security sign-off: ✓ No critical or important security issues found."

**If Phantom flagged any Critical security findings:**
These are surfaced as part of the Critical findings gate in Step 13 — they must be resolved before the review can be approved.

**If Phantom flagged Important security findings but no Critical:**
These are presented as soft warnings in the standard gate, but add a specific Phantom summary:
> "Phantom security summary: [N] Important findings. Phantom recommends fixing before ship. These are soft warnings — you may accept them, but they will be logged."

This ensures security findings get explicit visibility rather than being mixed into the general findings list.

### Step 14 — Post-approval actions

After approval:
- If GitHub integration is configured: push non-accepted findings as PR comments
- Log accepted Phantom security warnings as Tier 3 events in STATE.md
- Log accepted Echo coverage gaps as Tier 3 events in STATE.md

**Record deferred findings as decisions:**

For each finding marked "Defer" or "Accept warning", record it in the Decision Registry using the full protocol in `skills/decide/SKILL.md`. For each entry, set:
- **Source**: `PDLC flow`
- **Phase**: `Construction`
- **Sub-phase**: `Review`
- **Agent**: the agent who raised the finding (Neo, Echo, Phantom, or Jarvis)
- **Decision text**: "Deferred: [finding summary]. Rationale: [user's stated reason for deferral]."

This triggers a **Decision Review Party** (Step 2 of the decision skill) where all agents assess cross-cutting impacts on their owned artifacts — code, tests, architecture, roadmap, documentation. The team produces a MOM, and the user reviews the impacts before the decision is recorded. The user may choose to fix instead of defer after seeing the full impact.

If multiple findings are deferred in the same review, batch them: run one Decision Review Party covering all deferrals together rather than one per finding.

Update `docs/pdlc/memory/STATE.md`:
- **Current Sub-phase**: `Test`
- **Last Checkpoint**: `Construction / Test / [now ISO 8601]`

**Write the Handoff** in `docs/pdlc/memory/STATE.md`. Overwrite the Handoff JSON block with:

```json
{
  "phase_completed": "Construction / Review",
  "next_phase": "Construction / Test",
  "feature": "[feature-name]",
  "key_outputs": [
    "docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md",
    "docs/pdlc/prds/PRD_[feature-name]_[YYYY-MM-DD].md"
  ],
  "decisions_made": ["[2-3 review decisions — e.g. 'Accepted 2 advisory warnings', 'Deferred XSS finding to tech debt']"],
  "next_action": "Run the test suite — read skills/build/steps/04-test.md",
  "pending_questions": []
}
```

Then check context usage: run `cat /tmp/pdlc-ctx-*.json 2>/dev/null | sort -t'"' -k4 -r | head -1`. If `used_pct` is **65% or above**, strongly recommend clearing:

> "**Context is at ~[X]% — strongly recommend clearing now.**
> Review is done. Type `/clear` and the next session will resume seamlessly from Test."

If below 65% or the bridge file doesn't exist, don't mention it.

---

Return to `SKILL.md` and proceed to the TEST section.
