# Interaction Mode — Sketch vs Socratic

PDLC supports two interaction modes for any step that asks the user structured questions (Init setup, Brainstorm discovery, Bloom's design questioning, adversarial follow-ups, etc.). Both modes cover the **same depth** — they differ only in the conversational pattern.

| Mode | Who drafts first | Question cadence | Best for |
|------|-----------------|-----------------|----------|
| **Sketch** | Agent proposes answers from context; user confirms or overrides | Batched — all questions in a round presented at once | Users who prefer fewer turn-taking exchanges and are comfortable editing proposed drafts |
| **Socratic** | User answers from scratch | Sequential — one question at a time, wait for each answer | Users who prefer open-ended thinking and surfacing ideas through dialogue |

Both modes produce identical artifacts (same PRD sections, same brainstorm log structure, same adversarial findings). Agents still ask targeted follow-ups in both modes when answers are vague or surface new uncertainty.

---

## How to determine the active mode

Every step that asks structured questions **must** determine the active mode before starting.

1. Read `docs/pdlc/memory/CONSTITUTION.md` and look for the line `**Interaction Mode:** <Sketch|Socratic>` under §9 Context & Model Configuration.
2. If the line is missing (CONSTITUTION predates this feature, or the user hasn't chosen yet), prompt the user once:

   > "Which interaction mode do you prefer for PDLC's questions?
   >
   > - **Sketch** — I'll propose answers drawn from your existing context (CONSTITUTION, INTENT, CLAUDE.md, prior episodes), batch the questions per round, and you confirm or edit each one.
   > - **Socratic** — I'll ask one question at a time and you answer from scratch. More back-and-forth, no pre-drafts.
   >
   > Both go equally deep — this only changes the cadence. You can change it anytime by editing CONSTITUTION.md §9. (Default: Sketch)"

3. Write the choice to CONSTITUTION.md §9 as `**Interaction Mode:** <Sketch|Socratic>`. Update the file's **Last updated** date. (This write is a Tier 2 CONSTITUTION edit — the prompt itself counts as user confirmation, so proceed without a second confirm.)
4. Use this mode for the rest of the session.

If the user changes the mode mid-flow (e.g. edits CONSTITUTION.md between phases), the new mode takes effect at the next step that reads this file.

---

## Sketch mode — the pattern

For any step whose original instructions say "ask questions one at a time":

### Step A — Gather context

Before presenting the round, scan every source of context that might inform a reasonable default answer:

- `docs/pdlc/memory/CONSTITUTION.md` — tech stack, constraints, conventions
- `docs/pdlc/memory/INTENT.md` — problem, user, value prop
- `CLAUDE.md` (project root) — any existing project description
- `docs/pdlc/memory/ROADMAP.md` — feature IDs, dependencies
- `docs/pdlc/memory/episodes/index.md` and the 1–2 most recent episode files — patterns from prior features
- `docs/pdlc/brainstorm/brainstorm_*.md` — any in-progress or prior brainstorm logs
- The feature name and any user-supplied description

For each question in the round, draft a best-effort proposed answer. If the context genuinely does not support a draft, mark that question as `(no context — your input needed)` rather than inventing.

### Step B — Present the round as a single batched block

```
Round [N] — [Round Name]

I've drafted proposed answers from your existing context. Review, edit, or
replace anything that's off. You can respond inline — e.g.:

  1. accept
  2. replace with: [your answer]
  3. accept with edit: [your tweak]

Or respond with a free-form message that addresses each item.

─────────────────────────────────────────────────────────────────────────

Q1. [question text]
    Proposed: [drafted answer]
    Source:   [one short line — e.g. "CONSTITUTION §1 tech stack"]

Q2. [question text]
    Proposed: [drafted answer]
    Source:   [source]

Q3. [question text]
    Proposed: (no context — your input needed)

...
```

### Step C — Parse the user's response

- If the user accepts all proposals (single "accept", "looks good", "yes", or addresses each with acceptance): record the drafts as the final answers.
- If the user edits or replaces some: record the user's versions; keep drafts only for items explicitly accepted.
- If the user gives a free-form paragraph: extract which items they addressed, map them back to the questions, and re-prompt (still batched) for any question that is still unclear.
- If the user types a termination word (`skip`, `done`, `generate`, `draft`, `create`): record what has been answered, mark the rest as `TBD — skipped during discovery`, and proceed.

### Step D — Targeted follow-ups

Sketch mode keeps the agent's right to ask follow-ups — but batch them too. After a round, if 2–4 answers raise substantive follow-up concerns (vague metrics, unstated dependencies, thin scope), present them as a second batched block of ≤4 questions. Do not dribble follow-ups one at a time.

If only one follow-up is needed, ask it inline in the next message.

---

## Socratic mode — unchanged

Follow the step's original sequential instructions verbatim — one question per message, wait for each answer, ask follow-ups as they arise. This is the behavior PDLC shipped with before interaction modes existed.

---

## Rules that apply in both modes

- **Skip words always work:** `skip`, `done`, `generate`, `draft`, `create` halt questioning and proceed with what's collected.
- **Depth is identical:** Sketch does not cut questions. Every round asks the same minimum count as Socratic.
- **User override always wins:** In Sketch mode, a proposed answer is a draft — the user can reject or edit any of it. Never present a draft as a final answer.
- **Source attribution:** When proposing a draft, always cite the source (file + section) so the user can verify.
- **No invented facts:** If context doesn't support a draft, say so — do not hallucinate.
- **Mode per session, not per step:** Once determined, don't re-prompt for mode in the same session.

---

## For step authors

Steps that ask structured questions should:

1. Near the top, read this file and determine the active mode.
2. Provide the question content once (the text is the same in both modes).
3. Branch the *delivery* based on mode:
   - Socratic: "Ask the questions one at a time as written below."
   - Sketch: "Gather context per `skills/interaction-mode.md` Step A, then present the questions below as a single batched block per Step B."

You do not need to duplicate every prompt. Reference this file and let the running agent apply the pattern.
