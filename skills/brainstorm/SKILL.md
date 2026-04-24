---
name: brainstorm
description: "Run the Inception phase for a feature (Discover → Define → Design → Plan)"
argument-hint: <feature-name>
---

You are running the Inception phase for a feature. The argument passed to this skill is: `$ARGUMENTS`.

Use today's date as `[YYYY-MM-DD]` wherever dates appear in file names and metadata.

---

## Roadmap claim (who owns this feature)

Before any brainstorming, resolve which feature you own via the Beads claim lock. Beads is the **source of truth** for roadmap ownership — multiple developers on the same repo each run this block, and only one can hold a given feature at a time.

### Step A — Check existing claim held by the current user

```bash
bd list --claimed-by me --label roadmap --status in-progress --json
```

If the result contains **one entry** with a `roadmap` label and some `F-NNN` label:
- Store the feature ID and slug from that task as `[feature-id]` and `[feature-name]`.
- Print: "You already have `[feature-id]: [feature-name]` claimed — resuming your active claim."
- **Skip to the "Write the Roadmap Claim block" step below** (this handles session-crash recovery: the claim was made previously, STATE.md may or may not reflect it, we resume either way).

If the result has multiple entries, that's a conflict — present all entries to the user, ask which to resume, and close/release the others with `/pdlc release` before continuing.

### Step B — If no existing claim, claim the next priority feature

**If `$ARGUMENTS` is empty** (no explicit feature requested):

```bash
bd ready --label roadmap --json
```

Take the first entry (Beads orders by priority ascending, unclaimed first). Extract its `F-NNN` and slug. Then:

```bash
bd claim <bd-task-id>
```

If claim fails (another dev beat us): retry with the next ready entry.

**If `bd ready --label roadmap --json` returns an empty list**, distinguish three cases before reporting back to the user:

1. **Every roadmap task is claimed or shipped/dropped.** `bd list --label roadmap --json` returns tasks, but all have assignees or are in terminal status. Tell the user every feature is already claimed or shipped — offer `/pdlc release` for stale claims or suggest adding a new feature via `/pdlc decide`.

2. **No roadmap tasks exist at all.** `bd list --label roadmap --json` returns `[]`. Now check whether ROADMAP.md has features:

   If ROADMAP.md contains feature rows with status `Planned` or `In Progress`, this project was initialized before roadmap-claim support (pre-v2.11.0) and needs a one-time migration. Offer the upgrade bootstrap:

   > "This project has features in `ROADMAP.md` but no roadmap-level Beads tasks. That usually means the project was initialized before v2.11.0 added multi-dev claim coordination.
   >
   > I can bootstrap the Beads mirror now — one `bd create` per row with status `Planned` or `In Progress`, labels `roadmap` + `F-NNN` + `priority:N`. Existing `Shipped` and `Dropped` rows are marked as closed in Beads and are not claimable. This takes a few seconds and is safe to run any time.
   >
   > **Bootstrap roadmap Beads tasks now? (Y/n)**"

   On `y` / empty: iterate over ROADMAP.md Feature Backlog rows. For each:

   ```bash
   # Planned / In Progress rows → claimable
   bd create --title "F-NNN feature-slug" \
             --description "description from ROADMAP row" \
             --label roadmap --label F-NNN --label priority:N \
             --status planned

   # Shipped rows → closed, non-claimable (preserves history)
   bd create --title "F-NNN feature-slug" \
             --label roadmap --label F-NNN --label priority:N \
             --status shipped

   # Dropped rows → closed, non-claimable
   bd create --title "F-NNN feature-slug" \
             --label roadmap --label F-NNN --label priority:N \
             --status dropped
   ```

   For rows that already showed `In Progress` in ROADMAP.md with a `Claimed by` value, also `bd claim <task-id>` assigning to that email so the existing claim is preserved. If no `Claimed by` is recorded, leave the task unclaimed — the next `/pdlc brainstorm` run will claim it normally.

   After bootstrap completes, retry `bd ready --label roadmap --json` and continue the Step B claim flow.

   On `n`: proceed in the Step D fallback (legacy single-dev mode) and warn: "Roadmap claim coordination disabled for this session. Run `/pdlc doctor` to bootstrap later."

3. **ROADMAP.md itself has no feature rows.** This is a fresh project mid-init where roadmap ideation has not yet produced a backlog. Tell the user "No roadmap features yet — run `/pdlc init` to generate a backlog, then come back."

**If `$ARGUMENTS` is a feature slug or `F-NNN`** (explicit request):

Look up the matching Beads task:
```bash
bd list --label roadmap --json | jq '.[] | select(.labels[]? == "F-NNN") // select(.title | startswith("F-NNN "))'
```

Inspect its state:
- **Already claimed by me** → proceed as resume (same as Step A).
- **Claimed by someone else** → stop with: "`F-NNN` is held by `[claimer]` since `[claimed_at]`. Either wait, ask them to `/pdlc release F-NNN`, or pick a different feature."
- **Unclaimed and status `planned`** → `bd claim <task-id>` and proceed.
- **Status `shipped` or `dropped`** → refuse; point at `/pdlc rollback` or `/pdlc brainstorm <different-feature>`.

### Step C — Write the Roadmap Claim block to STATE.md immediately

As soon as `bd claim` succeeds (or you detected an existing claim in Step A), write to `docs/pdlc/memory/STATE.md`:

Replace the Roadmap Claim block's `_None held._` line with:

```markdown
- **Feature ID:** F-NNN
- **Beads task:** bd-NN
- **Claimed by:** <git config user.email>
- **Claimed at:** <current ISO 8601 UTC timestamp>
- **Branch:** (will be set at build pre-flight)
```

This write lands BEFORE any other step in brainstorm so a crash between claim and first artifact never orphans the claim. Also update:
- `Current Feature`: `[feature-name]`
- `Current Phase`: `Inception`
- `Current Sub-phase`: `Discover`
- `Last Checkpoint`: `Inception / Discover / [now ISO 8601]`

### Step D — Fallback when Beads is unavailable

If `bd` is not installed or returns non-zero on every call, fall back to the legacy single-dev flow: if `$ARGUMENTS` is empty, ask the user to name the feature; read ROADMAP.md to verify it's not already `Shipped` or `Dropped`; use the status column (`In Progress`) as the soft lock. Warn the user: "Beads unavailable — roadmap-claim coordination disabled. Install Beads for multi-dev safety."

---

The feature name (slug) must be kebab-case (lowercase, hyphens, no spaces). If Beads returns a title with spaces, convert it automatically (e.g. "user auth" → `user-auth`).

Store the feature slug as `[feature-name]`.

---

## Pre-flight: Sync check and load project context

**Remote sync check:** Before starting, read `skills/sync-check.md` and execute the sync check protocol. This verifies local main is current with origin/main. If behind, a team meeting assesses the remote changes and the user decides how to proceed.

Then read these three files completely:

1. `docs/pdlc/memory/CONSTITUTION.md` — for tech stack, architectural constraints, test gates, coding standards, **and Interaction Mode** (§9)
2. `docs/pdlc/memory/INTENT.md` — for the core problem, target user, and value proposition
3. `skills/interaction-mode.md` — for the Sketch/Socratic protocol that governs how every questioning step in this phase is delivered

If CONSTITUTION or INTENT is missing, stop and tell the user:

> "PDLC memory files not found. Please run `/pdlc init` first to set up this project."

### Determine `[interaction-mode]`

Look for `**Interaction Mode:** <Sketch|Socratic>` in CONSTITUTION.md §9.

- If present, store the value as `[interaction-mode]` and proceed.
- If missing (CONSTITUTION predates this setting), prompt the user once using the exact text from `skills/interaction-mode.md` "How to determine the active mode" section. Write the answer into CONSTITUTION.md §9 (this is the one-time prompt; the write itself counts as confirmation — no second Tier 2 prompt). Default to `Sketch` if the user presses Enter.

### Brainstorm log — create or resume

Store the brainstorm log path as `[brainstorm-log]` = `docs/pdlc/brainstorm/brainstorm_[feature-name]_[YYYY-MM-DD].md`

Check whether `[brainstorm-log]` already exists:

**If it exists:** Read it completely. Reconstruct the full context of what has been covered — which divergent ideas were generated, which Socratic questions were asked and answered, whether the adversarial review was run, what external context was ingested. Then tell the user:

> "Found an existing brainstorm log for `[feature-name]`. Resuming from where we left off.
> Last recorded section: [name the last populated section in the file]"

Skip any steps whose output is already captured in the log and resume from the first incomplete step.

**If it does not exist:** Create it now with this structure:

```markdown
---
feature: [feature-name]
date: [YYYY-MM-DD]
status: in-progress
last-updated: [now ISO 8601]
approved-by:
approved-date:
prd:
---

# Brainstorm Log: [Feature Name]

## Divergent Ideation
_Not run._

## Socratic Discovery
_In progress._

## Adversarial Review
_Not run._

## External Context
_None ingested._

## Discovery Summary
_Pending._
```

Run:
```bash
mkdir -p docs/pdlc/brainstorm
```

Save the file to `[brainstorm-log]`.

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Inception`
- **Current Feature**: `[feature-name]`
- **Current Sub-phase**: `Discover`
- **Last Checkpoint**: `Inception / Discover / [now ISO 8601]`

Update `docs/pdlc/memory/ROADMAP.md`: find the row matching `[feature-name]` and set its **Status** to `In Progress` and **Claimed by** to your git `user.email`. If no matching row exists, append a new row with the next available `F-NNN` ID, the feature name, status `In Progress`, your `user.email` in Claimed by, and `—` for Shipped/Episode. Also create the matching Beads roadmap task (same pattern as Init Step 6c.1). Update the file's **Last updated** date.

---

## Lead Agent Assignments

Inception has two lead agents with a handoff at the Define→Design boundary:

| Sub-phases | Lead Agent | Why |
|------------|-----------|-----|
| Discover + Define (Steps 0–8) | **Oracle** (Product Manager) | Problem framing, user discovery, requirements, PRD writing |
| Design + Plan (Steps 9–19) | **Neo** (Architect) | Architecture, data model, API contracts, task decomposition |

Read the lead agent's full persona from `agents/oracle.md` or `agents/neo.md` and embody their perspective throughout their sub-phases.

Before the first user-facing message, read `skills/formatting.md` for the visual patterns, then output a **Phase Transition Banner** for "BRAINSTORM" (with the feature name) followed by:

> **Oracle (Product Manager):** "Oracle here again! Time to brainstorm `[feature-name]`. I'll be leading Discover and Define — we're going to dig into the problem, talk to the right people (that's you!), and shape this into a solid PRD. Let's figure out what we're really building."

---

## Inception Flow

The Inception phase runs four sub-phases in strict sequence. Each sub-phase is defined in its own file under `skills/brainstorm/steps/`. Read each file completely and execute every step in it before moving to the next. Do not skip a sub-phase. Do not move forward past an approval gate without explicit human confirmation.

### Sub-phase 1 — DISCOVER (Lead: Oracle)

Before starting, output a **Sub-phase Transition Header** (per `skills/formatting.md`) for "DISCOVER".

Read `skills/brainstorm/steps/01-discover.md` and execute every step completely (Steps 0–6, where Step 0 is optional divergent ideation and Step 4 is edge case analysis).

Return here when the discovery summary is confirmed and STATE.md shows `Define`.

### Sub-phase 2 — DEFINE (Lead: Oracle)

Output a **Sub-phase Transition Header** for "DEFINE".

Read `skills/brainstorm/steps/02-define.md` and execute every step completely (Steps 7–8).

Return here when the PRD is approved and STATE.md shows `Design`.

### — HANDOFF: Oracle → Neo —

After the PRD is approved and before starting Design, output an **Agent Handoff** block (per `skills/formatting.md`) with:

> **Oracle (Product Manager):** "The PRD is locked and approved — great work getting the requirements nailed down! I had a blast shaping this with you. I'm handing you over to Neo now — there's nobody better to turn these requirements into a rock-solid architecture. You're in excellent hands."
>
> **Neo (Architect):** "Thanks, Oracle. Hey — Neo here, your Architect. I've read the PRD and I'm excited to get my hands on this. Time to translate all those requirements into architecture, data models, and API contracts. Let's design something we'll be proud to build."

### Sub-phase 3 — DESIGN (Lead: Neo)

Output a **Sub-phase Transition Header** for "DESIGN".

Read `skills/brainstorm/steps/03-design.md` and execute every step completely (Steps 9–12).

Return here when the design docs are approved and STATE.md shows `Plan`.

### Sub-phase 4 — PLAN (Lead: Neo)

Output a **Sub-phase Transition Header** for "PLAN".

Read `skills/brainstorm/steps/04-plan.md` and execute every step completely (Steps 13–19).

Inception is complete when STATE.md shows `Inception Complete — Ready for /pdlc build`.

---

## Rules

- Never generate a PRD, design doc, or plan without completing the Discover phase first.
- Never proceed past an approval gate without explicit human confirmation. "Looks good" counts as approval; "not yet" or silence does not.
- Do not create the feature branch during Inception — that happens at the start of Construction.
- If the user wants to change scope mid-Inception (after PRD is approved), update the PRD first and re-obtain approval before updating the design docs.
- The visual companion server runs only during Inception. It must be stopped before Inception ends (Step 18).
- The user can issue `/pdlc decide <text>` at any point during Inception to record a decision. This pauses the current flow, runs a full Decision Review Party, and after the decision is recorded, offers to resume Inception from the last STATE.md checkpoint. Any artifacts updated by the decision (PRD, architecture, roadmap) are automatically picked up on resume.
