#!/usr/bin/env bash
# superclaude — PDLC-installed shortcut for `claude --dangerously-skip-permissions`.
# Invokes Claude Code with the permission-prompt layer disabled, so tool calls
# (Bash, Edit, Write) run without per-command confirmation. Use `claude` instead
# if you want the default confirmation behavior.
exec claude --dangerously-skip-permissions "$@"
