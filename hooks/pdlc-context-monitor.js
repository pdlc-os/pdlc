#!/usr/bin/env node
// pdlc-context-monitor.js — PDLC PostToolUse hook for Claude Code
// Fires after every tool execution; estimates context usage from tool call
// patterns, injects warnings when usage is high, and auto-checkpoints
// STATE.md on CRITICAL.

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────────────────────────

// Defaults — overridden by CONSTITUTION.md §9 if available
let CONTEXT_WINDOW     = 1_000_000;  // tokens (1M for Opus 4.6)
let THRESHOLD_WARNING  = 50;         // warn every 5 tool calls
let THRESHOLD_CRITICAL = 65;         // warn every tool call + auto-checkpoint

// Read overrides from CONSTITUTION.md
function loadConfigFromConstitution(cwd) {
  try {
    const constitutionPath = path.join(cwd, 'docs', 'pdlc', 'memory', 'CONSTITUTION.md');
    const content = fs.readFileSync(constitutionPath, 'utf8');

    const windowMatch = content.match(/\*\*Context window \(tokens\):\*\*\s*(\d+)/);
    if (windowMatch) CONTEXT_WINDOW = parseInt(windowMatch[1], 10);

    const warnMatch = content.match(/\*\*Warning threshold:\*\*\s*(\d+)/);
    if (warnMatch) THRESHOLD_WARNING = parseInt(warnMatch[1], 10);

    const critMatch = content.match(/\*\*Critical threshold:\*\*\s*(\d+)/);
    if (critMatch) THRESHOLD_CRITICAL = parseInt(critMatch[1], 10);
  } catch (_) {
    // CONSTITUTION.md not found or unreadable — use defaults
  }
}

// Rough token estimates per tool call type
const TOKEN_ESTIMATES = {
  Read:         2000,   // average file read
  Grep:         500,    // search results
  Glob:         200,    // file list
  Bash:         1000,   // command output
  Edit:         300,    // small diff
  Write:        500,    // file content echoed back
  Agent:        3000,   // subagent response
  WebFetch:     2000,   // web content
  WebSearch:    500,    // search results
  NotebookEdit: 1000,   // notebook cell
  default:      500,    // unknown tool type
};

// Each conversation turn (user message + assistant response) costs roughly this
const TURN_OVERHEAD = 1500;

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
function updateContextCheckpoint(stateMdPath, sessionId, toolCount, usedPct) {
  try {
    let content = fs.readFileSync(stateMdPath, 'utf8');

    const checkpoint = {
      triggered_at:     new Date().toISOString(),
      session_id:       sessionId,
      tool_count:       toolCount,
      estimated_usage:  `${usedPct}%`,
      active_task:      null,   // hooks don't have task context — Claude fills this in
      sub_phase:        null,
      work_in_progress: null,
      next_action:      null,
      files_open:       [],
    };

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

// ── Estimate tokens from tool result ─────────────────────────────────────────
function estimateToolTokens(toolName, input, output) {
  let tokens = TOKEN_ESTIMATES[toolName] || TOKEN_ESTIMATES.default;

  // If we have actual output content, estimate from its length
  // Rough rule: 1 token ≈ 4 characters
  if (output && typeof output === 'string') {
    const outputTokens = Math.ceil(output.length / 4);
    tokens = Math.max(tokens, outputTokens);
  }

  // For Read tool, check if limit was specified (smaller reads = fewer tokens)
  if (toolName === 'Read' && input && input.limit) {
    tokens = Math.min(tokens, input.limit * 80); // ~80 chars per line
  }

  // For Agent tool, responses tend to be large
  if (toolName === 'Agent') {
    tokens = Math.max(tokens, 3000);
  }

  return tokens;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  let input = {};

  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (raw) input = JSON.parse(raw);
  } catch (_) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const sessionId  = input.session_id || 'unknown';
  const cwd        = input.cwd        || process.cwd();
  const toolName   = input.tool_name  || 'unknown';

  // Load context config from CONSTITUTION.md (overrides defaults)
  loadConfigFromConstitution(cwd);
  const toolInput  = input.tool_input || {};
  const toolOutput = (input.tool_result && input.tool_result.content) || '';

  const bridgePath  = `/tmp/pdlc-ctx-${sessionId}.json`;
  const stateMdPath = path.join(cwd, 'docs', 'pdlc', 'memory', 'STATE.md');

  // ── Read or initialize bridge file ──────────────────────────────────────────
  let bridge = readBridge(bridgePath);

  if (!bridge) {
    bridge = {
      session_id:      sessionId,
      tool_count:      0,
      estimated_tokens: 0,
      used_pct:        0,
      warnings_sent:   0,
      critical_sent:   false,
      started_at:      new Date().toISOString(),
    };
  }

  // ── Update counters ─────────────────────────────────────────────────────────
  const toolCount      = (bridge.tool_count || 0) + 1;
  const toolTokens     = estimateToolTokens(toolName, toolInput, toolOutput);
  const totalTokens    = (bridge.estimated_tokens || 0) + toolTokens + TURN_OVERHEAD;
  const usedPct        = Math.min(99, Math.round((totalTokens / CONTEXT_WINDOW) * 100));

  // Write updated bridge immediately
  writeBridge(bridgePath, {
    session_id:       sessionId,
    tool_count:       toolCount,
    estimated_tokens: totalTokens,
    used_pct:         usedPct,
    warnings_sent:    bridge.warnings_sent || 0,
    critical_sent:    bridge.critical_sent || false,
    started_at:       bridge.started_at || new Date().toISOString(),
    updated_at:       new Date().toISOString(),
  });

  // ── Threshold checks ────────────────────────────────────────────────────────

  // CRITICAL: >= 65% — fire every tool call, auto-checkpoint
  if (usedPct >= THRESHOLD_CRITICAL) {
    // Auto-save checkpoint in STATE.md
    updateContextCheckpoint(stateMdPath, sessionId, toolCount, usedPct);

    // Update bridge to record critical was sent
    writeBridge(bridgePath, {
      session_id:       sessionId,
      tool_count:       toolCount,
      estimated_tokens: totalTokens,
      used_pct:         usedPct,
      warnings_sent:    (bridge.warnings_sent || 0) + 1,
      critical_sent:    true,
      started_at:       bridge.started_at,
      updated_at:       new Date().toISOString(),
    });

    const msg =
      `🚨 PDLC CRITICAL: Context estimated at ~${usedPct}% (${toolCount} tool calls, ~${Math.round(totalTokens/1000)}K tokens). ` +
      `Auto-saving checkpoint to STATE.md. Finish the current step, then run /pdlc pause to save your position. ` +
      `The next session will resume from this checkpoint automatically.`;

    process.stdout.write(JSON.stringify({ continue: true, systemMessage: msg }));
    process.exit(0);
  }

  // WARNING: >= 50% — fire every 5 tool calls
  if (usedPct >= THRESHOLD_WARNING && toolCount % 5 === 0) {
    writeBridge(bridgePath, {
      session_id:       sessionId,
      tool_count:       toolCount,
      estimated_tokens: totalTokens,
      used_pct:         usedPct,
      warnings_sent:    (bridge.warnings_sent || 0) + 1,
      critical_sent:    bridge.critical_sent || false,
      started_at:       bridge.started_at,
      updated_at:       new Date().toISOString(),
    });

    const msg =
      `⚠️  PDLC Context Warning: ~${usedPct}% estimated (${toolCount} tool calls, ~${Math.round(totalTokens/1000)}K tokens). ` +
      `Consider finishing the current step, then run /pdlc pause to save your position cleanly.`;

    process.stdout.write(JSON.stringify({ continue: true, systemMessage: msg }));
    process.exit(0);
  }

  // Normal: proceed without injection
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

main();
