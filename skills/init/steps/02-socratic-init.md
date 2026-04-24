# Socratic Initialization
## Step 4

---

## Step 4 — Socratic initialization

> **Skip this step if the user accepted the brownfield repo scan in Step 2.** The scan already generated the memory files. Jump to Step 6.

Read `skills/interaction-mode.md` completely. The `[interaction-mode]` captured in Step 3.5 determines how the questions below are delivered — the question content is identical in both modes, only the cadence differs.

Before starting, print this notice:

> **Tip:** You can type `skip` at any time to stop the questions and proceed with whatever information has been collected so far.

The seven initialization questions (ask each exactly as written):

1. "What is the name of your project?"
2. "In one sentence, what problem does it solve?"
3. "Who is your primary target user? (Describe them in 2–3 sentences: who they are, what they want, what frustrates them.)"
4. "What tech stack are you using? (e.g. Next.js + PostgreSQL + Vercel, or Rails + React + Heroku)"
5. "What are your non-negotiable architectural constraints, if any? (e.g. 'all business logic in service layer', 'no raw SQL in controllers', or 'none' if you have no constraints yet)"
6. "Which test layers do you want to enforce as required gates — meaning Construction cannot move to Operation unless these pass? Choose from: Unit, Integration, E2E, Performance, Accessibility, Visual Regression. (Default: Unit + Integration. You can change this later in CONSTITUTION.md.)"
7. "Are there any Tier 2 safety actions you want to auto-approve for your team? These normally pause and wait for explicit confirmation before proceeding. The full list of Tier 2 actions is:
   - `rm -rf` or bulk deletes
   - `git reset --hard`
   - Running DB migrations in production
   - Changing CONSTITUTION.md
   - Closing all open Beads tasks at once
   - External API calls that write/post/send (Slack, email, webhooks)

   List which of these (if any) you want to downgrade to Tier 3 (logged warning, no pause), or say 'none'."

### If `[interaction-mode]` is `Sketch`

Gather context first: read `CLAUDE.md` at the project root if it exists (project name, description, tech stack, architecture). Draft proposed answers for Q1–Q5 from that content where available. For Q6 propose the default `Unit + Integration`. For Q7 propose `none`. Any question without a context-backed draft is marked `(no context — your input needed)`.

Present all seven questions as a single batched block per `skills/interaction-mode.md` Step B. Always include the source line for drafted answers (e.g. `Source: CLAUDE.md — Tech Stack section`). Wait for one response that addresses the batch; parse acceptances, edits, and replacements. If any answer is still vague or ambiguous, ask a batched follow-up (≤4 questions) before moving on.

### If `[interaction-mode]` is `Socratic`

If `CLAUDE.md` exists at the project root, read it and extract any relevant context. Use it to pre-fill suggested answers per question:

> "[Question text]
>
> *(From your existing CLAUDE.md: [suggested answer])*
>
> Press Enter to accept, or type your own answer."

Ask the questions **one at a time**. Wait for a complete answer before asking the next. Do not batch.

### Termination (both modes)

After each answer (or batch response), check for `skip` (case-insensitive). If the user skips, stop and proceed to Step 5 with whatever has been collected. Leave unanswered fields as placeholders in the generated files.

Store all answers — including the `[interaction-mode]` chosen in Step 3.5. You will use them to fill in the memory files below, and will write `**Interaction Mode:** <Sketch|Socratic>` into CONSTITUTION.md §9.

---

**Do not stop or wait for user input.** Return to `SKILL.md` and immediately proceed to Steps 5–6 (Generate Memory Files).
