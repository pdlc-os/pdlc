# Finalize
## Steps 7–9

---

## Step 7 — Initialize Beads

Run the Beads initialization script:
```bash
bash scripts/init-beads.sh
```

Parse the JSON output:
- `"status":"created"` — Beads initialized successfully with Dolt embedded mode. Report: `"Beads: ✓ initialized"`
- `"status":"already-exists"` — `.beads/` already present and database is healthy. Report: `"Beads: ✓ already initialized"`
- `"status":"repaired"` — database existed but was unhealthy, `bd doctor --fix` repaired it. Report: `"Beads: ✓ repaired"`
- `"status":"reinitialized"` — database was unhealthy and repair failed, re-initialized with `--force`. Report: `"Beads: ✓ re-initialized (previous database was unhealthy)"`
- `"status":"error"` — show the `message` to the user and tell them:

> "Beads initialization failed. Check the error above. Common causes: permissions issue in the project directory, or `bd`/`dolt` version mismatch. Run `bd doctor` to diagnose."

---

## Step 8 — Update STATE.md

Update `docs/pdlc/memory/STATE.md`:

- **Current Phase**: `Initialization Complete — Ready for /pdlc brainstorm`
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
  docs/pdlc/memory/METRICS.md
  docs/pdlc/memory/CHANGELOG.md
  docs/pdlc/memory/OVERVIEW.md
  docs/pdlc/memory/episodes/index.md

Directories created:
  docs/pdlc/memory/episodes/
  docs/pdlc/prds/plans/
  docs/pdlc/design/
  docs/pdlc/reviews/

Beads initialized: .beads/ created in project root.
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
  docs/pdlc/memory/METRICS.md
  docs/pdlc/memory/CHANGELOG.md     ← pre-PDLC baseline entry added
  docs/pdlc/memory/OVERVIEW.md      ← existing features documented
  docs/pdlc/memory/episodes/index.md

Beads initialized: .beads/ created in project root.

  ⚠  Inferred content is marked "(inferred — please verify)" throughout.
     Review INTENT.md and OVERVIEW.md before your first brainstorm session.
```

Replace counts (e.g. `[N] decisions`) with actual numbers from the scan.

Do **not** print a "Next step: run /pdlc brainstorm..." message — Step 10 in `SKILL.md` handles the transition to brainstorm automatically.

---

**Do not stop or wait for user input.** Return to `SKILL.md` and immediately proceed to Step 10 (Launch first feature or prompt).
