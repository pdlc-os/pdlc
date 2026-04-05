# Socratic Initialization
## Step 4

---

## Step 4 — Socratic initialization

> **Skip this step if the user accepted the brownfield repo scan in Step 2.** The scan already generated the memory files. Jump to Step 6.

Before asking the first question, print this notice in blue text using ANSI escape codes:

```
\x1b[34mTip: You can type 'skip' at any time to stop the questions and proceed with whatever information has been collected so far.\x1b[0m
```

Ask the user the following questions **one at a time**. Wait for a complete answer before asking the next question. Do not batch questions together.

After each answer, check: **if the user's response is exactly `skip` (case-insensitive), stop asking questions immediately and proceed to Step 5 using whatever answers have been collected.** Leave unanswered fields as placeholders in the generated files.

Ask each question exactly as written:

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

Store all answers. You will use them to fill in the memory files below.

---

Return to `SKILL.md` and proceed to Step 5.
