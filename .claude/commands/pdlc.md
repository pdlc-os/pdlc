---
name: pdlc
description: "PDLC — Product Development Lifecycle commands (init, brainstorm, build, ship)"
argument-hint: <command> [args]
---

Route to the correct PDLC skill based on the first word in `$ARGUMENTS`.

Parse `$ARGUMENTS` as: `<command> [remaining-args]`

| Command       | Action                                                         |
|---------------|----------------------------------------------------------------|
| `init`        | Read `skills/init/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `brainstorm`  | Read `skills/brainstorm/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `build`       | Read `skills/build/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| `ship`        | Read `skills/ship/SKILL.md` and execute it. Pass remaining args as `$ARGUMENTS`. |
| *(empty)*     | Read `docs/pdlc/memory/STATE.md` and resume from the last checkpoint per CLAUDE.md. |
| *(unknown)*   | Reply: "Unknown PDLC command: `<command>`. Available commands: `init`, `brainstorm`, `build`, `ship`." |

**Important:** The skill files are located relative to the PDLC plugin root. If this project has PDLC installed via npm, look for skills under the plugin's installed location. Otherwise, look in the project root's `skills/` directory.

When executing a skill, follow every instruction in its `SKILL.md` completely — treat the skill file as your primary prompt for that phase.
