#!/usr/bin/env node
// pdlc-statusline.js — PDLC statusLine hook for Claude Code
// Reads stdin JSON from Claude Code, outputs a formatted status string.
// Registered as a `statusLine` hook in Claude Code settings.

'use strict';

const fs = require('fs');
const path = require('path');

// ── ANSI helpers ────────────────────────────────────────────────────────────
const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const ORANGE = '\x1b[93m';  // bright yellow, renders orange-ish in most terminals
const RED_BLINK = '\x1b[31m\x1b[5m';

// ── Progress bar ─────────────────────────────────────────────────────────────
function buildBar(usedPct) {
  const total = 10;
  const filled = Math.round((usedPct / 100) * total);
  const empty  = total - filled;
  const bar    = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));

  let color;
  let suffix = '';
  if (usedPct >= 80) {
    color  = RED_BLINK;
    suffix = ' ☠';
  } else if (usedPct >= 65) {
    color  = ORANGE;
  } else if (usedPct >= 50) {
    color  = YELLOW;
  } else {
    color  = GREEN;
  }

  return `${color}[${bar}]${RESET}${suffix}`;
}

// ── STATE.md parsing ─────────────────────────────────────────────────────────
function parseStateMd(content) {
  let phase = null;
  let task  = null;

  const lines = content.split('\n');

  // Find "## Current Phase" section — the value is the first non-blank,
  // non-comment, non-heading line after the section header.
  let inPhaseSection = false;
  let inTaskSection  = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '## Current Phase') {
      inPhaseSection = true;
      inTaskSection  = false;
      continue;
    }
    if (trimmed === '## Active Beads Task') {
      inTaskSection  = true;
      inPhaseSection = false;
      continue;
    }
    // Any other ## header ends the active section
    if (trimmed.startsWith('## ')) {
      inPhaseSection = false;
      inTaskSection  = false;
      continue;
    }

    // Skip blank lines and HTML comments
    if (!trimmed || trimmed.startsWith('<!--')) continue;

    if (inPhaseSection && !phase) {
      phase = trimmed;
    }
    if (inTaskSection && !task) {
      task = trimmed;
    }

    // Stop as soon as both are found
    if (phase && task) break;
  }

  return {
    phase: phase || 'Unknown',
    task:  task  || 'none',
  };
}

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
    // If we can't read / parse stdin, output the "not initialized" fallback
    process.stdout.write(`PDLC │ Not initialized │ [░░░░░░░░░░] --%${RESET}\n`);
    process.exit(0);
  }

  const sessionId = input.session_id || 'unknown';
  const cwd       = input.cwd        || process.cwd();

  const bridgePath = `/tmp/pdlc-ctx-${sessionId}.json`;
  const stateMdPath = path.join(cwd, 'docs', 'pdlc', 'memory', 'STATE.md');

  // ── Read bridge file ────────────────────────────────────────────────────────
  let bridge = readBridge(bridgePath) || {};
  let usedPct = typeof bridge.used_pct === 'number' ? bridge.used_pct : 0;

  // ── Read STATE.md ───────────────────────────────────────────────────────────
  let stateExists = false;
  let phase = 'Unknown';
  let task  = 'none';

  try {
    const content = fs.readFileSync(stateMdPath, 'utf8');
    stateExists = true;
    const parsed = parseStateMd(content);
    phase = parsed.phase;
    task  = parsed.task;

    // used_pct is written by pdlc-context-monitor.js (PostToolUse hook)
    // which tracks tool calls and estimates token accumulation.
    // The statusline just reads it — it doesn't compute its own estimate.
  } catch (_) {
    stateExists = false;
  }

  // ── Build output string ─────────────────────────────────────────────────────
  if (!stateExists) {
    process.stdout.write(`PDLC │ Not initialized │ [░░░░░░░░░░] --%${RESET}\n`);
    process.exit(0);
  }

  // Truncate task title to 40 chars
  const taskDisplay = task.length > 40 ? task.slice(0, 37) + '...' : task;

  const bar    = buildBar(usedPct);
  const pctStr = String(usedPct).padStart(2, ' ') + '%';

  process.stdout.write(`${phase} │ ${taskDisplay} │ ${bar} ${pctStr}${RESET}\n`);
  process.exit(0);
}

main();
