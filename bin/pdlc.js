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
      /\$\{PDLC_PLUGIN_ROOT\}/g,
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

// ─── Dolt helpers ────────────────────────────────────────────────────────────

function isDoltInstalled() {
  try {
    execSync('dolt version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function doltVersion() {
  try {
    const raw = execSync('dolt version', { stdio: 'pipe' }).toString().trim().split('\n')[0];
    // "dolt version 1.85.0" → "1.85.0"
    return raw.replace(/^dolt version\s*/i, '');
  } catch {
    return null;
  }
}

function isHomebrewInstalled() {
  try {
    execSync('brew --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getDoltInstallCmd() {
  if (process.platform === 'darwin' || isHomebrewInstalled()) {
    return 'brew install dolt';
  }
  // Linux fallback: official install script
  return 'sudo bash -c \'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash\'';
}

function getDoltUninstallCmd() {
  if (process.platform === 'darwin' || isHomebrewInstalled()) {
    return 'brew uninstall dolt';
  }
  return 'sudo rm -f /usr/local/bin/dolt';
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
    const raw = execSync('bd --version', { stdio: 'pipe' }).toString().trim();
    // "bd version 0.63.3 (884cc117)" → "0.63.3"
    const match = raw.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : raw;
  } catch {
    return null;
  }
}

function printBeadsStatus() {
  if (isDoltInstalled()) {
    console.log(`  Dolt        : \u2713 installed (${doltVersion()})`);
  } else {
    console.log(`  Dolt        : \u2717 not found`);
    console.log(`                Required by Beads for task storage.`);
    console.log(`                Install: ${getDoltInstallCmd()}`);
  }
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

async function promptInstallDolt() {
  if (isDoltInstalled()) {
    log(`\n  Dolt        : \u2713 already installed (${doltVersion()}) \u2014 skipping`);
    return true;
  }

  const installCmd = getDoltInstallCmd();

  log(`\n  Dolt is a SQL database required by Beads for task storage.`);

  if (!process.stdin.isTTY) {
    log(`  Install it before running /pdlc init:`);
    log(`  ${installCmd}`);
    return false;
  }

  const answer = await prompt('  Install Dolt now? (Y/n) ');
  if (answer === '' || answer === 'y' || answer === 'yes') {
    log(`\n  Installing Dolt...`);
    try {
      execSync(installCmd, { stdio: 'inherit' });
      if (isDoltInstalled()) {
        log(`\n  Dolt        : \u2713 installed (${doltVersion()})`);
        return true;
      }
    } catch (err) {
      log('\n  Dolt installation failed. Install it manually before running /pdlc init:');
      log(`  ${installCmd}`);
      return false;
    }
  } else {
    log('\n  Dolt is required by Beads. Install it manually:');
    log(`  ${installCmd}`);
    return false;
  }
  return false;
}

async function promptInstallBeads(local) {
  // Dolt must be installed first — it's the database Beads depends on
  await promptInstallDolt();

  if (isBeadsInstalled()) {
    log(`\n  Beads (bd)  : \u2713 already installed (${beadsVersion()}) \u2014 skipping`);
    return;
  }

  const scope = local ? 'locally (devDependency)' : 'globally';
  const installCmd = local ? 'npm install --save-dev @beads/bd' : 'npm install -g @beads/bd';

  log(`\n  Beads (bd) is required by PDLC for task management during /pdlc init and /pdlc build.`);

  if (!process.stdin.isTTY) {
    log(`  Install it ${scope} before running /pdlc init:`);
    log(`  ${installCmd}`);
    return;
  }

  log(`  It will be installed ${scope} to match your PDLC install.`);

  const answer = await prompt('  Install Beads now? (Y/n) ');
  if (answer === '' || answer === 'y' || answer === 'yes') {
    log(`\n  Installing Beads ${scope}...`);
    try {
      execSync(installCmd, { stdio: 'inherit' });
      if (isBeadsInstalled()) {
        log(`\n  Beads (bd)  : \u2713 installed ${scope} (${beadsVersion()})`);
      } else {
        log(`\n  Beads (bd)  : \u2713 installed ${scope}`);
      }
    } catch (err) {
      log('\n  Beads installation failed. Install it manually before running /pdlc init:');
      log(`  ${installCmd}`);
    }
  } else {
    log('\n  Beads is required before you can run /pdlc init. Install it manually:');
    log(`  ${installCmd}`);
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

// ─── Output helpers ──────────────────────────────────────────────────────────

/**
 * npm suppresses stdout from postinstall scripts. Use stderr for all output
 * so the user always sees it. `log()` replaces `console.log` in install/
 * uninstall/upgrade paths.
 */
function log(msg = '') {
  process.stderr.write(msg + '\n');
}

function banner(action, version) {
  const tag = `${action} v${version}`;
  const W = 46; // inner width between the two ║ chars

  // Detect 256-color support: COLORTERM=truecolor/24bit, or TERM contains '256color'
  const has256 = process.env.COLORTERM === 'truecolor'
    || process.env.COLORTERM === '24bit'
    || (process.env.TERM || '').includes('256color');

  // ANSI color codes
  const C  = '\x1b[1;36m';    // bold cyan — border
  const Wh = '\x1b[1;37m';    // bold white — action tag
  const S  = '\x1b[1;31m';    // bold red — subtitle
  const R  = '\x1b[0m';       // reset

  // Gradient rows: blue → cyan → teal → green (top to bottom)
  // 256-color primary, 16-color fallback
  const G = has256 ? [
    '\x1b[38;5;27m',   // row 1 — bright blue
    '\x1b[38;5;33m',   // row 2 — dodger blue
    '\x1b[38;5;39m',   // row 3 — deep sky blue
    '\x1b[38;5;44m',   // row 4 — dark turquoise
    '\x1b[38;5;49m',   // row 5 — medium spring green
  ] : [
    '\x1b[1;34m',      // row 1 — bold blue
    '\x1b[1;34m',      // row 2 — bold blue
    '\x1b[1;36m',      // row 3 — bold cyan
    '\x1b[1;36m',      // row 4 — bold cyan
    '\x1b[1;32m',      // row 5 — bold green
  ];

  // PDLC letter rows — each row is the same width (padded to the widest row)
  // so the block stays readable when centered as a unit
  const letterWidth = 30; // widest row is 30 chars
  const lpad = (s, w) => s + ' '.repeat(Math.max(0, w - s.length));
  const letters = [
    '\u2588\u2588\u2588\u2588\u2588\u2588  \u2588\u2588\u2588\u2588\u2588\u2588  \u2588\u2588      \u2588\u2588\u2588\u2588\u2588\u2588',
    '\u2588\u2588   \u2588\u2588 \u2588\u2588   \u2588\u2588 \u2588\u2588     \u2588\u2588     ',
    '\u2588\u2588\u2588\u2588\u2588\u2588  \u2588\u2588   \u2588\u2588 \u2588\u2588     \u2588\u2588     ',
    '\u2588\u2588      \u2588\u2588   \u2588\u2588 \u2588\u2588     \u2588\u2588     ',
    '\u2588\u2588      \u2588\u2588\u2588\u2588\u2588\u2588  \u2588\u2588\u2588\u2588\u2588\u2588  \u2588\u2588\u2588\u2588\u2588\u2588',
  ].map(l => lpad(l, letterWidth));

  // Center a string within width w
  const center = (s, w) => {
    const gap = Math.max(0, w - s.length);
    const left = Math.floor(gap / 2);
    const right = gap - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  };
  const row = (content, color) => `${C}\u2551${R}${color}${content}${R}${C}\u2551${R}`;
  const empty = row(' '.repeat(W), '');
  const border = (l, m, r) => `${C}${l}${m.repeat(W)}${r}${R}`;

  const subLine = 'Product Development Lifecycle';

  const lines = [
    '',
    border('\u2554', '\u2550', '\u2557'),
    empty,
    ...letters.map((l, i) => row(center(l, W), G[i])),
    empty,
    row(center(tag, W), Wh),
    row(center(subLine, W), S),
    empty,
    border('\u255a', '\u2550', '\u255d'),
    '',
  ];
  log(lines.join('\n'));
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
  if (!opts._skipBanner) banner('Installing', VERSION);

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
      log(`\nPDLC updated to v${VERSION} (local).`);
    } else {
      writeJson(localSettingsPath, deepMerge(existing, resolved));
      log(`\nPDLC v${VERSION} installed locally.`);
    }

    // Copy slash commands into the project's .claude/commands/
    installCommands(repoRoot);

    // Also strip from global settings if present, to avoid double-hooking
    const global = readJson(GLOBAL_SETTINGS_PATH);
    if (global && isPdlcInstalled(global)) {
      writeJson(GLOBAL_SETTINGS_PATH, stripPdlc(global));
      removeCommands(os.homedir());
      log(`  Removed previous global PDLC hooks from ~/.claude/settings.json`);
    }

    log(`  Plugin root : ${PLUGIN_ROOT}`);
    log(`  Settings    : ${localSettingsPath}`);
    log(`  Commands    : ${path.join(repoRoot, '.claude', 'commands')}`);
    log(`  Scope       : this repo only`);
  } else {
    const global = readJson(GLOBAL_SETTINGS_PATH) ?? {};

    if (isPdlcInstalled(global)) {
      const stripped = stripPdlc(global);
      writeJson(GLOBAL_SETTINGS_PATH, deepMerge(stripped, resolved));
      log(`\nPDLC updated to v${VERSION}.`);
    } else {
      writeJson(GLOBAL_SETTINGS_PATH, deepMerge(global, resolved));
      log(`\nPDLC v${VERSION} installed successfully.`);
    }

    // Copy slash commands into ~/.claude/commands/
    installCommands(os.homedir());

    log(`  Plugin root : ${PLUGIN_ROOT}`);
    log(`  Settings    : ${GLOBAL_SETTINGS_PATH}`);
    log(`  Commands    : ${path.join(os.homedir(), '.claude', 'commands')}`);
    log(`  Scope       : all projects (global)`);
  }

  await promptInstallBeads(local);

  if (isBeadsInstalled()) {
    log(`  Beads (bd)  : \u2713 installed (${beadsVersion()})`);
  }

  log('\nStart a new Claude Code session to activate.');
  log('Next step  : open a project and run /pdlc init\n');
}

async function promptUninstallDolt() {
  if (!isDoltInstalled()) return;
  if (!process.stdin.isTTY) return;

  const uninstallCmd = getDoltUninstallCmd();

  log('\n  Dolt is still installed.');
  log('  \u26a0\ufe0f  Warning: Other tools on this system may depend on Dolt.');

  const answer = await prompt('  Uninstall Dolt as well? (y/N) ');
  if (answer === 'y' || answer === 'yes') {
    log('\n  Uninstalling Dolt...');
    try {
      execSync(uninstallCmd, { stdio: 'inherit' });
      log('  Dolt        : \u2713 uninstalled');
    } catch (err) {
      log('  Dolt uninstall failed. You can remove it manually:');
      log(`  ${uninstallCmd}`);
    }
  } else {
    log('  Keeping Dolt installed.');
  }
}

async function promptUninstallBeads(local) {
  if (!isBeadsInstalled()) return;
  if (!process.stdin.isTTY) return;

  const scope = local ? 'locally' : 'globally';
  const uninstallCmd = local ? 'npm uninstall @beads/bd' : 'npm uninstall -g @beads/bd';

  log('\n  Beads (bd) is still installed.');
  log('  \u26a0\ufe0f  Warning: If this repo is already tracking tasks in Beads (.beads/ directory),');
  log('  uninstalling Beads will remove the CLI but your task data in .beads/ will remain.');
  log('  However, you will not be able to query or manage those tasks without Beads.');

  const answer = await prompt(`  Uninstall Beads ${scope} as well? (y/N) `);
  if (answer === 'y' || answer === 'yes') {
    log(`\n  Uninstalling Beads ${scope}...`);
    try {
      execSync(uninstallCmd, { stdio: 'inherit' });
      log(`  Beads (bd)  : \u2713 uninstalled ${scope}`);
    } catch (err) {
      log('  Beads uninstall failed. You can remove it manually:');
      log(`  ${uninstallCmd}`);
    }

    // If Beads is removed, offer to remove Dolt too
    await promptUninstallDolt();
  } else {
    log('  Keeping Beads installed.');
  }
}

async function uninstall(opts = {}) {
  const local = opts.local || false;
  banner('Uninstalling', VERSION);

  if (local) {
    const repoRoot = opts.repoRoot || process.cwd();
    const localSettingsPath = path.join(repoRoot, '.claude', 'settings.local.json');
    const existing = readJson(localSettingsPath);

    if (!existing) {
      log('\nNo local Claude settings found \u2014 nothing to uninstall.\n');
      return;
    }
    if (!isPdlcInstalled(existing)) {
      log('\nPDLC is not installed locally in .claude/settings.local.json.\n');
      return;
    }

    const stripped = stripPdlc(existing);
    if (Object.keys(stripped).length === 0) {
      fs.unlinkSync(localSettingsPath);
      log('\nPDLC uninstalled. Removed .claude/settings.local.json (was empty).');
    } else {
      writeJson(localSettingsPath, stripped);
      log('\nPDLC uninstalled locally. Hooks and statusLine removed from .claude/settings.local.json.');
    }
    removeCommands(repoRoot);
    log('  Slash commands removed from .claude/commands/');

    await promptUninstallBeads(true);
    log('');
  } else {
    const global = readJson(GLOBAL_SETTINGS_PATH);
    if (!global) {
      log('\nNo Claude settings found \u2014 nothing to uninstall.\n');
      return;
    }
    if (!isPdlcInstalled(global)) {
      log('\nPDLC is not currently installed in ~/.claude/settings.json.\n');
      return;
    }
    writeJson(GLOBAL_SETTINGS_PATH, stripPdlc(global));
    removeCommands(os.homedir());
    log('\nPDLC uninstalled. Hooks and statusLine removed from ~/.claude/settings.json.');
    log('  Slash commands removed from ~/.claude/commands/');

    await promptUninstallBeads(false);
    log('');
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

async function upgrade(opts = {}) {
  const local = opts.local || false;
  const scope = local ? 'locally' : 'globally';
  banner('Upgrading', VERSION);

  log(`  Upgrading PDLC ${scope}...`);

  // Upgrade PDLC
  const pdlcCmd = local
    ? 'npm update @pdlc-os/pdlc'
    : 'npm install -g @pdlc-os/pdlc@latest';

  try {
    execSync(pdlcCmd, { stdio: 'inherit' });
  } catch (err) {
    log(`\n  PDLC upgrade failed. You can upgrade manually:\n  ${pdlcCmd}`);
    return;
  }

  // Re-read version after upgrade (the binary on disk may have changed,
  // but we're still running the old one — read the new version from package.json)
  let newVersion;
  try {
    newVersion = require(path.join(PLUGIN_ROOT, 'package.json')).version;
  } catch {
    newVersion = 'unknown';
  }
  log(`  PDLC        : \u2713 upgraded to v${newVersion}`);

  // Re-run install to refresh hooks and commands
  await install({ local, repoRoot: opts.repoRoot, _skipBanner: true });

  // Prompt to upgrade Beads
  if (isBeadsInstalled()) {
    if (!process.stdin.isTTY) return;

    const beadsCmd = local
      ? 'npm update @beads/bd'
      : 'npm install -g @beads/bd@latest';

    log(`\n  Beads (bd) is currently installed (${beadsVersion()}).`);
    const answer = await prompt(`  Upgrade Beads ${scope} as well? (Y/n) `);
    if (answer === '' || answer === 'y' || answer === 'yes') {
      log(`\n  Upgrading Beads ${scope}...`);
      try {
        execSync(beadsCmd, { stdio: 'inherit' });
        log(`  Beads (bd)  : \u2713 upgraded (${beadsVersion()})`);
      } catch (err) {
        log(`  Beads upgrade failed. You can upgrade manually:\n  ${beadsCmd}`);
      }
    } else {
      log('  Keeping current Beads version.');
    }
  }

  log('');
}

function printUsage() {
  console.log(`
pdlc v${VERSION} \u2014 Product Development Lifecycle plugin for Claude Code

Usage:
  npx @pdlc-os/pdlc install             Register PDLC hooks globally (~/.claude/settings.json)
  npx @pdlc-os/pdlc install --local     Register PDLC hooks locally (.claude/settings.local.json)
  npx @pdlc-os/pdlc uninstall           Remove global PDLC hooks
  npx @pdlc-os/pdlc uninstall --local   Remove local PDLC hooks
  npx @pdlc-os/pdlc upgrade             Upgrade PDLC + Beads globally
  npx @pdlc-os/pdlc upgrade --local     Upgrade PDLC + Beads locally
  npx @pdlc-os/pdlc status              Show install status
  npx @pdlc-os/pdlc --version           Print version

Local install (recommended for teams):
  cd your-repo
  npm install --save-dev @pdlc-os/pdlc   Auto-detects local context and installs to .claude/

Global install:
  npm install -g @pdlc-os/pdlc           Installs hooks for all projects

Slash commands (inside a Claude Code session after install):
  /pdlc init        Phase 0 \u2014 Initialization: Constitution \xb7 Intent \xb7 Memory Bank \xb7 Beads
  /pdlc brainstorm  Phase 1 \u2014 Inception: Discover \u2192 Define \u2192 Design \u2192 Plan
  /pdlc build       Phase 2 \u2014 Construction: Build \u2192 Review \u2192 Test
  /pdlc ship        Phase 3 \u2014 Operation: Ship \u2192 Verify \u2192 Reflect
  /pdlc decision    Record a decision in the Decision Registry (any phase)
  /pdlc whatif       Explore a hypothetical scenario with read-only team analysis
  /pdlc doctor       Run a comprehensive health check on PDLC state and code alignment
  /pdlc rollback     Revert a shipped feature with post-mortem and fix options
  /pdlc hotfix       Emergency compressed build-ship cycle for production issues
  /pdlc pause        Pause the current feature and save state for later
  /pdlc resume       Resume a paused feature from its saved checkpoint
  /pdlc override-tier1  Override a Tier 1 safety block (double-RED confirmation)

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
      await uninstall({ local: hasLocal });
      break;
    case 'upgrade':
      await upgrade({ local: hasLocal });
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
