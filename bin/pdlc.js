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
const PLUGIN_SETTINGS_PATH = path.join(PLUGIN_ROOT, 'config', 'claude-settings.json');

const { detectPluginConflicts, formatReport: formatConflictReport } = require('./pdlc-conflict-check');

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
  const PDLC_SCRIPTS = ['pdlc-context-monitor.js', 'pdlc-guardrails.js', 'pdlc-session-start.sh', 'pdlc-statusline.js', 'pdlc-context-reset.sh'];
  const isPdlcCommand = (cmd) => PDLC_SCRIPTS.some(s => cmd?.includes(s));

  const cleaned = JSON.parse(JSON.stringify(settings));

  // Remove statusLine if it points to PDLC
  if (isPdlcCommand(cleaned.statusLine?.command)) {
    delete cleaned.statusLine;
  }

  // Remove PDLC entries from hook arrays
  for (const event of ['PostToolUse', 'PreToolUse', 'SessionStart', 'PostCompact']) {
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
  const PDLC_SCRIPTS = ['pdlc-context-monitor.js', 'pdlc-guardrails.js', 'pdlc-session-start.sh', 'pdlc-statusline.js', 'pdlc-context-reset.sh'];
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

// ─── Python 3 helpers ────────────────────────────────────────────────────────
// PDLC's session-start hook uses python3 for handoff parsing, roadmap-claim
// reconciliation, roadmap rendering, and conflict detection. Without python3
// those features silently degrade to a plain STATE.md dump. The check below
// gives the user a chance to install python3 at install time.

function isPython3Installed() {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

function python3Version() {
  try {
    return execSync('python3 --version', { encoding: 'utf8' }).trim();
  } catch (_) {
    return 'unknown';
  }
}

function getPython3InstallCmd() {
  // Prefer Homebrew on macOS and Linux-with-brew; fall back to distro hints elsewhere.
  if (process.platform === 'darwin' || isHomebrewInstalled()) {
    return 'brew install python';
  }
  if (process.platform === 'linux') {
    // Best-effort distro detection. We don't run these automatically because
    // most require sudo and the exact package name varies.
    try {
      const osRelease = execSync('cat /etc/os-release 2>/dev/null', { encoding: 'utf8' });
      if (/\b(ubuntu|debian)\b/i.test(osRelease)) return 'sudo apt install -y python3';
      if (/\b(fedora|rhel|centos|rocky|almalinux)\b/i.test(osRelease)) return 'sudo dnf install -y python3';
      if (/\barch\b/i.test(osRelease)) return 'sudo pacman -S --noconfirm python';
      if (/\balpine\b/i.test(osRelease)) return 'sudo apk add python3';
    } catch (_) { /* ignore */ }
    return 'sudo apt install python3  # or your distro’s equivalent';
  }
  if (process.platform === 'win32') {
    return 'winget install --id Python.Python.3 -e  # or download from https://python.org/downloads';
  }
  return 'install python3 using your package manager';
}

async function promptInstallPython3() {
  if (isPython3Installed()) {
    log(`\n  Python 3    : ✓ already installed (${python3Version()}) — skipping`);
    return true;
  }

  const installCmd = getPython3InstallCmd();

  log(`\n  Python 3 is used by PDLC’s session-start hook for:`);
  log(`    • handoff parsing and mid-phase resume banners`);
  log(`    • roadmap-claim reconciliation against Beads (multi-dev safety)`);
  log(`    • roadmap progress rendering`);
  log(`    • roadmap-vs-STATE conflict detection`);
  log(`  Without Python 3, the hook still runs but degrades to a plain STATE.md dump.`);

  if (!process.stdin.isTTY) {
    log(`\n  To enable the full session-start experience, install Python 3:`);
    log(`    ${installCmd}`);
    log(`  After installation, open a new shell so PATH picks up python3.`);
    return false;
  }

  // Homebrew-based installs are safe to run non-interactively.
  const brewInstall = installCmd.startsWith('brew install');
  const promptText = brewInstall
    ? '  Install Python 3 via Homebrew now? (Y/n) '
    : `  This install requires sudo and manual steps — PDLC will print the command but will NOT run it. Show install command? (Y/n) `;

  const answer = await prompt(promptText);
  if (answer === '' || answer === 'y' || answer === 'yes') {
    if (brewInstall) {
      log(`\n  Installing Python 3 via Homebrew...`);
      try {
        execSync(installCmd, { stdio: 'inherit' });
        if (isPython3Installed()) {
          log(`\n  Python 3    : ✓ installed (${python3Version()})`);
          return true;
        }
        log(`\n  Python 3 installed but not yet on PATH in this shell.`);
        log(`  Open a new terminal (or \`source\` your shell rc) and the hook will pick it up automatically.`);
        return true;
      } catch (err) {
        log('\n  Python 3 installation failed. Install it manually:');
        log(`  ${installCmd}`);
        return false;
      }
    } else {
      // sudo / winget flows: don't execute automatically
      log('\n  Run this command when you’re ready:');
      log(`    ${installCmd}`);
      log(`  Open a new shell afterward so python3 shows up on PATH.`);
      return false;
    }
  }
  log('\n  Skipping Python 3 installation. The session-start hook will degrade gracefully.');
  log(`  Install later with: ${installCmd}`);
  return false;
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
  if (isPython3Installed()) {
    console.log(`  Python 3    : \u2713 installed (${python3Version()})`);
  } else {
    console.log(`  Python 3    : \u2717 not found`);
    console.log(`                Used by session-start hook for handoff parsing,`);
    console.log(`                roadmap-claim reconciliation, and conflict detection.`);
    console.log(`                Install: ${getPython3InstallCmd()}`);
  }
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
    console.log(`                Required for /setup and the Construction phase.`);
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
    log(`  Install it before running /setup:`);
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
      log('\n  Dolt installation failed. Install it manually before running /setup:');
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

  log(`\n  Beads (bd) is required by PDLC for task management during /setup and /build.`);

  if (!process.stdin.isTTY) {
    log(`  Install it ${scope} before running /setup:`);
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
      log('\n  Beads installation failed. Install it manually before running /setup:');
      log(`  ${installCmd}`);
    }
  } else {
    log('\n  Beads is required before you can run /setup. Install it manually:');
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

// ─── Superclaude global symlink ──────────────────────────────────────────────
// Whether PDLC is installed globally (npm -g) or locally (--save-dev), we
// always try to symlink `superclaude` into ~/.local/bin so it's on PATH
// regardless of install mode. Without this, local installs only expose
// superclaude via ./node_modules/.bin which isn't on PATH by default.
// Skipped on Windows — ~/.local/bin isn't a convention there, and npm
// already creates a .cmd shim for global installs.

const LOCAL_BIN_DIR = path.join(os.homedir(), '.local', 'bin');
const LOCAL_BIN_SUPERCLAUDE = path.join(LOCAL_BIN_DIR, 'superclaude');

const PATH_SENTINEL_START = '# >>> pdlc superclaude PATH >>>';
const PATH_SENTINEL_END   = '# <<< pdlc superclaude PATH <<<';
const PATH_SENTINEL_BLOCK =
  `${PATH_SENTINEL_START}\nexport PATH="$HOME/.local/bin:$PATH"\n${PATH_SENTINEL_END}\n`;

function isPdlcSuperclaudeTarget(target) {
  const tail = path.join('bin', 'superclaude.sh');
  return target.endsWith(tail) || target.endsWith('/superclaude.sh');
}

function linkSuperclaudeToLocalBin() {
  if (process.platform === 'win32') return;

  const source = path.join(PLUGIN_ROOT, 'bin', 'superclaude.sh');
  if (!fs.existsSync(source)) return;

  try {
    fs.mkdirSync(LOCAL_BIN_DIR, { recursive: true });
  } catch (err) {
    log(`  superclaude : ⚠️  Could not create ${LOCAL_BIN_DIR} — ${err.message}`);
    return;
  }

  let existing = null;
  try { existing = fs.lstatSync(LOCAL_BIN_SUPERCLAUDE); } catch {}

  if (existing) {
    if (!existing.isSymbolicLink()) {
      log(`  superclaude : ⚠️  ${LOCAL_BIN_SUPERCLAUDE} exists and is not a symlink — leaving it alone.`);
      return;
    }
    const currentTarget = fs.readlinkSync(LOCAL_BIN_SUPERCLAUDE);
    if (currentTarget === source) {
      log(`  superclaude : ✓ ${LOCAL_BIN_SUPERCLAUDE} → ${source}`);
      return;
    }
    if (!isPdlcSuperclaudeTarget(currentTarget)) {
      log(`  superclaude : ⚠️  ${LOCAL_BIN_SUPERCLAUDE} points to ${currentTarget} (not a pdlc superclaude.sh) — leaving it alone.`);
      return;
    }
    // Stale pdlc symlink from a different plugin root — replace it.
    fs.unlinkSync(LOCAL_BIN_SUPERCLAUDE);
  }

  try {
    fs.symlinkSync(source, LOCAL_BIN_SUPERCLAUDE);
    log(`  superclaude : ✓ ${LOCAL_BIN_SUPERCLAUDE} → ${source}`);
  } catch (err) {
    log(`  superclaude : ⚠️  Failed to create symlink — ${err.message}`);
  }
}

// ─── pdlc binary symlink (created by install.sh, mirrors superclaude) ───────
const LOCAL_BIN_PDLC = path.join(LOCAL_BIN_DIR, 'pdlc');

function isPdlcBinaryTarget(target) {
  const tail = path.join('bin', 'pdlc.js');
  return target.endsWith(tail) || target.endsWith('/pdlc.js');
}

function unlinkPdlcFromLocalBin() {
  if (process.platform === 'win32') return;

  let existing = null;
  try { existing = fs.lstatSync(LOCAL_BIN_PDLC); } catch { return; }
  if (!existing.isSymbolicLink()) return;

  const currentTarget = fs.readlinkSync(LOCAL_BIN_PDLC);
  if (!isPdlcBinaryTarget(currentTarget)) return;

  try {
    fs.unlinkSync(LOCAL_BIN_PDLC);
    log(`  pdlc        : ✓ removed symlink at ${LOCAL_BIN_PDLC}`);
  } catch (err) {
    log(`  pdlc        : ⚠️  Could not remove symlink — ${err.message}`);
  }
}

function unlinkSuperclaudeFromLocalBin() {
  if (process.platform === 'win32') return;

  let existing = null;
  try { existing = fs.lstatSync(LOCAL_BIN_SUPERCLAUDE); } catch { return; }
  if (!existing.isSymbolicLink()) return;

  const currentTarget = fs.readlinkSync(LOCAL_BIN_SUPERCLAUDE);
  if (!isPdlcSuperclaudeTarget(currentTarget)) return;

  try {
    fs.unlinkSync(LOCAL_BIN_SUPERCLAUDE);
    log(`  superclaude : ✓ removed symlink at ${LOCAL_BIN_SUPERCLAUDE}`);
  } catch (err) {
    log(`  superclaude : ⚠️  Could not remove symlink — ${err.message}`);
  }
}

function detectShellRc() {
  const shell = process.env.SHELL || '';
  const home = os.homedir();

  if (/(^|\/)zsh$/.test(shell)) {
    return path.join(home, '.zshrc');
  }
  if (/(^|\/)bash$/.test(shell)) {
    const bashrc      = path.join(home, '.bashrc');
    const bashProfile = path.join(home, '.bash_profile');
    // macOS's Terminal.app runs bash as a login shell, which reads
    // .bash_profile — prefer it if present. Linux generally uses .bashrc.
    if (process.platform === 'darwin') {
      if (fs.existsSync(bashProfile)) return bashProfile;
      if (fs.existsSync(bashrc))      return bashrc;
      return bashProfile;
    }
    if (fs.existsSync(bashrc))      return bashrc;
    if (fs.existsSync(bashProfile)) return bashProfile;
    return bashrc;
  }
  return null;
}

function rcAlreadyHasSentinel(rcFile) {
  try {
    return fs.readFileSync(rcFile, 'utf8').includes(PATH_SENTINEL_START);
  } catch {
    return false;
  }
}

function appendPathSentinel(rcFile) {
  fs.mkdirSync(path.dirname(rcFile), { recursive: true });
  let existing = '';
  try { existing = fs.readFileSync(rcFile, 'utf8'); } catch {}
  const sep = existing === '' || existing.endsWith('\n') ? '' : '\n';
  const prefix = existing === '' ? '' : '\n';
  fs.writeFileSync(rcFile, existing + sep + prefix + PATH_SENTINEL_BLOCK, 'utf8');
}

async function ensureLocalBinOnPath(opts = {}) {
  if (process.platform === 'win32') return;

  const entries = (process.env.PATH || '')
    .split(path.delimiter)
    .map(p => p.replace(/\/+$/, ''));
  if (entries.includes(LOCAL_BIN_DIR)) return;

  const rcFile = detectShellRc();

  // Headless: fall back to a manual-add hint.
  if (!process.stdin.isTTY || opts._headless) {
    log(`\n  ⚠️  ${LOCAL_BIN_DIR} is not on your PATH.`);
    log(`      Add this line to ${rcFile || '~/.zshrc or ~/.bashrc'} so \`superclaude\` resolves anywhere:`);
    log(`        export PATH="$HOME/.local/bin:$PATH"`);
    log(`      Then restart your shell or run \`source ${rcFile || '~/.zshrc'}\`.`);
    return;
  }

  if (!rcFile) {
    log(`\n  ⚠️  ${LOCAL_BIN_DIR} is not on your PATH, and PDLC did not recognise your shell (${process.env.SHELL || 'unknown'}).`);
    log(`      Add this line to your shell rc file manually:`);
    log(`        export PATH="$HOME/.local/bin:$PATH"`);
    return;
  }

  if (rcAlreadyHasSentinel(rcFile)) {
    log(`  PATH        : ✓ ${rcFile} already contains the pdlc PATH block — run \`source ${rcFile}\` to activate it in this shell.`);
    return;
  }

  log(`\n  ${LOCAL_BIN_DIR} is not on your PATH — \`superclaude\` will not resolve in a new shell until it is.`);
  const answer = await prompt(`  Add \`export PATH="$HOME/.local/bin:$PATH"\` to ${rcFile}? (Y/n) `);
  if (answer !== '' && answer !== 'y' && answer !== 'yes') {
    log(`  PATH        : skipped. Add the export line to ${rcFile} manually, then \`source\` it.`);
    return;
  }

  try {
    appendPathSentinel(rcFile);
    log(`  PATH        : ✓ appended pdlc block to ${rcFile}`);
    log(`                Run \`source ${rcFile}\` (or open a new terminal) to activate it now.`);
  } catch (err) {
    log(`  PATH        : ⚠️  Failed to write ${rcFile} — ${err.message}`);
    log(`                Add this manually: export PATH="$HOME/.local/bin:$PATH"`);
  }
}

function removeLocalBinFromRcFiles() {
  if (process.platform === 'win32') return;

  const home = os.homedir();
  const candidates = [
    path.join(home, '.zshrc'),
    path.join(home, '.bashrc'),
    path.join(home, '.bash_profile'),
  ];

  for (const rcFile of candidates) {
    let content;
    try { content = fs.readFileSync(rcFile, 'utf8'); } catch { continue; }
    const start = content.indexOf(PATH_SENTINEL_START);
    if (start < 0) continue;
    const endMark = content.indexOf(PATH_SENTINEL_END, start);
    if (endMark < 0) continue;

    let removeEnd = endMark + PATH_SENTINEL_END.length;
    if (content[removeEnd] === '\n') removeEnd++;
    let removeStart = start;
    if (removeStart > 0 && content[removeStart - 1] === '\n') removeStart--;

    const cleaned = content.slice(0, removeStart) + content.slice(removeEnd);
    try {
      fs.writeFileSync(rcFile, cleaned, 'utf8');
      log(`  PATH        : ✓ removed pdlc PATH block from ${rcFile}`);
    } catch (err) {
      log(`  PATH        : ⚠️  Could not update ${rcFile} — ${err.message}`);
    }
  }
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

  linkSuperclaudeToLocalBin();
  await ensureLocalBinOnPath({ _headless: opts._headless });

  if (opts._headless) {
    // Headless path (npm postinstall without a TTY): skip the interactive
    // Beads/Dolt prompts. The caller emits a follow-up block telling the
    // user to run `pdlc install` in a real terminal for the full setup.
    return;
  }

  await promptInstallPython3();

  // Beads installation is intentionally deferred to /setup (Phase 0
  // Initialization). PDLC's `pdlc install` only sets up the tool itself
  // (Claude Code hooks, slash commands, symlinks); project-level
  // prerequisites like Beads and Dolt are prompted inside /setup so they
  // run alongside the rest of the project bootstrap (CONSTITUTION,
  // INTENT, Memory Bank, Roadmap). This keeps the tool install fast and
  // network-friendly for users in restricted networks.

  // Plugin-conflict scan — detect tools whose commands/skills overlap with
  // PDLC's namespace (today: obra/superpowers' /brainstorm). Informational
  // for proper plugin installs (namespaced, no real collision); a warning
  // for raw-clone installs (unnamespaced, would shadow PDLC).
  try {
    const repoRoot     = local ? (opts.repoRoot || process.cwd()) : null;
    const conflictRes  = detectPluginConflicts({ repoRoot });
    const conflictRpt  = formatConflictReport(conflictRes);
    if (conflictRpt) {
      log('');
      log(conflictRpt);
    }
  } catch (_) {
    // Never fail install on a check error — the user can re-run
    // `pdlc check-conflicts` manually if curious.
  }

  log('\nStart a new Claude Code session to activate.');
  log('Next step  : open a project and run /setup\n');
}

/**
 * Clone-install-only cleanup. Removes the pin metadata file and offers to
 * delete the clone directory. Runs at the very end of `uninstall()`, after
 * settings/commands/symlinks/PATH cleanup. Skipped silently for npm installs.
 *
 * Safety: refuses to delete suspicious paths (empty, root, home directory).
 * Even though PLUGIN_ROOT is always derived from __dirname, the guard is
 * cheap insurance against future code paths that might shadow it.
 */
async function maybeCleanupCloneInstall() {
  if (!isCloneInstall()) return;

  // Pin metadata is invisible to the user \u2014 clean it up without asking.
  try { fs.unlinkSync(INSTALL_META_PATH); } catch {}

  // Sanity-check before any rm -rf.
  if (!PLUGIN_ROOT || PLUGIN_ROOT === '/' || PLUGIN_ROOT === os.homedir()) {
    log(`\n  Clone       : \u26a0\ufe0f  Refusing to suggest deletion of suspicious path ${PLUGIN_ROOT}`);
    return;
  }

  log(`\n  PDLC was installed from a local clone at ${PLUGIN_ROOT}.`);

  if (!process.stdin.isTTY) {
    log(`  Clone       : kept (non-interactive mode). Remove manually with:`);
    log(`                rm -rf ${PLUGIN_ROOT}`);
    return;
  }

  const answer = await prompt(`  Also delete the clone directory? (y/N) `);
  if (answer !== 'y' && answer !== 'yes') {
    log(`  Clone       : kept at ${PLUGIN_ROOT}.`);
    log(`                Remove manually with: rm -rf ${PLUGIN_ROOT}`);
    return;
  }

  // Delete the clone. Node holds the file descriptors of currently-loaded
  // .js files via the require cache; on POSIX the OS keeps inodes alive
  // until the process exits, so it's safe to rm -rf the clone we're
  // running from. The shell that invoked us continues fine because its
  // working directory and PATH lookups are independent of these files.
  try {
    execSync(`rm -rf "${PLUGIN_ROOT}"`, { stdio: 'pipe' });
    log(`  Clone       : \u2713 removed ${PLUGIN_ROOT}`);
  } catch (err) {
    log(`  Clone       : \u26a0\ufe0f  Could not remove ${PLUGIN_ROOT} \u2014 ${err.message}`);
    log(`                Remove it manually: rm -rf ${PLUGIN_ROOT}`);
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
    unlinkSuperclaudeFromLocalBin();
    unlinkPdlcFromLocalBin();
    removeLocalBinFromRcFiles();

    // Beads and Dolt are intentionally left alone. They live in your project
    // (.beads/ data + Dolt as a system service); a PDLC uninstall is not the
    // right surface for removing them. If you reinstall PDLC later, your
    // Beads task graph and Dolt data are preserved as-is.
    await maybeCleanupCloneInstall();
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
    unlinkSuperclaudeFromLocalBin();
    unlinkPdlcFromLocalBin();
    removeLocalBinFromRcFiles();

    // Beads and Dolt are intentionally left alone (see comment in the local
    // branch above). Your data is preserved for any future reinstall.
    await maybeCleanupCloneInstall();
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
    console.log('  PostCompact    \u2192 pdlc-context-reset.sh');
  }
  console.log('');
}

/**
 * Emit a prominent block telling the user to run `pdlc install` to finish
 * setup in a real terminal. Used when postinstall runs headless (no TTY)
 * — e.g., `npm install -g ./pdlc.tgz` from an offline tarball. The banner
 * graphic and Python prompt need a TTY, so we defer them.
 */
function headlessFollowup(local) {
  const cmd = local ? 'npx pdlc install --local' : 'pdlc install';
  const width = 62;
  const pad = (s) => '│  ' + s + ' '.repeat(Math.max(0, width - 4 - s.length)) + '│';
  const rule = '─'.repeat(width - 2);
  log('');
  log('┌' + rule + '┐');
  log(pad('PDLC v' + VERSION + ' files installed.'));
  log(pad('Interactive setup skipped (no terminal detected).'));
  log('├' + rule + '┤');
  log(pad('Run this in a terminal to finish setup:'));
  log(pad(''));
  log(pad('  ' + cmd));
  log(pad(''));
  log(pad('It prints the PDLC banner and finishes registering hooks.'));
  log(pad('Project prerequisites (Beads, Dolt) are installed when you'));
  log(pad('run /setup inside Claude Code, not during this install.'));
  log('└' + rule + '┘');
  log('');
}

/**
 * Called by `npm postinstall`. Auto-detects local vs global install, and
 * whether a TTY is available for the interactive flow.
 */
async function postinstall() {
  const initCwd = process.env.INIT_CWD || '';
  if (path.resolve(initCwd) === PLUGIN_ROOT) return;
  if (process.env.CI && !process.env.PDLC_INSTALL_IN_CI) return;

  const local = isLocalInstall();
  const interactive = process.stdin.isTTY && process.stdout.isTTY
    && !process.env.PDLC_NONINTERACTIVE;

  if (interactive) {
    if (local) {
      await install({ local: true, repoRoot: getRepoRoot() });
    } else {
      await install({ local: false });
    }
    return;
  }

  // Headless (offline tarball via `npm install -g ./pdlc.tgz`, CI, etc.):
  // register hooks + commands silently, then point the user at `pdlc install`
  // for the banner and interactive Beads/Dolt setup.
  await install({
    local,
    repoRoot: local ? getRepoRoot() : undefined,
    _skipBanner: true,
    _headless: true,
  });
  headlessFollowup(local);
}

/**
 * Detect whether this PDLC install is a git clone (GitHub-direct flow)
 * vs. an npm-managed install. Returns true if PLUGIN_ROOT/.git exists as a
 * directory. The clone path supports `pdlc upgrade` via `git pull`; the
 * npm path supports it via `npm install -g @pdlc-os/pdlc@latest`.
 */
function isCloneInstall() {
  try {
    return fs.statSync(path.join(PLUGIN_ROOT, '.git')).isDirectory();
  } catch {
    return false;
  }
}

const INSTALL_META_PATH = path.join(PLUGIN_ROOT, '.install-meta.json');

function readInstallMeta() {
  return readJson(INSTALL_META_PATH) || {};
}

function writeInstallMeta(meta) {
  if (Object.keys(meta).length === 0) {
    try { fs.unlinkSync(INSTALL_META_PATH); } catch {}
    return;
  }
  writeJson(INSTALL_META_PATH, meta);
}

function describeTag(sha) {
  try {
    return execSync(`git describe --tags --exact-match ${sha}`, {
      cwd: PLUGIN_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Clone-install upgrade flow. Returns `true` if the upgrade applied changes
 * and the caller should continue with the post-upgrade refresh (install
 * re-run, Beads/Dolt prompts, template migration). Returns `false` if the
 * upgrade was a no-op, refused, dry-run, or failed.
 */
async function upgradeViaGit(opts) {
  const meta = readInstallMeta();

  // Handle --unpin
  if (opts.unpin) {
    if (meta.pinned_to) {
      const wasPinnedTo = meta.pinned_to;
      delete meta.pinned_to;
      writeInstallMeta(meta);
      log(`  Pin cleared (was: ${wasPinnedTo}).`);
    } else {
      log(`  Not currently pinned. Nothing to unpin.`);
    }
    if (!opts.to) {
      // --unpin alone: don't auto-pull. User can run `pdlc upgrade` next.
      return false;
    }
  }

  // Refuse silent upgrade if pinned and no --to / --unpin
  if (meta.pinned_to && !opts.to && !opts.unpin) {
    log(`\n  PDLC is pinned to ${meta.pinned_to}.`);
    log(`    To unpin and pull latest main:    pdlc upgrade --unpin`);
    log(`    To pin to a different version:    pdlc upgrade --to vX.Y.Z`);
    return false;
  }

  // Fetch
  try {
    log(`  Fetching from origin...`);
    execSync('git fetch origin --tags --prune', {
      cwd: PLUGIN_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    log(`\n  git fetch failed at ${PLUGIN_ROOT}:`);
    log(`    ${err.message.trim().split('\n').slice(-1)[0]}`);
    log(`  Check network access to GitHub and try again.`);
    return false;
  }

  // Compute target ref + summary
  const targetRef = opts.to || 'origin/main';
  let currentSHA, targetSHA;
  try {
    currentSHA = execSync('git rev-parse HEAD', {
      cwd: PLUGIN_ROOT, encoding: 'utf8',
    }).trim();
    targetSHA = execSync(`git rev-parse ${targetRef}`, {
      cwd: PLUGIN_ROOT, encoding: 'utf8',
    }).trim();
  } catch (err) {
    log(`\n  Could not resolve ref '${targetRef}': ${err.message.trim()}`);
    return false;
  }

  if (currentSHA === targetSHA) {
    const tag = describeTag(currentSHA) || currentSHA.slice(0, 7);
    log(`  PDLC        : already at ${tag}. Nothing to do.`);
    return false;
  }

  // Count commits between current and target, regardless of direction
  // (forward = upgrade to newer; backward = pin to older).
  let commitsBetween = '?';
  let direction = '';
  try {
    const forward = execSync(
      `git rev-list --count ${currentSHA}..${targetSHA}`,
      { cwd: PLUGIN_ROOT, encoding: 'utf8' }
    ).trim();
    const backward = execSync(
      `git rev-list --count ${targetSHA}..${currentSHA}`,
      { cwd: PLUGIN_ROOT, encoding: 'utf8' }
    ).trim();
    if (parseInt(forward, 10) > 0 && parseInt(backward, 10) === 0) {
      commitsBetween = forward;
      direction = ' forward';
    } else if (parseInt(backward, 10) > 0 && parseInt(forward, 10) === 0) {
      commitsBetween = backward;
      direction = ' backward';
    } else {
      // Diverged — both branches have unique commits
      commitsBetween = `${backward} behind, ${forward} ahead`;
      direction = '';
    }
  } catch {}
  const currentLabel = describeTag(currentSHA) || currentSHA.slice(0, 7);
  const targetLabel = describeTag(targetSHA) || targetSHA.slice(0, 7);
  log(`  ${currentLabel} -> ${targetLabel} (${commitsBetween}${direction === '' ? '' : ` commit${commitsBetween === '1' ? '' : 's'}${direction}`})`);

  if (opts.check) {
    log(`  --check mode: no changes applied.`);
    return false;
  }

  // Refusals (skipped if --force OR --to specified)
  if (!opts.force && !opts.to) {
    const status = execSync('git status --porcelain', {
      cwd: PLUGIN_ROOT, encoding: 'utf8',
    });
    if (status.trim()) {
      log(`\n  Working tree at ${PLUGIN_ROOT} has uncommitted changes:`);
      for (const line of status.trim().split('\n').slice(0, 10)) {
        log(`      ${line}`);
      }
      log(`  Commit, stash, or run \`pdlc upgrade --force\` to discard them.`);
      return false;
    }
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: PLUGIN_ROOT, encoding: 'utf8',
    }).trim();
    if (branch !== 'main') {
      log(`\n  Currently on branch '${branch}', not 'main'.`);
      log(`  Run \`git -C ${PLUGIN_ROOT} checkout main\` first, or use \`pdlc upgrade --to <ref>\`.`);
      return false;
    }
  }

  // Apply
  try {
    if (opts.to) {
      log(`  Checking out ${opts.to}...`);
      execSync(`git checkout ${opts.to}`, {
        cwd: PLUGIN_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
      });
      const updatedMeta = readInstallMeta();
      updatedMeta.pinned_to = opts.to;
      writeInstallMeta(updatedMeta);
      log(`  Pinned to ${opts.to}. Future \`pdlc upgrade\` will refuse silent unpin.`);
    } else if (opts.force) {
      log(`  Force-resetting to origin/main (discarding local changes)...`);
      execSync('git reset --hard origin/main', {
        cwd: PLUGIN_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
      });
    } else {
      log(`  Pulling latest main...`);
      execSync('git pull --ff-only origin main', {
        cwd: PLUGIN_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
      });
    }
  } catch (err) {
    log(`\n  Upgrade failed: ${err.message.trim().split('\n').slice(-1)[0]}`);
    return false;
  }

  return true;
}

async function upgrade(opts = {}) {
  const local = opts.local || false;
  const scope = local ? 'locally' : 'globally';
  banner('Upgrading', VERSION);

  // Branch on install mode
  if (isCloneInstall()) {
    log(`  Upgrading PDLC from clone at ${PLUGIN_ROOT}...`);
    const applied = await upgradeViaGit(opts);
    if (!applied) {
      log('');
      return;
    }
  } else {
    // Validate flags that only make sense for clone installs
    if (opts.to || opts.force || opts.unpin || opts.check) {
      log(`  The --to / --force / --unpin / --check flags require a clone install.`);
      log(`    This PDLC was installed via npm at ${PLUGIN_ROOT}.`);
      log(`    For npm installs, use:  npm install -g @pdlc-os/pdlc@<version>`);
      return;
    }

    log(`  Upgrading PDLC ${scope}...`);

    const pdlcCmd = local
      ? 'npm update @pdlc-os/pdlc'
      : 'npm install -g @pdlc-os/pdlc@latest';

    try {
      execSync(pdlcCmd, { stdio: 'inherit' });
    } catch (err) {
      log(`\n  PDLC upgrade failed. You can upgrade manually:\n  ${pdlcCmd}`);
      return;
    }
  }

  // Re-read version after upgrade. Clear the require cache so we read the
  // new package.json on disk, not the memoized old one from session start.
  let newVersion;
  try {
    delete require.cache[require.resolve(path.join(PLUGIN_ROOT, 'package.json'))];
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

  // Prompt to upgrade Dolt
  if (isDoltInstalled()) {
    if (!process.stdin.isTTY) return;

    const doltCmd = (process.platform === 'darwin' || isHomebrewInstalled())
      ? 'brew upgrade dolt'
      : 'sudo bash -c \'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash\'';

    log(`\n  Dolt is currently installed (${doltVersion()}).`);
    const answer = await prompt('  Upgrade Dolt as well? (Y/n) ');
    if (answer === '' || answer === 'y' || answer === 'yes') {
      log('\n  Upgrading Dolt...');
      try {
        execSync(doltCmd, { stdio: 'inherit' });
        log(`  Dolt        : \u2713 upgraded (${doltVersion()})`);
      } catch (err) {
        log(`  Dolt upgrade failed. You can upgrade manually:\n  ${doltCmd}`);
      }
    } else {
      log('  Keeping current Dolt version.');
    }
  }

  // ── Template migration ───────────────────────────────────────────────────
  // Check if user's project has docs/pdlc/memory/ and migrate templates
  const repoRoot = opts.repoRoot || process.cwd();
  const memoryDir = path.join(repoRoot, 'docs', 'pdlc', 'memory');
  const templatesDir = path.join(PLUGIN_ROOT, 'templates');

  if (fs.existsSync(memoryDir) && fs.existsSync(templatesDir)) {
    log('\n  Checking project templates for migrations...');
    const migrations = migrateTemplates(memoryDir, templatesDir);
    if (migrations.length > 0) {
      log(`  Template migrations applied:`);
      for (const m of migrations) log(`    - ${m}`);
    } else {
      log('  Templates: \u2713 up to date');
    }

    // Ensure directories exist (added in later versions)
    const ensureDirs = [
      path.join(repoRoot, 'docs', 'pdlc', 'archive', 'prds'),
      path.join(repoRoot, 'docs', 'pdlc', 'archive', 'design'),
      path.join(repoRoot, 'docs', 'pdlc', 'archive', 'reviews'),
      path.join(repoRoot, 'docs', 'pdlc', 'archive', 'brainstorm'),
      path.join(repoRoot, 'docs', 'pdlc', 'archive', 'mom'),
    ];
    for (const d of ensureDirs) {
      if (!fs.existsSync(d)) {
        fs.mkdirSync(d, { recursive: true });
        log(`    - Created directory: ${path.relative(repoRoot, d)}`);
      }
    }
  }

  log('');
}

/**
 * Migrate user's memory files to match current templates.
 * - Creates missing files from templates
 * - Appends missing sections to existing files (additive only, never destructive)
 * - Preserves all user customizations
 */
function migrateTemplates(memoryDir, templatesDir) {
  const migrations = [];

  // Map of template files to their memory file counterparts
  const templateMap = {
    'CONSTITUTION.md': 'CONSTITUTION.md',
    'INTENT.md':       'INTENT.md',
    'STATE.md':        'STATE.md',
    'OVERVIEW.md':     'OVERVIEW.md',
    'METRICS.md':      'METRICS.md',
    'DEPLOYMENTS.md':  'DEPLOYMENTS.md',
  };

  for (const [templateName, memoryName] of Object.entries(templateMap)) {
    const templatePath = path.join(templatesDir, templateName);
    const memoryPath   = path.join(memoryDir, memoryName);

    if (!fs.existsSync(templatePath)) continue;

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const templateVersion = extractTemplateVersion(templateContent);

    // File doesn't exist — create it from template
    if (!fs.existsSync(memoryPath)) {
      fs.writeFileSync(memoryPath, templateContent, 'utf8');
      migrations.push(`Created ${memoryName} (v${templateVersion})`);
      continue;
    }

    // File exists — check version and migrate
    const userContent = fs.readFileSync(memoryPath, 'utf8');
    const userVersion = extractTemplateVersion(userContent);

    if (userVersion === templateVersion) continue; // up to date

    // Find sections in template that are missing from user's file
    const templateSections = extractSections(templateContent);
    const userSections     = extractSections(userContent);

    const missingSections = [];
    for (const [heading, content] of templateSections) {
      const userHas = userSections.some(([h]) =>
        h.replace(/^#+\s*/, '').trim().toLowerCase() ===
        heading.replace(/^#+\s*/, '').trim().toLowerCase()
      );
      if (!userHas) {
        missingSections.push({ heading, content });
      }
    }

    if (missingSections.length > 0) {
      // Append missing sections before the last line of the file
      let updated = userContent.trimEnd();
      for (const { heading, content } of missingSections) {
        updated += '\n\n---\n\n' + heading + '\n' + content;
      }

      // Update the version stamp
      if (userVersion) {
        updated = updated.replace(
          /<!--\s*pdlc-template-version:\s*[\d.]+\s*-->/,
          `<!-- pdlc-template-version: ${templateVersion} -->`
        );
      } else {
        // No version stamp — add one after the first line
        const lines = updated.split('\n');
        lines.splice(1, 0, `<!-- pdlc-template-version: ${templateVersion} -->`);
        updated = lines.join('\n');
      }

      fs.writeFileSync(memoryPath, updated + '\n', 'utf8');
      const sectionNames = missingSections.map(s =>
        s.heading.replace(/^#+\s*/, '').trim()
      ).join(', ');
      migrations.push(`${memoryName}: added sections [${sectionNames}] (v${userVersion || 'none'} → v${templateVersion})`);
    } else if (userVersion !== templateVersion) {
      // No missing sections but version is different — just update the stamp
      let updated = userContent;
      if (userVersion) {
        updated = updated.replace(
          /<!--\s*pdlc-template-version:\s*[\d.]+\s*-->/,
          `<!-- pdlc-template-version: ${templateVersion} -->`
        );
      } else {
        const lines = updated.split('\n');
        lines.splice(1, 0, `<!-- pdlc-template-version: ${templateVersion} -->`);
        updated = lines.join('\n');
      }
      fs.writeFileSync(memoryPath, updated, 'utf8');
      migrations.push(`${memoryName}: version stamp updated (v${userVersion || 'none'} → v${templateVersion})`);
    }
  }

  return migrations;
}

function extractTemplateVersion(content) {
  const match = content.match(/<!--\s*pdlc-template-version:\s*([\d.]+)\s*-->/);
  return match ? match[1] : null;
}

function extractSections(content) {
  // Extract ## and ### headings with their content
  const sections = [];
  const lines = content.split('\n');
  let currentHeading = null;
  let currentContent = [];

  for (const line of lines) {
    if (/^#{2,3}\s/.test(line)) {
      if (currentHeading) {
        sections.push([currentHeading, currentContent.join('\n').trim()]);
      }
      currentHeading = line;
      currentContent = [];
    } else if (currentHeading) {
      currentContent.push(line);
    }
  }
  if (currentHeading) {
    sections.push([currentHeading, currentContent.join('\n').trim()]);
  }
  return sections;
}

// ─── pdlc livemode: launch the visual portal in the default browser ──────────
//
// The portal is the bookmarkable URL (default http://localhost:7352/) that
// proxies to whichever PDLC backend is currently active — brainstorm visual
// companion (mockup voting), future craft live-server (variant generation),
// or both at once. This command starts the portal if it isn't already
// running, then opens it in the OS-native default browser. Backend-agnostic:
// the same command works for any visual surface PDLC has up.

async function launchLivemode() {
  const { execSync, spawn } = require('child_process');
  const portalDir = path.join(os.homedir(), '.pdlc', 'portal');
  const portalInfoPath = path.join(portalDir, 'portal-info.json');
  const startScript = path.join(PLUGIN_ROOT, 'scripts', 'start-portal.sh');

  let url = `http://localhost:${process.env.PDLC_PORTAL_PORT || 7352}/`;
  let isRunning = false;

  // Check portal-info to see whether a portal process is alive
  if (fs.existsSync(portalInfoPath)) {
    try {
      const info = JSON.parse(fs.readFileSync(portalInfoPath, 'utf8'));
      if (info.url) url = info.url;
      if (info.pid) {
        try { process.kill(info.pid, 0); isRunning = true; }
        catch (_) { isRunning = false; }
      }
    } catch (_) { /* malformed portal-info, will start fresh */ }
  }

  if (!isRunning) {
    log('Portal not running. Starting it now…');
    if (!fs.existsSync(startScript)) {
      log(`✗ Could not find ${startScript}. Are you running from a PDLC install?`);
      process.exit(1);
    }
    try {
      const result = execSync(`bash "${startScript}"`, { encoding: 'utf8', timeout: 15000 });
      const lines = result.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      try {
        const parsed = JSON.parse(lastLine);
        if (parsed.url) url = parsed.url;
      } catch (_) { /* not JSON — just proceed with default url */ }
      log(`✓ Portal started at ${url}`);
    } catch (err) {
      log(`✗ Failed to start portal: ${err.message}`);
      if (err.stderr) log(err.stderr.toString());
      process.exit(1);
    }
  } else {
    log(`Portal already running at ${url}`);
  }

  // Launch URL in default browser
  let opener;
  if (process.platform === 'darwin') opener = ['open', [url]];
  else if (process.platform === 'win32') opener = ['cmd', ['/c', 'start', '""', url]];
  else opener = ['xdg-open', [url]];

  try {
    spawn(opener[0], opener[1], { detached: true, stdio: 'ignore' }).unref();
    log(`Opened ${url}`);
  } catch (err) {
    log(`Could not open browser automatically: ${err.message}`);
    log(`Open this URL manually: ${url}`);
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
  npx @pdlc-os/pdlc upgrade             Upgrade PDLC + Beads globally
  npx @pdlc-os/pdlc upgrade --local     Upgrade PDLC + Beads locally
  npx @pdlc-os/pdlc status              Show install status
  npx @pdlc-os/pdlc check-conflicts     Scan for plugin/skill conflicts (e.g. obra/superpowers)
  pdlc livemode                         Open the visual portal (http://localhost:7352/) in your default browser. Shows whichever PDLC backend is currently rendering — brainstorm mockups, craft variants, or the idle page. Starts the portal if not already running.
  npx @pdlc-os/pdlc --version           Print version

Local install (recommended for teams):
  cd your-repo
  npm install --save-dev @pdlc-os/pdlc   Auto-detects local context and installs to .claude/

Global install:
  npm install -g @pdlc-os/pdlc           Installs hooks for all projects

Slash commands (inside a Claude Code session after install):
  /setup        Phase 0 \u2014 Initialization: Constitution \xb7 Intent \xb7 Memory Bank \xb7 Beads
  /brainstorm   Phase 1 \u2014 Inception: Discover \u2192 Define \u2192 Design \u2192 Plan
  /build        Phase 2 \u2014 Construction: Build \u2192 Review \u2192 Test
  /ship         Phase 3 \u2014 Operation: Ship \u2192 Verify \u2192 Reflect
  /decide       Record a decision in the Decision Registry (any phase)
  /whatif       Explore a hypothetical scenario with read-only team analysis
  /diagnose     Run a comprehensive health check on PDLC state and code alignment
  /rollback     Revert a shipped feature with post-mortem and fix options
  /hotfix       Emergency compressed build-ship cycle for production issues
  /abandon      Abandon the current feature and clean up artifacts
  /pause        Pause the current feature and save state for later
  /continue     Resume a paused feature from its saved checkpoint
  /release      Force-release a stuck roadmap claim so another dev can pick it up
  /override     Override a Tier 1 safety block (double-RED confirmation)

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
    case 'upgrade': {
      const toIdx = rest.indexOf('--to');
      const toRef = toIdx >= 0 ? rest[toIdx + 1] : null;
      await upgrade({
        local: hasLocal,
        check: rest.includes('--check'),
        force: rest.includes('--force'),
        unpin: rest.includes('--unpin'),
        to: toRef,
      });
      break;
    }
    case 'status':
      status();
      break;
    case 'check-conflicts': {
      const json     = rest.includes('--json');
      const repoIdx  = rest.indexOf('--repo-root');
      const repoRoot = repoIdx >= 0 ? rest[repoIdx + 1] : process.cwd();
      const result   = detectPluginConflicts({ repoRoot });
      if (json) {
        process.stdout.write(JSON.stringify(result, null, 2) + '\n');
      } else {
        const report = formatConflictReport(result);
        process.stdout.write((report || '✓ No plugin conflicts detected — PDLC has clean ownership of its slash commands.') + '\n');
      }
      const hasRaw = result.summary === 'raw-only' || result.summary === 'mixed';
      process.exit(hasRaw ? 2 : 0);
      break;
    }
    case 'postinstall':
      await postinstall();
      break;
    case 'livemode':
      await launchLivemode();
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
