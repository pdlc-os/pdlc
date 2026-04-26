# Safety Guardrail Reference

## When this skill activates

This skill is the authoritative reference for all three guardrail tiers. It is consulted by the guardrails hook (`hooks/pdlc-guardrails.js`) on every tool call and destructive operation. It is also referenced directly by all other skills when a potentially dangerous action is about to be taken.

When in doubt about whether an action requires a guardrail check: check this document first.

---

## Tier 1 — Hard Blocks

Tier 1 actions are **blocked by default**. They require the full double-RED confirmation protocol before PDLC will allow them to proceed. Even after confirmation, they are logged as Tier 1 events in `docs/pdlc/memory/STATE.md`.

> **Metadata-command short-circuit (applies to all Tier 1 and Tier 2 Bash rules below):** `git commit`, `git tag -m`, `gh release|pr|issue`, and `gh api` legitimately quote arbitrary text in their argument bodies — commit messages, release notes, PR descriptions. Those bodies routinely *describe* destructive operations (`rm -rf`, `git reset --hard`, `DROP TABLE`, `curl -X POST`) without executing them. The hook treats these outer commands as message-data wrappers and skips all Tier 1/Tier 2 Bash checks. Edit/Write tool checks on protected files are unaffected.

### Tier 1 actions:

**1. Force-push to main or master**
- Trigger: any `git push --force`, `git push -f`, or `git push --force-with-lease` targeting `main` or `master`.
- Why it's Tier 1: irreversibly rewrites shared history; other team members' local branches may become inconsistent; no recovery without a backup.

**2. DROP TABLE without a prior migration file**
- Trigger: any SQL `DROP TABLE` statement executed directly, or any ORM migration that calls `drop_table`, `dropTable`, or equivalent, without a corresponding migration file already committed to the repository.
- Why it's Tier 1: data destruction is irreversible without a backup. The migration file requirement ensures the action is intentional and tracked.

**3. rm -rf on files outside the current feature branch**
- Trigger: any `rm -rf` (or `rimraf`, `del -rf`, or equivalent) targeting paths that contain files not created or modified by the current feature branch.
- Determination: compare the target path against `git diff --name-only main...HEAD`. If the target contains files not in the diff, this is Tier 1.
- Why it's Tier 1: deletes work that exists outside the current change set, potentially destroying unrelated code, config, or data.
- **System temp-path exemption:** subpaths under `/tmp/`, `/var/tmp/`, `/var/folders/`, and their `/private/`-prefixed macOS canonical forms (e.g. `/private/var/folders/...`) are exempt — these directories are designed to be ephemeral, and blocking deletes inside them interrupts test fixtures and `mktemp -d` cleanup. Bare temp roots themselves (`rm -rf /tmp`) are not exempt; only subpaths.

**4. Deploy with failing test gates**
- Trigger: any attempt to execute Step 5 (Trigger CI/CD) in the Ship protocol when the Constitution test gates have not passed.
- Why it's Tier 1: shipping broken code to production can cause outages, data corruption, and customer impact.

---

## Tier 2 — Pause and Confirm

Tier 2 actions **pause execution** and require explicit human confirmation before proceeding. The human must type a clear "yes, proceed" (or equivalent affirmative) — PDLC does not accept ambiguous responses.

Tier 2 actions can be **downgraded to Tier 3** (proceed with logged warning only) by adding an explicit entry to `docs/pdlc/memory/CONSTITUTION.md` under a "Guardrail overrides" section. Example: `tier2_downgrade: rm_rf` downgrades all `rm -rf` actions to Tier 3 for this project.

### Tier 2 actions:

**1. Any rm -rf**
- Trigger: `rm -rf` or equivalent bulk-delete command targeting any path, regardless of scope.
- Pause message: "About to delete [target path] recursively. This will permanently remove all files and directories at that path. Confirm? (yes/no)"
- **System temp-path exemption:** same as Tier 1 rule 3 — subpaths of `/tmp/`, `/var/tmp/`, `/var/folders/`, and their `/private/`-prefixed canonical forms pass through silently (no pause, no log). Bare temp roots are still gated.

**2. git reset --hard**
- Trigger: `git reset --hard [any ref]`.
- Pause message: "About to run `git reset --hard [ref]`. This will discard all uncommitted changes and move HEAD to [ref]. This cannot be undone. Confirm? (yes/no)"
- **Temp-cwd exemption:** when the working directory is a subpath of `/tmp/`, `/var/tmp/`, `/var/folders/`, or their `/private/`-prefixed canonical forms, the reset passes through without confirmation. Scratch clones used for test fixtures have no real work to lose.

**3. Production database commands**
- Trigger: `psql`, `mysql`, `sqlite3`, or any ORM migration runner invoked with a production connection string (identified by: `DATABASE_URL` or `DB_URL` containing `prod`, `production`, or a non-localhost, non-test host; or connection strings explicitly labeled `prod` in env files).
- Pause message: "About to run a database command against what appears to be a production database ([connection hint]). Confirm? (yes/no)"

**4. External API write calls**
- Trigger: any HTTP `POST`, `PUT`, `PATCH`, or `DELETE` to an external URL (i.e. not `localhost` or `127.0.0.1`). Includes Slack webhooks, email APIs, payment processors, third-party services, GitHub API write calls.
- Pause message: "About to make a [METHOD] request to [URL]. This is an external write operation. Confirm? (yes/no)"

**5. Modifying CONSTITUTION.md or DECISIONS.md**
- Trigger: any write, edit, or overwrite of `docs/pdlc/memory/CONSTITUTION.md` or `docs/pdlc/memory/DECISIONS.md`. Files merely *named* CONSTITUTION.md or DECISIONS.md elsewhere on disk (test fixtures, unrelated user notes) are not the project's protected memory and do not trip this rule — the path must contain `docs/pdlc/memory/`.
- Pause message: "About to modify [file]. This changes the rules/decisions governing this project. Confirm? (yes/no)"
- **First-time-create exception:** a `Write` to a path that does not yet exist on disk is treated as Tier 3 (logged, not paused). `/setup` Step 5 generates these files from templates — there is no prior state to drift from, so Tier 2's protection doesn't apply. Subsequent overwrites or any `Edit` still pause and confirm.
- **Temp-cwd exemption:** when the working directory is a subpath of `/tmp/`, `/var/tmp/`, `/var/folders/`, or their `/private/`-prefixed canonical forms, Bash-redirection writes (rule 2e) to a `docs/pdlc/memory/CONSTITUTION.md` / `DECISIONS.md` path pass through without confirmation — typical of scratch clones used for test fixtures.

**6. Closing all open Beads tasks at once**
- Trigger: any command that marks all remaining open Beads tasks as done in a single operation (e.g. `bd done --all`, or a scripted loop closing every task).
- Pause message: "About to close all [N] open Beads tasks at once. This marks all remaining work as complete. Confirm? (yes/no)"

---

## Tier 3 — Logged Warnings

Tier 3 actions **proceed without interruption**. PDLC logs the event in `docs/pdlc/memory/STATE.md` under a "Guardrail log" section and continues.

Log format:
```
[YYYY-MM-DD HH:MM] Tier 3 event: [action description] — [context: task ID, phase, reason]
```

### Tier 3 actions:

**1. Skipping a test layer**
- Trigger: a test layer from the Test Execution Protocol is skipped for any reason.
- Log entry must include: which layer was skipped, who authorized the skip (human instruction or Constitution config), and the current task ID.

**2. Overriding a Constitution rule**
- Trigger: any action that explicitly deviates from a rule defined in `docs/pdlc/memory/CONSTITUTION.md`.
- Log entry must include: which rule was overridden, why, and who authorized the override.

**3. Accepting a Phantom security warning without fixing**
- Trigger: human marks a Phantom finding in a review file as "Accept and move on" without requesting a fix.
- Log entry must include: the finding title, the affected file, and the human's stated reason (if provided).

**4. Accepting an Echo test coverage gap**
- Trigger: human marks an Echo finding (test coverage gap or missing edge case) in a review file as "Accept and move on" without requesting a fix.
- Log entry must include: the finding title, the affected coverage area, and the human's stated reason (if provided).

**5. Editing STATE.md directly**
- Trigger: any write or edit of `docs/pdlc/memory/STATE.md` (via Edit, Write, Bash, or any other tool).
- Note: STATE.md is a working file that PDLC commands update frequently during phase transitions. It is Tier 3 (not Tier 2) to avoid interrupting PDLC's own operational flow.
- Log entry must include: what was changed and the current phase/step context.

---

## Override Protocol for Tier 1

When a Tier 1 action is detected, execute the following sequence exactly. Do not deviate.

**Step 1 — First RED warning**

Display the following (in bold/highlighted/red formatting):

```
[TIER 1 — HARD BLOCK]

You are about to perform a Tier 1 action:
  Action: [specific action description]
  Target: [specific target — file path, branch name, table name, etc.]
  Risk: [one sentence describing the irreversible consequence]

This action is classified as a hard block because it can cause irreversible damage.

To proceed, you must confirm twice.

Confirmation 1 of 2: Type exactly: "yes, I understand this is a Tier 1 action"
```

Wait for the human's response. Do not proceed until you receive the exact phrase.

**Step 2 — Validate first confirmation**

If the human typed exactly "yes, I understand this is a Tier 1 action" (case-insensitive): proceed to Step 3.
If the human typed anything else: treat as a cancellation. State: "Tier 1 action cancelled. No changes made." Stop.

**Step 3 — Second RED warning**

Display again (in bold/highlighted/red formatting):

```
[TIER 1 — HARD BLOCK — SECOND CONFIRMATION REQUIRED]

You are still about to perform:
  Action: [same action description as Step 1]
  Target: [same target as Step 1]
  Risk: [same risk as Step 1]

This is your second and final confirmation. Once you confirm, this action will execute immediately.

Confirmation 2 of 2: Type exactly: "yes, proceed"
```

Wait for the human's response.

**Step 4 — Validate second confirmation**

If the human typed exactly "yes, proceed" (case-insensitive): proceed to Step 5.
If the human typed anything else: treat as a cancellation. State: "Tier 1 action cancelled after first confirmation. No changes made." Stop.

**Step 5 — Execute and log**

Execute the action.

Immediately after execution, log to `docs/pdlc/memory/STATE.md`:

```
[YYYY-MM-DD HH:MM] Tier 1 event EXECUTED: [action description] — [target] — double-RED confirmation completed by human.
```

---

## Rules

- Tier classification is determined by the action type, not by context or intent. A force-push to main is always Tier 1, even if the human says "it's fine."
- Tier 1 double-RED confirmation cannot be scripted, pre-approved, or batch-confirmed. Each instance requires its own two-step confirmation.
- Tier 2 actions downgraded to Tier 3 via CONSTITUTION.md still get logged. Downgrading removes the pause, not the log entry.
- All Tier 1 and Tier 2 events (executed or cancelled) are logged in STATE.md. Tier 3 events are logged in STATE.md.
- If PDLC cannot determine whether an action is in scope for a tier (e.g. ambiguous target path), default to the higher tier and ask the human to clarify before proceeding.
- The guardrail system does not override human authority — it enforces deliberate decision-making. The human can always authorize a Tier 1 action; the protocol simply requires them to do so explicitly and twice.
