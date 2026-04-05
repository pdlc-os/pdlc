#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
const VERSION = require(path.join(PLUGIN_ROOT, 'package.json')).version;
const GLOBAL_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const PLUGIN_SETTINGS_PATH = path.join(PLUGIN_ROOT, '.claude', 'settings.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw new Error(`Failed to parse ${filePath}: ${err.message}`);
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    const src = source[key];
    const tgt = result[key];
    if (src !== null && typeof src === 'object' && !Array.isArray(src)) {
      result[key] = deepMerge(tgt || {}, src);
    } else if (Array.isArray(src) && Array.isArray(tgt)) {
      const seen = new Set(tgt.map(JSON.stringify));
      result[key] = [...tgt, ...src.filter(i => !seen.has(JSON.stringify(i)))];
    } else {
      result[key] = src;
    }
  }
  return result;
}

function resolvePlaceholders(obj) {
  return JSON.parse(
    JSON.stringify(obj).replace(
      /\$\{CLAUDE_PLUGIN_ROOT\}/g,
      PLUGIN_ROOT.replace(/\\/g, '/')
    )
  );
}

/** Remove all PDLC-injected entries from a settings object (by plugin root path). */
function stripPdlc(settings) {
  const rootStr = PLUGIN_ROOT.replace(/\\/g, '/');
  const cleaned = JSON.parse(JSON.stringify(settings));

  // Remove statusLine if it points to PDLC
  if (cleaned.statusLine?.command?.includes(rootStr)) {
    delete cleaned.statusLine;
  }

  // Remove PDLC entries from hook arrays
  for (const event of ['PostToolUse', 'PreToolUse', 'SessionStart']) {
    if (!Array.isArray(cleaned.hooks?.[event])) continue;
    cleaned.hooks[event] = cleaned.hooks[event]
      .map(group => {
        if (!Array.isArray(group.hooks)) return group;
        const filtered = group.hooks.filter(h => !h.command?.includes(rootStr));
        return filtered.length ? { ...group, hooks: filtered } : null;
      })
      .filter(Boolean);
    if (cleaned.hooks[event].length === 0) delete cleaned.hooks[event];
  }
  if (cleaned.hooks && Object.keys(cleaned.hooks).length === 0) {
    delete cleaned.hooks;
  }
  return cleaned;
}

function isPdlcInstalled(settings) {
  const rootStr = PLUGIN_ROOT.replace(/\\/g, '/');
  return (
    settings?.statusLine?.command?.includes(rootStr) ||
    Object.values(settings?.hooks || {}).some(arr =>
      arr.some(group =>
        group.hooks?.some(h => h.command?.includes(rootStr))
      )
    )
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBeadsInstalled() {
  try {
    execSync('bd --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function beadsVersion() {
  try {
    return execSync('bd --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function printBeadsStatus() {
  if (isBeadsInstalled()) {
    console.log(`  Beads (bd)  : ✓ installed (${beadsVersion()})`);
  } else {
    console.log(`  Beads (bd)  : ✗ not found`);
    console.log(`                Required for /init and the Construction phase.`);
    console.log(`                Install: npm install -g @beads/bd`);
  }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function install() {
  const pluginSettings = readJson(PLUGIN_SETTINGS_PATH);
  if (!pluginSettings) {
    console.error(`Error: Plugin settings not found at ${PLUGIN_SETTINGS_PATH}`);
    process.exit(1);
  }

  const resolved = resolvePlaceholders(pluginSettings);
  const global = readJson(GLOBAL_SETTINGS_PATH) ?? {};

  if (isPdlcInstalled(global)) {
    // Re-install: strip old entries first so paths stay current
    const stripped = stripPdlc(global);
    writeJson(GLOBAL_SETTINGS_PATH, deepMerge(stripped, resolved));
    console.log(`\nPDLC updated to v${VERSION}.`);
  } else {
    writeJson(GLOBAL_SETTINGS_PATH, deepMerge(global, resolved));
    console.log(`\nPDLC v${VERSION} installed successfully.`);
  }

  console.log(`  Plugin root : ${PLUGIN_ROOT}`);
  console.log(`  Settings    : ${GLOBAL_SETTINGS_PATH}`);
  printBeadsStatus();
  console.log('\nStart a new Claude Code session to activate.');
  if (!isBeadsInstalled()) {
    console.log('Before running /init, install Beads: npm install -g @beads/bd');
  }
  console.log('Next step  : open a project and run /init\n');
}

function uninstall() {
  const global = readJson(GLOBAL_SETTINGS_PATH);
  if (!global) {
    console.log('\nNo Claude settings found — nothing to uninstall.\n');
    return;
  }
  if (!isPdlcInstalled(global)) {
    console.log('\nPDLC is not currently installed in ~/.claude/settings.json.\n');
    return;
  }
  writeJson(GLOBAL_SETTINGS_PATH, stripPdlc(global));
  console.log('\nPDLC uninstalled. Hooks and statusLine removed from ~/.claude/settings.json.\n');
}

function status() {
  const global = readJson(GLOBAL_SETTINGS_PATH);
  const installed = global ? isPdlcInstalled(global) : false;

  console.log(`\npdlc v${VERSION}`);
  console.log(`Plugin root  : ${PLUGIN_ROOT}`);
  console.log(`Global hooks : ${GLOBAL_SETTINGS_PATH}`);
  console.log(`PDLC         : ${installed ? '✓ installed' : '✗ not installed'}`);
  printBeadsStatus();

  if (installed) {
    console.log('\nHooks registered:');
    console.log('  statusLine     → pdlc-statusline.js');
    console.log('  PostToolUse    → pdlc-context-monitor.js');
    console.log('  PreToolUse     → pdlc-guardrails.js');
    console.log('  SessionStart   → pdlc-session-start.sh');
  }
  console.log('');
}

/**
 * Called by `npm postinstall`. Skips silently during local development
 * (when the package's own node_modules are being installed) to avoid
 * the hook running in unexpected contexts.
 */
function postinstall() {
  // INIT_CWD is set by npm to the directory where `npm install` was run.
  // If it equals the plugin root, the developer is installing the plugin's
  // own deps — skip auto-install.
  const initCwd = process.env.INIT_CWD || '';
  if (path.resolve(initCwd) === PLUGIN_ROOT) return;

  // Also skip in CI environments unless explicitly opted in.
  if (process.env.CI && !process.env.PDLC_INSTALL_IN_CI) return;

  install();
}

function printUsage() {
  console.log(`
pdlc v${VERSION} — Product Development Lifecycle plugin for Claude Code

Usage:
  npx @pdlc-os/pdlc install     Register PDLC hooks in ~/.claude/settings.json
  npx @pdlc-os/pdlc uninstall   Remove PDLC hooks from ~/.claude/settings.json
  npx @pdlc-os/pdlc status      Show install status
  npx @pdlc-os/pdlc --version   Print version

Slash commands (inside a Claude Code session after install):
  /init        Phase 0 — Initialization: Constitution · Intent · Memory Bank · Beads
  /brainstorm  Phase 1 — Inception: Discover → Define → Design → Plan
  /build       Phase 2 — Construction: Build → Review → Test
  /ship        Phase 3 — Operation: Ship → Verify → Reflect

Marketplace: https://github.com/pdlc-os
`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const [,, command, ...rest] = process.argv;

switch (command) {
  case 'install':
    install();
    break;
  case 'uninstall':
    uninstall();
    break;
  case 'status':
    status();
    break;
  case 'postinstall':
    postinstall();
    break;
  case '--version':
  case '-v':
    console.log(VERSION);
    break;
  case '--help':
  case '-h':
  default:
    printUsage();
    break;
}
