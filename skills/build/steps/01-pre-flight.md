## Pre-flight: Sync check, load state and context

### Step 0 — Remote sync check

Read `skills/sync-check.md` and execute the sync check protocol. This verifies local main is current with origin/main before creating or switching to the feature branch. If behind, a team meeting assesses the remote changes and the user decides how to proceed.

### Step 1 — Read current state

Read `docs/pdlc/memory/STATE.md` completely.

Extract:
- **Current Feature**: the `[feature-name]` slug
- **Current Phase**: must be `Inception Complete — Ready for /pdlc build` or `Construction`

If **Current Feature** is `none` or the phase is not set to a Construction-ready state, stop and tell the user:

> "No active feature found. Please run `/pdlc brainstorm <feature-name>` first to complete the Inception phase before building."

If STATE.md indicates Construction is already in progress (phase is `Construction`), resume from the last checkpoint. Read the **Last Checkpoint** field and continue from the appropriate step below.

### Step 2 — Read CONSTITUTION.md

Read `docs/pdlc/memory/CONSTITUTION.md` completely. Note:
- Test gates (Section 7) — which layers must pass before Operation
- Architectural constraints (Section 3)
- Coding standards (Section 2)
- Definition of done (Section 5)

### Step 3 — Create the feature branch

Check if the feature branch already exists:
```bash
git branch --list feature/[feature-name]
```

If it does not exist, create it:
```bash
git checkout -b feature/[feature-name]
```

If it already exists (resuming), check it out:
```bash
git checkout feature/[feature-name]
```

Update `docs/pdlc/memory/STATE.md`:
- **Current Phase**: `Construction`
- **Current Sub-phase**: `Build`
- **Last Checkpoint**: `Construction / Build / [now ISO 8601]`

---

Return to `SKILL.md` and proceed to the BUILD LOOP.
