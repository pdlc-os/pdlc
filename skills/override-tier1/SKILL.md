---
name: override-tier1
description: "Override a Tier 1 safety block with double-RED confirmation"
argument-hint: "<blocked command>"
---

You are executing a Tier 1 safety override. This is the most dangerous operation in PDLC. The argument passed is the command that was blocked: `$ARGUMENTS`

If `$ARGUMENTS` is empty, stop:
> "No command specified. Usage: `/pdlc override-tier1 \"<the blocked command>\"`"

---

## The Double-RED Confirmation Protocol

Tier 1 blocks exist because these actions can cause irreversible damage:
- Force-push to main/master (overwrites team history)
- DROP TABLE without migration (permanent data loss)
- rm -rf outside project scope (system damage)
- Deploy with failing test gates (broken production)
- Ship with hardcoded secrets (credential exposure)
- Ship with critical dependency vulnerabilities (security breach)

### Step 1 — Display the blocked command in red

Output in bold red:

> **\033[1;31m⛔ TIER 1 OVERRIDE REQUEST ⛔\033[0m**
>
> **Command:** `[the blocked command]`
> **Reason it was blocked:** [determine from the command pattern which Tier 1 rule it violated]
>
> **\033[1;31mThis action is potentially irreversible and dangerous.\033[0m**

### Step 2 — First confirmation (RED)

> **\033[1;31mConfirmation 1 of 2:\033[0m**
> Type **OVERRIDE** (all caps) to proceed. Anything else cancels.

Wait for the user's exact input. If they type anything other than `OVERRIDE`, stop:
> "Override cancelled. The command was not executed."

### Step 3 — Explain consequences

After the first confirmation, explain the specific consequences of this action:

- **Force-push to main:** "This will overwrite the remote main branch history. Any commits pushed by teammates since your last pull will be lost permanently."
- **DROP TABLE:** "This will permanently delete the table and all its data. There is no undo unless a backup exists."
- **rm -rf outside project:** "This will recursively delete files outside the project directory. Deleted files cannot be recovered."
- **Deploy with failing gates:** "This will deploy code that has not passed the required test gates. Production users will be affected by untested code."
- **Secrets in code:** "This will ship hardcoded credentials to the repository. Anyone with repo access can read them. Rotate these credentials immediately after."
- **Critical vulnerabilities:** "This will ship known critical security vulnerabilities to production. Attackers may exploit these."

### Step 4 — Second confirmation (RED)

> **\033[1;31mConfirmation 2 of 2:\033[0m**
> You understand the consequences. Type **I ACCEPT FULL RESPONSIBILITY** to execute the command. Anything else cancels.

Wait for the user's exact input. If they type anything other than `I ACCEPT FULL RESPONSIBILITY`, stop:
> "Override cancelled. The command was not executed."

### Step 5 — Execute and log

If both confirmations pass:

1. **Log the override** in STATE.md Phase History:
   ```
   | [now] | tier1_override | [current phase] | [sub-phase] | [feature] |
   ```
   
   Also append to Active Blockers (as a record, not a blocker):
   ```
   - [YYYY-MM-DD] TIER 1 OVERRIDE: [command] — approved by user with double-RED confirmation
   ```

2. **Record as a decision** — append to DECISIONS.md:
   ```markdown
   ### ADR-[NNN]: Tier 1 Override — [short description]
   
   **Date:** [today]
   **Source:** User (explicit override)
   **Phase:** [current phase]
   **Status:** Active
   
   **Decision:** Override Tier 1 safety block to execute: `[command]`
   **Context:** [the reason the block existed]
   **Risk accepted:** [the consequence explained in Step 3]
   ```

3. **Execute the command:**
   ```bash
   [the blocked command]
   ```

4. **Report result:**
   > "Tier 1 override executed. The action has been logged in STATE.md and DECISIONS.md.
   > Command: `[command]`
   > Result: [success/failure output]"

---

## Rules

- Both confirmations must be exact string matches. No fuzzy matching, no "close enough."
- The override is logged permanently — it cannot be hidden or deleted from STATE.md or DECISIONS.md.
- Each override is a separate ADR entry. If the same command is overridden multiple times, each gets its own entry.
- This skill should NEVER be invoked automatically by another skill. It must be triggered by the user explicitly typing `/pdlc override-tier1`.
