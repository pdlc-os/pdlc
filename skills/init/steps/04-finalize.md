# Finalize
## Steps 7–9

---

## Step 7 — Initialize Beads

Run: `bd init --quiet`

This creates the `.beads/` directory in the project root, which stores the task graph locally.

If `bd init` fails, show the user the error output and tell them:

> "Beads initialization failed. Check the error above. Common causes: permissions issue in the project directory, or `bd` version mismatch. Re-run `bd init` manually to debug."

If `bd init` succeeds, continue.

---

## Step 8 — Update STATE.md

Update `docs/pdlc/memory/STATE.md`:

- **Current Phase**: `Initialization Complete — Ready for /brainstorm`
- **Last Checkpoint**: `Initialization / Complete / [today's datetime ISO 8601]`
- **Last updated**: now

Append a row to the Phase History table:
```
| [now] | init_complete | Initialization Complete | — | none |
```

---

## Step 9 — Print initialization summary

Print a clear summary to the user.

**For greenfield projects (no repo scan):**

```
PDLC initialized successfully. ✓

Files created:
  docs/pdlc/memory/CONSTITUTION.md
  docs/pdlc/memory/INTENT.md
  docs/pdlc/memory/STATE.md
  docs/pdlc/memory/ROADMAP.md
  docs/pdlc/memory/DECISIONS.md
  docs/pdlc/memory/CHANGELOG.md
  docs/pdlc/memory/OVERVIEW.md
  docs/pdlc/memory/episodes/index.md

Directories created:
  docs/pdlc/memory/episodes/
  docs/pdlc/prds/plans/
  docs/pdlc/design/
  docs/pdlc/reviews/

Beads initialized: .beads/ created in project root.

Next step: run /pdlc brainstorm <feature-name> to start your first feature.
```

**For brownfield projects (repo scan ran):**

```
PDLC initialized successfully with repo scan. ✓

Memory bank pre-populated from existing codebase:
  docs/pdlc/memory/CONSTITUTION.md  ← tech stack + observed constraints filled in
  docs/pdlc/memory/INTENT.md        ← inferred from README + code (review & verify)
  docs/pdlc/memory/STATE.md
  docs/pdlc/memory/ROADMAP.md
  docs/pdlc/memory/DECISIONS.md     ← [N] pre-PDLC decisions recorded (inferred)
  docs/pdlc/memory/CHANGELOG.md     ← pre-PDLC baseline entry added
  docs/pdlc/memory/OVERVIEW.md      ← existing features documented
  docs/pdlc/memory/episodes/index.md

Beads initialized: .beads/ created in project root.

  ⚠  Inferred content is marked "(inferred — please verify)" throughout.
     Review INTENT.md and OVERVIEW.md before your first /pdlc brainstorm session.

Next step: run /pdlc brainstorm <feature-name> to start your first feature.
```

Replace counts (e.g. `[N] decisions`) with actual numbers from the scan.

---

Return to `SKILL.md` and proceed to Step 10.
