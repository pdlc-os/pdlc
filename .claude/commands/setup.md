---
name: setup
description: "Initialize PDLC for this project — alias for /pdlc init"
---

Read `${PDLC_PLUGIN_ROOT}/skills/init/SKILL.md` and execute it completely. Pass `$ARGUMENTS` through verbatim.

This is a thin alias for `/pdlc init`. All path-resolution rules from `${PDLC_PLUGIN_ROOT}/.claude/commands/pdlc.md` apply: paths inside the skill file referencing `skills/`, `agents/`, `templates/` are relative to the plugin root; paths under `docs/pdlc/` are relative to the project root.
