---
name: diagnose
description: "Run a comprehensive PDLC health check — alias for /pdlc doctor"
---

Read `${PDLC_PLUGIN_ROOT}/skills/doctor/SKILL.md` and execute it completely. Pass `$ARGUMENTS` through verbatim.

This is a thin alias for `/pdlc doctor` — named `/diagnose` to avoid shadowing Claude Code's built-in `/doctor` command. All path-resolution rules from `${PDLC_PLUGIN_ROOT}/.claude/commands/pdlc.md` apply.
