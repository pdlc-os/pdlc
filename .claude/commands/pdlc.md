---
name: pdlc
description: "PDLC — Product Development Lifecycle commands (init, brainstorm, build, ship)"
argument-hint: <command> [args]
---

Route to the correct PDLC skill based on the first word in `$ARGUMENTS`.

Parse `$ARGUMENTS` as: `<command> [remaining-args]`

**Plugin root:** `${PDLC_PLUGIN_ROOT}`

All skill file paths below are relative to the plugin root above.

| Command       | Action                                                         |
|---------------|----------------------------------------------------------------|
| `init`        | Read `${PDLC_PLUGIN_ROOT}/skills/init/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `brainstorm`  | Read `${PDLC_PLUGIN_ROOT}/skills/brainstorm/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `build`       | Read `${PDLC_PLUGIN_ROOT}/skills/build/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `ship`        | Read `${PDLC_PLUGIN_ROOT}/skills/ship/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `decision`    | Read `${PDLC_PLUGIN_ROOT}/skills/decision/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| *(empty)*     | Read `docs/pdlc/memory/STATE.md` and resume from the last checkpoint per CLAUDE.md. |
| *(unknown)*   | Reply: "Unknown PDLC command: `<command>`. Available commands: `init`, `brainstorm`, `build`, `ship`, `decision`." |

When executing a skill, follow every instruction in its `SKILL.md` completely — treat the skill file as your primary prompt for that phase.

**Path resolution rule:** All file paths referenced inside PDLC skill files (e.g. `skills/build/steps/01-pre-flight.md`, `agents/neo.md`, `templates/episode.md`) are relative to the **plugin root** above, NOT the project root. Prepend the plugin root when reading these files. Paths that start with `docs/pdlc/` are relative to the **project root** — these are the user's project files, not plugin files.
