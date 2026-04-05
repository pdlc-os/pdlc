## WRAP-UP

### Step 18 — Draft the episode file

Using `templates/episode.md` as the structure, draft:

`docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`

Determine the episode number `[NNN]` by reading `docs/pdlc/memory/episodes/index.md` and incrementing the last entry. If the index has no entries, start at `001`.

Fill in every section:
- **What Was Built**: a 3–6 sentence summary of what was designed, built, and shipped
- **Links**: PRD link, PR link (leave blank if not yet merged), review file link, design doc links
- **Key Decisions & Rationale**: list the significant decisions made during this feature, cross-referencing DECISIONS.md
- **Files Created**: list every new file added on the feature branch
- **Files Modified**: list every pre-existing file changed
- **Test Summary**: fill in the table from Step 15 results
- **Known Tradeoffs & Tech Debt**: from accepted/deferred findings in the review and test steps
- **Agent Team**: list which agents were active

Leave **Reflect Notes** blank — that section is filled during the Reflect sub-phase in `/ship`.

Set **Status**: `Draft`.

### Step 19 — Update STATE.md

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Construction Complete — Ready for /ship`
- **Current Sub-phase**: `none`
- **Active Beads Task**: `none`
- **Last Checkpoint**: `Construction / Complete / [now ISO 8601]`

Append to Phase History:
```
| [now] | construction_complete | Construction Complete | — | [feature-name] |
```

### Step 20 — Tell the user

> "Construction complete for `[feature-name]`.
>
> - All [N] tasks done in Beads
> - Review approved: `docs/pdlc/reviews/REVIEW_[feature-name]_[YYYY-MM-DD].md`
> - Episode draft ready: `docs/pdlc/memory/episodes/[NNN]_[feature-name]_[YYYY-MM-DD].md`"

Then immediately ask:

> "Would you like to move to Operation and ship `[feature-name]` now?
>
> - Say **yes** to begin immediately
> - Or type `/ship` at any time to start manually"

**If the user responds with "yes", "y", "sure", "go ahead", or any clear affirmative**:
→ Immediately begin executing the `/ship` flow without waiting for the user to type the command.

**If the user responds with "no", "not yet", "later", or any deferral**:
→ Acknowledge and stop:
> "No problem. The episode draft is ready for your review. Run `/ship` when you're ready to deploy."

---

Return to `SKILL.md`. Construction is complete.
