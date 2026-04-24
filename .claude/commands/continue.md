---
name: continue
description: "Resume a paused feature — alias for /pdlc resume"
argument-hint: <feature-name>
---

Read `${PDLC_PLUGIN_ROOT}/skills/resume/SKILL.md` and execute it completely. Pass `$ARGUMENTS` through verbatim.

This is a thin alias for `/pdlc resume` — named `/continue` to avoid shadowing Claude Code's built-in `/resume` command. All path-resolution rules from `${PDLC_PLUGIN_ROOT}/.claude/commands/pdlc.md` apply.
