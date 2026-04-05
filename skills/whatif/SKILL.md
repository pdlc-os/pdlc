---
name: whatif
description: "Explore a hypothetical scenario with a read-only team analysis"
argument-hint: <scenario text>
---

You are running a read-only "What If" analysis. The argument passed to this skill is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user: "What scenario would you like to explore? Describe the 'what if' in a sentence or two."

**This is a READ-ONLY exploration.** No files are modified, no decisions are recorded, no tasks are created or changed. The only artifact produced is a MOM file capturing the team's analysis.

## Lead Agent: mirrors current phase

The lead agent matches whoever is leading the current phase/sub-phase. Read `docs/pdlc/memory/STATE.md` to determine the active phase and sub-phase, then select the lead:

| Phase | Sub-phase | Lead Agent |
|-------|-----------|-----------|
| Initialization | any | **Oracle** (Product Manager) |
| Inception | Discover, Define | **Oracle** (Product Manager) |
| Inception | Design, Plan | **Neo** (Architect) |
| Construction | any | **Neo** (Architect) |
| Operation | Ship, Verify | **Pulse** (DevOps) |
| Operation | Reflect | **Jarvis** (Tech Writer) |
| Idle / between phases | — | **Oracle** (Product Manager) |

Read the lead agent's full persona from their agent file and embody their perspective throughout.

---

## Pre-flight

Read `docs/pdlc/memory/STATE.md` to capture current phase, sub-phase, feature, and last checkpoint.

If STATE.md does not exist, stop:
> "PDLC not initialized. Run `/pdlc init` first."

---

## Step 1 — Announce and set expectations

Read `skills/formatting.md` and output a **Sub-phase Transition Header** for "WHAT-IF ANALYSIS" followed by:

> **[Lead Agent Name] ([Role]):** "Interesting question. Let me gather the team for a read-only analysis — no changes will be made, we're just exploring the implications. I'll present the findings when they're done."

**If a phase is active** (not Idle):

> "Pausing **[phase] / [sub-phase]** at checkpoint `[last checkpoint value]`.
>
> If this session is interrupted:
> - Run `/pdlc whatif` — PDLC will detect the pending analysis and offer to resume
> - Run `[resume command]` — resumes the [phase] workflow from its last checkpoint"

**If no phase is active:**

> "If this session is interrupted, re-run: `/pdlc whatif [scenario text]`"

Then output a **Meeting Announcement Block** (per `skills/formatting.md`):
- **Called by:** [Lead Agent Name] ([Role])
- **Participants:** all 9 agents
- **Purpose:** Read-only analysis of: "[scenario text]"
- **Estimated time:** ~2–4 minutes

---

## Step 2 — What-If Analysis Meeting

Convene a party meeting following `skills/build/party/orchestrator.md` for spawn mode, agent roster, and the durable checkpoint protocol.

**Write the pending party file** per the orchestrator's durable checkpoint protocol with `meetingType: "whatif-analysis"`.

### 2a — Individual agent assessment

Each agent evaluates the scenario **hypothetically** — what would happen if this were implemented? No files are read for modification purposes; agents assess from their knowledge of the current codebase and project state.

| Agent | Analyzes | Questions to answer |
|-------|----------|-------------------|
| **Neo** (Architect) | Architecture impact | How would this change the system design? What components are affected? Any new dependencies? |
| **Oracle** (PM) | Product impact | How does this affect the roadmap, scope, user value? Does it change priorities? |
| **Bolt** (Backend) | Backend impact | What backend changes would be needed? DB schema? API changes? Migration complexity? |
| **Friday** (Frontend) | Frontend impact | What UI changes? State management? New components? Breaking changes to existing UX? |
| **Echo** (QA) | Test impact | What new tests would be needed? Which existing tests would break? Coverage gaps? |
| **Phantom** (Security) | Security impact | New attack surface? Auth changes? Data exposure risks? |
| **Jarvis** (Tech Writer) | Documentation impact | What docs would change? API docs? User-facing descriptions? |
| **Muse** (UX) | UX impact | How does this affect user flows? Mental model changes? Usability concerns? |
| **Pulse** (DevOps) | Ops impact | Deployment changes? Infrastructure? Environment config? CI/CD pipeline? |

Each agent produces:
```
Agent: [name]
Impact: [None / Low / Medium / High]
Summary: [2-3 sentences on what would change]
Effort estimate: [Trivial / Small / Medium / Large / Redesign]
Risks: [specific risks, or "None identified"]
```

### 2b — Team discussion

After individual assessments, the team discusses:
1. **Feasibility** — Is this achievable with the current architecture? Or would it require a significant redesign?
2. **Effort** — Rough consensus on total effort (sum of all agents' estimates)
3. **Risks** — Cross-cutting risks that span multiple agents' domains
4. **Trade-offs** — What would we gain vs. what would we lose?
5. **Recommendation** — Team's overall take: pursue, defer, modify, or abandon

### 2c — Write MOM

Write the MOM to: `docs/pdlc/mom/MOM_whatif_[scenario-slug]_[YYYY-MM-DD].md`

Generate `[scenario-slug]` from the scenario text (first 3-5 words, kebab-case, max 30 chars).

```markdown
# What-If Analysis: [Scenario title]

**Date:** [today YYYY-MM-DD]
**Scenario:** [full scenario text]
**Phase when asked:** [phase / sub-phase]
**Feature context:** [current feature, or — if none]
**Status:** Exploratory (read-only)

---

## Agent Assessments

### [Agent Name] ([Role])
- **Impact:** [None/Low/Medium/High]
- **Summary:** [2-3 sentences]
- **Effort estimate:** [Trivial/Small/Medium/Large/Redesign]
- **Risks:** [specific risks]

[repeat for each agent]

---

## Team Discussion

### Feasibility
[summary]

### Total Effort Estimate
[consensus estimate with breakdown]

### Cross-cutting Risks
[list]

### Trade-offs
- **Gains:** [what we'd get]
- **Costs:** [what we'd lose or spend]

### Team Recommendation
[Pursue / Defer / Modify / Abandon] — [rationale in 1-2 sentences]

---

## Next Steps
[What the user should consider — framed as options, not directives]
```

Update `.pending-party.json`: set `"progress": "mom-written"` and `"momFile": "[path]"`.

---

## Step 3 — Present findings

Synthesize the MOM into a concise summary for the user:

> **[Lead Agent Name] ([Role]):** "Here's what the team found:
>
> **Scenario:** [scenario text]
> **Overall impact:** [Low/Medium/High]
> **Effort estimate:** [consensus]
> **Team recommendation:** [Pursue/Defer/Modify/Abandon] — [one sentence rationale]
>
> **Key findings:**
> - [top 3-5 findings across all agents]
>
> **Risks:**
> - [top risks]
>
> Full analysis: `docs/pdlc/mom/MOM_whatif_[slug]_[date].md`
>
> What would you like to do?
> - **Explore further** — dig deeper into a specific aspect
> - **Accept as decision** — convert this into a formal decision (triggers the decision workflow)
> - **Discard** — file the analysis and get back to where you left off"

---

## Step 4 — Handle user's choice

### Explore further

Ask: "What aspect would you like to explore deeper?"

Take the user's input and run another What-If Analysis Meeting (back to Step 2) with a refined scenario that incorporates the original findings plus the new angle. The new MOM is written as a separate file with a `_v2`, `_v3` suffix.

Repeat until the user chooses Accept or Discard.

### Accept as decision

The user wants to convert this exploration into a formal decision. Execute the decision workflow from `skills/decision/SKILL.md` with these modifications:

- **Decision text:** use the scenario text as the decision
- **Source:** `User (explicit, via /pdlc whatif)`
- **Skip Step 2 (Decision Review Party):** The What-If meeting already produced a comprehensive assessment. Do NOT convene another meeting.
- **Use existing MOM:** In the ADR entry, set `MOM:` to point to the What-If MOM file (or the latest version if multiple rounds were run). The impact summary in the ADR should be derived from the What-If MOM, not from a new assessment.
- **Delete `.pending-party.json`** before entering the decision skill (the whatif meeting is done).
- **Run Step 1a of the decision skill** (write `.pending-decision.json`) so the decision has crash recovery. Set `"progress": "mom-written"` since the assessment is already complete.
- **Skip Step 1b** (checkpoint display — already shown by whatif Step 1).
- **Run Step 1c** (classify — source: `User (explicit, via /pdlc whatif)`).
- **Skip Step 2** (Decision Review Party — already done by whatif meeting).
- **Start execution from Step 3:** Present the What-If MOM findings as the impact assessment, ask the user to approve changes, then proceed through Steps 4 (record ADR), 5 (reconciliation), and 6 (summary and resume) normally.

This ensures:
- No duplicate meetings or MOM files
- Crash recovery via `.pending-decision.json` during Steps 3-6
- Step 6 reads STATE.md, informs the user it's resuming the paused workflow at Checkpoint A, and re-invokes the active phase's skill

### Discard

> **[Lead Agent Name] ([Role]):** "Analysis filed at `docs/pdlc/mom/MOM_whatif_[slug]_[date].md` for reference. Getting back to where we left off."

The MOM file is kept for future reference (it's read-only analysis, not a commitment).

Delete `.pending-party.json`.

**Resume previous workflow:**

Read STATE.md. If a phase was active:

> "Resuming **[phase] / [sub-phase]** from checkpoint `[last checkpoint value]`."

Re-invoke the active phase's skill (`/pdlc brainstorm`, `/pdlc build`, or `/pdlc ship`). The skill reads STATE.md and resumes from the last checkpoint.

If no phase was active: stop.

---

## Rules

- **Read-only.** The What-If skill never modifies project files (code, PRDs, design docs, ROADMAP.md, DECISIONS.md, STATE.md, Beads tasks). The only file it creates is the MOM.
- **No decisions recorded** unless the user explicitly chooses "Accept as decision."
- **MOM files are permanent** — even discarded analyses are kept for reference.
- When accepted as a decision, the What-If MOM is reused — never re-run the assessment.
- The durable checkpoint protocol applies: `.pending-party.json` is written before the meeting and deleted on completion.
- The lead agent mirrors the current phase lead, same as `/pdlc decision`.
