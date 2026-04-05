## REVIEW

Once `bd ready` is empty (all tasks complete):

### Step 12 — Run the Party Review

Read `skills/build/party/orchestrator.md` then `skills/build/party/03-party-review.md` and execute the full party review protocol.

The party review replaces the sequential four-pass review. All four agents (Neo, Echo, Phantom, Jarvis) run in parallel with cross-talk, producing a unified review file where interconnected findings are explicitly linked.

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

### Step 14 — Post-approval actions

After approval:
- If GitHub integration is configured: push non-accepted findings as PR comments
- For any finding marked "Defer": append an entry to `docs/pdlc/memory/DECISIONS.md` under a Tech Debt section
- Log accepted Phantom security warnings as Tier 3 events in STATE.md
- Log accepted Echo coverage gaps as Tier 3 events in STATE.md

Update `docs/pdlc/memory/STATE.md`:
- **Current Sub-phase**: `Test`
- **Last Checkpoint**: `Construction / Test / [now ISO 8601]`

---

Return to `SKILL.md` and proceed to the TEST section.
