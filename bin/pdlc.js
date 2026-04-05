#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
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

/** Remove all PDLC-injected entries from a settings object.
 *  Matches any hook whose command references a known PDLC script name,
 *  so stale entries from different install paths are also cleaned up. */
function stripPdlc(settings) {
  const PDLC_SCRIPTS = ['pdlc-context-monitor.js', 'pdlc-guardrails.js', 'pdlc-session-start.sh', 'pdlc-statusline.js'];
  const isPdlcCommand = (cmd) => PDLC_SCRIPTS.some(s => cmd?.includes(s));

  const cleaned = JSON.parse(JSON.stringify(settings));

  // Remove statusLine if it points to PDLC
  if (isPdlcCommand(cleaned.statusLine?.command)) {
    delete cleaned.statusLine;
  }

  // Remove PDLC entries from hook arrays
  for (const event of ['PostToolUse', 'PreToolUse', 'SessionStart']) {
    if (!Array.isArray(cleaned.hooks?.[event])) continue;
    cleaned.hooks[event] = cleaned.hooks[event]
      .map(group => {
        if (!Array.isArray(group.hooks)) return group;
        const filtered = group.hooks.filter(h => !isPdlcCommand(h.command));
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
  const PDLC_SCRIPTS = ['pdlc-context-monitor.js', 'pdlc-guardrails.js', 'pdlc-session-start.sh', 'pdlc-statusline.js'];
  const isPdlcCommand = (cmd) => PDLC_SCRIPTS.some(s => cmd?.includes(s));

  return (
    isPdlcCommand(settings?.statusLine?.command) ||
    Object.values(settings?.hooks || {}).some(arr =>
      arr.some(group =>
        group.hooks?.some(h => isPdlcCommand(h.command))
      )
    )
  );
}

// ─── Beads helpers ───────────────────────────────────────────────────────────

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
    console.log(`  Beads (bd)  : \u2713 installed (${beadsVersion()})`);
  } else {
    console.log(`  Beads (bd)  : \u2717 not found`);
    console.log(`                Required for /pdlc init and the Construction phase.`);
    console.log(`                Install: npm install -g @beads/bd`);
  }
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function promptInstallBeads(local) {
  if (isBeadsInstalled()) return;
  if (!process.stdin.isTTY) return;

  const scope = local ? 'locally (devDependency)' : 'globally';
  const installCmd = local ? 'npm install --save-dev @beads/bd' : 'npm install -g @beads/bd';

  console.log(`\n  Beads (bd) is required by PDLC for task management during /init and /build.`);
  console.log(`  It will be installed ${scope} to match your PDLC install.`);

  const answer = await prompt('  Install Beads now? (Y/n) ');
  if (answer === '' || answer === 'y' || answer === 'yes') {
    console.log(`\n  Installing Beads ${scope}...`);
    try {
      execSync(installCmd, { stdio: 'inherit' });
      if (isBeadsInstalled()) {
        console.log(`\n  Beads (bd)  : \u2713 installed ${scope} (${beadsVersion()})`);
      } else {
        console.log(`\n  Beads (bd)  : \u2713 installed ${scope}`);
      }
    } catch (err) {
      console.error('\n  Beads installation failed. Install it manually before running /pdlc init:');
      console.error(`  ${installCmd}`);
    }
  } else {
    console.log('\n  Beads is required before you can run /pdlc init. Install it manually:');
    console.log(`  ${installCmd}`);
  }
}

// ─── Install mode detection ──────────────────────────────────────────────────

/**
 * Detect whether this package is installed locally (inside a repo's node_modules)
 * vs globally. Used by postinstall to auto-select the right mode.
 */
function isLocalInstall() {
  const initCwd = process.env.INIT_CWD;
  if (!initCwd) return false;

  // Check if PLUGIN_ROOT is inside INIT_CWD/node_modules (direct or symlinked)
  const expectedLocalPath = path.join(initCwd, 'node_modules', '@pdlc-os', 'pdlc');
  if (path.resolve(PLUGIN_ROOT) === path.resolve(expectedLocalPath)) return true;

  // npm symlinks local file: installs — resolve the symlink and compare
  try {
    const realTarget = fs.realpathSync(expectedLocalPath);
    return path.resolve(PLUGIN_ROOT) === path.resolve(realTarget);
  } catch {
    return false;
  }
}

/**
 * Get the repo root for a local install.
 * Uses INIT_CWD (set by npm to where `npm install` was run),
 * falling back to the current working directory.
 */
function getRepoRoot() {
  return process.env.INIT_CWD || process.cwd();
}

// ─── Slash command registration ──────────────────────────────────────────────

const PLUGIN_COMMANDS_DIR = path.join(PLUGIN_ROOT, '.claude', 'commands');

/**
 * Copy slash command files from the plugin into the target .claude/commands/ dir.
 * Claude Code only discovers commands in project-level or user-level .claude/commands/,
 * not from node_modules, so we must copy them.
 */
function installCommands(targetRoot) {
  const sourceDir = PLUGIN_COMMANDS_DIR;
  const destDir = path.join(targetRoot, '.claude', 'commands');

  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(destDir, { recursive: true });

  const pluginRootForward = PLUGIN_ROOT.replace(/\\/g, '/');

  for (const file of fs.readdirSync(sourceDir)) {
    const src = path.join(sourceDir, file);
    let content = fs.readFileSync(src, 'utf8');
    // Resolve plugin root placeholder so skill paths are absolute
    content = content.replace(/\$\{PDLC_PLUGIN_ROOT\}/g, pluginRootForward);
    const dest = path.join(destDir, file);
    fs.writeFileSync(dest, content, 'utf8');
  }
}

/**
 * Remove PDLC-installed slash command files from the target .claude/commands/ dir.
 */
function removeCommands(targetRoot) {
  const sourceDir = PLUGIN_COMMANDS_DIR;
  const destDir = path.join(targetRoot, '.claude', 'commands');

  if (!fs.existsSync(sourceDir) || !fs.existsSync(destDir)) return;

  for (const file of fs.readdirSync(sourceDir)) {
    const dest = path.join(destDir, file);
    try { fs.unlinkSync(dest); } catch {}
  }

  // Clean up empty commands dir
  try {
    const remaining = fs.readdirSync(destDir);
    if (remaining.length === 0) fs.rmdirSync(destDir);
  } catch {}
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function install(opts = {}) {
  const local = opts.local || false;

  const pluginSettings = readJson(PLUGIN_SETTINGS_PATH);
  if (!pluginSettings) {
    console.error(`Error: Plugin settings not found at ${PLUGIN_SETTINGS_PATH}`);
    process.exit(1);
  }

  const resolved = resolvePlaceholders(pluginSettings);

  if (local) {
    const repoRoot = opts.repoRoot || process.cwd();
    const localSettingsPath = path.join(repoRoot, '.claude', 'settings.local.json');
    const existing = readJson(localSettingsPath) ?? {};

    if (isPdlcInstalled(existing)) {
      const stripped = stripPdlc(existing);
      writeJson(localSettingsPath, deepMerge(stripped, resolved));
      console.log(`\nPDLC updated to v${VERSION} (local).`);
    } else {
      writeJson(localSettingsPath, deepMerge(existing, resolved));
      console.log(`\nPDLC v${VERSION} installed locally.`);
    }

    // Copy slash commands into the project's .claude/commands/
    installCommands(repoRoot);

    // Also strip from global settings if present, to avoid double-hooking
    const global = readJson(GLOBAL_SETTINGS_PATH);
    if (global && isPdlcInstalled(global)) {
      writeJson(GLOBAL_SETTINGS_PATH, stripPdlc(global));
      removeCommands(os.homedir());
      console.log(`  Removed previous global PDLC hooks from ~/.claude/settings.json`);
    }

    console.log(`  Plugin root : ${PLUGIN_ROOT}`);
    console.log(`  Settings    : ${localSettingsPath}`);
    console.log(`  Commands    : ${path.join(repoRoot, '.claude', 'commands')}`);
    console.log(`  Scope       : this repo only`);
  } else {
    const global = readJson(GLOBAL_SETTINGS_PATH) ?? {};

    if (isPdlcInstalled(global)) {
      const stripped = stripPdlc(global);
      writeJson(GLOBAL_SETTINGS_PATH, deepMerge(stripped, resolved));
      console.log(`\nPDLC updated to v${VERSION}.`);
    } else {
      writeJson(GLOBAL_SETTINGS_PATH, deepMerge(global, resolved));
      console.log(`\nPDLC v${VERSION} installed successfully.`);
    }

    // Copy slash commands into ~/.claude/commands/
    installCommands(os.homedir());

    console.log(`  Plugin root : ${PLUGIN_ROOT}`);
    console.log(`  Settings    : ${GLOBAL_SETTINGS_PATH}`);
    console.log(`  Commands    : ${path.join(os.homedir(), '.claude', 'commands')}`);
    console.log(`  Scope       : all projects (global)`);
  }

  await promptInstallBeads(local);

  if (isBeadsInstalled()) {
    console.log(`  Beads (bd)  : \u2713 installed (${beadsVersion()})`);
  }

  console.log('\nStart a new Claude Code session to activate.');
  console.log('Next step  : open a project and run /pdlc init\n');
}

function uninstall(opts = {}) {
  const local = opts.local || false;

  if (local) {
    const repoRoot = opts.repoRoot || process.cwd();
    const localSettingsPath = path.join(repoRoot, '.claude', 'settings.local.json');
    const existing = readJson(localSettingsPath);

    if (!existing) {
      console.log('\nNo local Claude settings found — nothing to uninstall.\n');
      return;
    }
    if (!isPdlcInstalled(existing)) {
      console.log('\nPDLC is not installed locally in .claude/settings.local.json.\n');
      return;
    }

    const stripped = stripPdlc(existing);
    if (Object.keys(stripped).length === 0) {
      fs.unlinkSync(localSettingsPath);
      console.log('\nPDLC uninstalled. Removed .claude/settings.local.json (was empty).');
    } else {
      writeJson(localSettingsPath, stripped);
      console.log('\nPDLC uninstalled locally. Hooks and statusLine removed from .claude/settings.local.json.');
    }
    removeCommands(repoRoot);
    console.log('  Slash commands removed from .claude/commands/\n');
  } else {
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
    removeCommands(os.homedir());
    console.log('\nPDLC uninstalled. Hooks and statusLine removed from ~/.claude/settings.json.');
    console.log('  Slash commands removed from ~/.claude/commands/\n');
  }
}

function status() {
  const global = readJson(GLOBAL_SETTINGS_PATH);
  const globalInstalled = global ? isPdlcInstalled(global) : false;

  // Check for local install in cwd
  const localSettingsPath = path.join(process.cwd(), '.claude', 'settings.local.json');
  const local = readJson(localSettingsPath);
  const localInstalled = local ? isPdlcInstalled(local) : false;

  console.log(`\npdlc v${VERSION}`);
  console.log(`Plugin root  : ${PLUGIN_ROOT}`);

  if (localInstalled) {
    console.log(`Install mode : local (this repo)`);
    console.log(`Settings     : ${localSettingsPath}`);
  } else if (globalInstalled) {
    console.log(`Install mode : global (all projects)`);
    console.log(`Settings     : ${GLOBAL_SETTINGS_PATH}`);
  } else {
    console.log(`PDLC         : \u2717 not installed`);
  }

  printBeadsStatus();

  if (localInstalled || globalInstalled) {
    console.log('\nHooks registered:');
    console.log('  statusLine     \u2192 pdlc-statusline.js');
    console.log('  PostToolUse    \u2192 pdlc-context-monitor.js');
    console.log('  PreToolUse     \u2192 pdlc-guardrails.js');
    console.log('  SessionStart   \u2192 pdlc-session-start.sh');
  }
  console.log('');
}

/**
 * Called by `npm postinstall`. Auto-detects local vs global install.
 */
async function postinstall() {
  const initCwd = process.env.INIT_CWD || '';
  if (path.resolve(initCwd) === PLUGIN_ROOT) return;
  if (process.env.CI && !process.env.PDLC_INSTALL_IN_CI) return;

  if (isLocalInstall()) {
    await install({ local: true, repoRoot: getRepoRoot() });
  } else {
    await install({ local: false });
  }
}

function printUsage() {
  console.log(`
pdlc v${VERSION} \u2014 Product Development Lifecycle plugin for Claude Code

Usage:
  npx @pdlc-os/pdlc install             Register PDLC hooks globally (~/.claude/settings.json)
  npx @pdlc-os/pdlc install --local     Register PDLC hooks locally (.claude/settings.local.json)
  npx @pdlc-os/pdlc uninstall           Remove global PDLC hooks
  npx @pdlc-os/pdlc uninstall --local   Remove local PDLC hooks
  npx @pdlc-os/pdlc status              Show install status
  npx @pdlc-os/pdlc --version           Print version

Local install (recommended for teams):
  cd your-repo
  npm install --save-dev @pdlc-os/pdlc   Auto-detects local context and installs to .claude/

Global install:
  npm install -g @pdlc-os/pdlc           Installs hooks for all projects

Slash commands (inside a Claude Code session after install):
  /init        Phase 0 \u2014 Initialization: Constitution \xb7 Intent \xb7 Memory Bank \xb7 Beads
  /brainstorm  Phase 1 \u2014 Inception: Discover \u2192 Define \u2192 Design \u2192 Plan
  /build       Phase 2 \u2014 Construction: Build \u2192 Review \u2192 Test
  /ship        Phase 3 \u2014 Operation: Ship \u2192 Verify \u2192 Reflect

Marketplace: https://github.com/pdlc-os
`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const [,, command, ...rest] = process.argv;

async function main() {
  const hasLocal = rest.includes('--local');

  switch (command) {
    case 'install':
      await install({ local: hasLocal });
      break;
    case 'uninstall':
      uninstall({ local: hasLocal });
      break;
    case 'status':
      status();
      break;
    case 'postinstall':
      await postinstall();
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
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
