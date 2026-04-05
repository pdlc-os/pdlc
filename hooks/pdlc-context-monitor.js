#!/usr/bin/env node
// pdlc-context-monitor.js — PDLC PostToolUse hook for Claude Code
// Fires after every tool execution; injects context warnings when context usage
// is high, and auto-checkpoints STATE.md on CRITICAL.

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Bridge file helpers ───────────────────────────────────────────────────────
function readBridge(bridgePath) {
  try {
    const raw = fs.readFileSync(bridgePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function writeBridge(bridgePath, data) {
  try {
    fs.writeFileSync(bridgePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {
    // Best-effort
  }
}

// ── STATE.md checkpoint update ────────────────────────────────────────────────
// Replaces the JSON block inside the "## Context Checkpoint" section.
function updateContextCheckpoint(stateMdPath, sessionId) {
  try {
    let content = fs.readFileSync(stateMdPath, 'utf8');

    const checkpoint = {
      triggered_at: new Date().toISOString(),
      session_id:   sessionId,
      active_task:  null,   // hooks don't have task context — Claude fills this in
      sub_phase:    null,
      work_in_progress: null,
      next_action:  null,
      files_open:   [],
    };

    // Replace the JSON block inside the Context Checkpoint section.
    // The block starts with ```json and ends with ``` on its own line.
    const jsonBlock = '```json\n' + JSON.stringify(checkpoint, null, 2) + '\n```';
    const updated   = content.replace(
      /```json[\s\S]*?```/,
      jsonBlock
    );

    if (updated !== content) {
      fs.writeFileSync(stateMdPath, updated, 'utf8');
    }
  } catch (_) {
    // Best-effort — never crash the hook
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  let input = {};

  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (raw) input = JSON.parse(raw);
  } catch (_) {
    // Unreadable stdin — proceed normally
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const sessionId = input.session_id || 'unknown';
  const cwd       = input.cwd        || process.cwd();

  const bridgePath  = `/tmp/pdlc-ctx-${sessionId}.json`;
  const stateMdPath = path.join(cwd, 'docs', 'pdlc', 'memory', 'STATE.md');

  // ── Read bridge file ────────────────────────────────────────────────────────
  let bridge = readBridge(bridgePath);

  if (!bridge) {
    // First time we've seen this session — create defaults and proceed quietly
    writeBridge(bridgePath, { used_pct: 0, tool_count: 0, session_id: sessionId });
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const usedPct  = typeof bridge.used_pct   === 'number' ? bridge.used_pct   : 0;
  const toolCount = (typeof bridge.tool_count === 'number' ? bridge.tool_count : 0) + 1;

  // Write updated tool_count immediately (before any early exit)
  writeBridge(bridgePath, Object.assign({}, bridge, {
    tool_count: toolCount,
    session_id: sessionId,
  }));

  // ── Threshold checks ────────────────────────────────────────────────────────

  // CRITICAL: used_pct >= 80 — fire on every tool call (modulo 1 === 0 always true)
  if (usedPct >= 80) {
    // Auto-save checkpoint in STATE.md
    updateContextCheckpoint(stateMdPath, sessionId);

    const msg =
      `🚨 PDLC CRITICAL: Context at ${usedPct}% — PDLC is auto-saving your position. ` +
      `Please finish this tool call and then run /pdlc build to resume from STATE.md.`;

    process.stdout.write(JSON.stringify({ continue: true, systemMessage: msg }));
    process.exit(0);
  }

  // WARNING: used_pct >= 65 — fire every 5 tool calls
  if (usedPct >= 65 && toolCount % 5 === 0) {
    const msg =
      `⚠️  PDLC Context Warning: Context at ${usedPct}% — recommend wrapping up current task ` +
      `and saving state to docs/pdlc/memory/STATE.md before context compacts.`;

    process.stdout.write(JSON.stringify({ continue: true, systemMessage: msg }));
    process.exit(0);
  }

  // Normal: proceed without injection
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

main();
