# Setup
## Steps 2–3

---

## Step 2 — Detect brownfield repository

Check whether this is an existing repository with pre-existing source code, or a brand new empty project.

Run:
```bash
git log --oneline -1 2>/dev/null && git ls-files | grep -v '^docs/pdlc/' | grep -v '^\.' | head -20
```

**If the output shows no files** (empty repo or only dotfiles/config): this is a **greenfield project**. Skip to Step 3.

**If the output shows existing source files** (any `.js`, `.ts`, `.py`, `.rb`, `.go`, `.rs`, `.java`, `.cs`, `.html`, `.css`, or similar): this is a **brownfield project**.

For a brownfield project, tell the user:

> "I can see this repository already contains code. I can perform a deep scan of the existing codebase to automatically generate your memory bank with real content — existing features, architecture, decisions, and tech debt — rather than starting from blank templates.
>
> **Would you like me to scan the existing repository before we continue?** (yes/no)
>
> - **Yes** — I'll analyse the codebase and pre-populate your memory files. You'll review and approve my findings before anything is written.
> - **No** — We'll continue with the standard Socratic questions and blank templates."

**If the user says yes:** run the full `skills/repo-scan/SKILL.md` protocol now. The repo scan will:
1. Map the repo structure and read key files
2. Synthesise findings into a structured summary
3. Present the summary for your review and approval
4. Use approved findings to pre-populate all memory files in Step 5

After the repo scan completes and the user approves the findings, **skip Step 4 (Socratic questions) and go directly to Step 5**, using the scan-generated files instead of template stubs. The scan findings are treated as pre-filled answers.

**If the user says no:** continue to Step 3 as normal.

---

## Step 3 — Create the directory structure

Create the following directories (use `mkdir -p` to create all levels at once):

```
docs/pdlc/memory/episodes/
docs/pdlc/prds/plans/
docs/pdlc/design/
docs/pdlc/reviews/
```

Run these commands:
```bash
mkdir -p docs/pdlc/memory/episodes
mkdir -p docs/pdlc/prds/plans
mkdir -p docs/pdlc/design
mkdir -p docs/pdlc/reviews
mkdir -p docs/pdlc/brainstorm
mkdir -p docs/pdlc/mom
mkdir -p docs/pdlc/archive/prds
mkdir -p docs/pdlc/archive/design
mkdir -p docs/pdlc/archive/reviews
mkdir -p docs/pdlc/archive/brainstorm
mkdir -p docs/pdlc/archive/mom
```

Confirm each directory was created. Tell the user which directories were created.

---

Return to `SKILL.md` and proceed to Step 4.
