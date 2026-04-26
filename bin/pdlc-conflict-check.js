#!/usr/bin/env node
// pdlc-conflict-check.js — detect Claude Code plugins / raw skill clones whose
// commands or skills overlap with PDLC's namespace. Today this targets
// obra/superpowers because it ships a /brainstorm slash command that, when
// installed as raw files (not as a proper Claude Code plugin), collides with
// PDLC's /brainstorm. The structure is generic so additional known-conflicting
// projects can be added by appending entries to KNOWN_CONFLICTS.
//
// Two install modes are detected separately:
//   - "plugin"  — installed via `claude plugins install …` and listed in
//                 `enabledPlugins` (settings.json) or `installed_plugins.json`.
//                 Claude Code namespaces plugin commands as /<plugin>:<cmd>, so
//                 this is informational, not a real collision.
//   - "raw"     — files dropped directly into ~/.claude/commands/ or
//                 ~/.claude/skills/ (or project equivalents). These ARE
//                 unnamespaced and DO collide with PDLC's commands of the
//                 same name. Detection cross-checks the PDLC-managed marker
//                 in command files to avoid false positives on PDLC's own
//                 installed copies.
//
// Used by:
//   - `pdlc check-conflicts` CLI subcommand
//   - `pdlc install` postinstall summary
//   - `/setup` Step 1 prerequisites
//   - `/diagnose` Check 9

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const HOME              = os.homedir();
const USER_SETTINGS     = path.join(HOME, '.claude', 'settings.json');
const INSTALLED_PLUGINS = path.join(HOME, '.claude', 'plugins', 'installed_plugins.json');
const USER_COMMANDS_DIR = path.join(HOME, '.claude', 'commands');
const USER_SKILLS_DIR   = path.join(HOME, '.claude', 'skills');

const PDLC_MARKER = 'pdlc-managed';

// Catalog of known-conflicting tools. Each entry contains:
//   id              — short identifier used in report output
//   displayName     — human-readable name including org for clarity
//   pluginKeyRegex  — matches `enabledPlugins` keys / `installed_plugins.json` keys
//   skillFingerprint — relative path from .claude/skills/ that, if present,
//                      strongly indicates the raw repo was cloned in
//   conflictingCommands — slash command filenames that, if present without
//                         the PDLC marker, indicate a non-PDLC source. Each
//                         entry includes whether the conflict is with a
//                         PDLC-shipped command (and which one) or just a
//                         foreign command.
const KNOWN_CONFLICTS = [
  {
    id: 'superpowers',
    displayName: 'obra/superpowers',
    pluginKeyRegex: /^superpowers(@|$)/i,
    skillFingerprint: 'brainstorming/SKILL.md',
    conflictingCommands: [
      { file: 'brainstorm.md',   collidesWith: '/brainstorm (PDLC)', severity: 'collision' },
      { file: 'execute-plan.md', collidesWith: null,                 severity: 'foreign'   },
      { file: 'write-plan.md',   collidesWith: null,                 severity: 'foreign'   },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (_) { return null; }
}

function fileExists(p) {
  try { fs.accessSync(p, fs.constants.F_OK); return true; }
  catch (_) { return false; }
}

function readEnabledPluginKeys(settingsPath) {
  const settings = readJsonSafe(settingsPath);
  if (!settings || typeof settings.enabledPlugins !== 'object' || settings.enabledPlugins === null) {
    return [];
  }
  return Object.keys(settings.enabledPlugins);
}

function readInstalledPluginKeys() {
  const data = readJsonSafe(INSTALLED_PLUGINS);
  if (!data || typeof data.plugins !== 'object' || data.plugins === null) return [];
  return Object.keys(data.plugins);
}

function commandHasPdlcMarker(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(PDLC_MARKER);
  } catch (_) {
    return false;
  }
}

// ── Plugin-install detection ────────────────────────────────────────────────
function detectPluginInstalls(repoRoot, conflict) {
  const sources = [
    { path: USER_SETTINGS, scope: 'user' },
  ];
  if (repoRoot) {
    sources.push(
      { path: path.join(repoRoot, '.claude', 'settings.json'),       scope: 'project' },
      { path: path.join(repoRoot, '.claude', 'settings.local.json'), scope: 'project-local' },
    );
  }

  const hits = [];
  for (const src of sources) {
    const keys    = readEnabledPluginKeys(src.path);
    const matches = keys.filter(k => conflict.pluginKeyRegex.test(k));
    if (matches.length) {
      hits.push({ via: 'enabledPlugins', scope: src.scope, path: src.path, keys: matches });
    }
  }

  const installedKeys = readInstalledPluginKeys();
  const installedMatches = installedKeys.filter(k => conflict.pluginKeyRegex.test(k));
  if (installedMatches.length) {
    hits.push({ via: 'installed_plugins.json', scope: 'user', path: INSTALLED_PLUGINS, keys: installedMatches });
  }
  return hits;
}

// ── Raw-clone detection ─────────────────────────────────────────────────────
function detectRawInstalls(repoRoot, conflict) {
  const hits = [];

  // Skill-directory fingerprint
  const skillTargets = [
    { scope: 'user',    path: path.join(USER_SKILLS_DIR, conflict.skillFingerprint) },
  ];
  if (repoRoot) {
    skillTargets.push(
      { scope: 'project', path: path.join(repoRoot, '.claude', 'skills', conflict.skillFingerprint) },
    );
  }
  for (const t of skillTargets) {
    if (fileExists(t.path)) {
      hits.push({
        kind:     'skill-dir',
        scope:    t.scope,
        path:     t.path,
        skillDir: path.dirname(t.path),
      });
    }
  }

  // Command-file fingerprint (PDLC-marker-aware)
  const cmdTargets = [];
  for (const cmd of conflict.conflictingCommands) {
    cmdTargets.push({ scope: 'user',    path: path.join(USER_COMMANDS_DIR, cmd.file), cmd });
    if (repoRoot) {
      cmdTargets.push({ scope: 'project', path: path.join(repoRoot, '.claude', 'commands', cmd.file), cmd });
    }
  }
  for (const t of cmdTargets) {
    if (!fileExists(t.path)) continue;
    if (commandHasPdlcMarker(t.path)) continue;  // it's PDLC's, not the conflicting tool's
    hits.push({
      kind:     'command',
      scope:    t.scope,
      path:     t.path,
      file:     t.cmd.file,
      severity: t.cmd.severity,
      collidesWith: t.cmd.collidesWith,
    });
  }

  return hits;
}

// ── Top-level detection ─────────────────────────────────────────────────────
function detectPluginConflicts(opts = {}) {
  const repoRoot = opts.repoRoot || null;
  const findings = [];

  for (const conflict of KNOWN_CONFLICTS) {
    const plugin = detectPluginInstalls(repoRoot, conflict);
    const raw    = detectRawInstalls(repoRoot, conflict);
    if (plugin.length === 0 && raw.length === 0) continue;

    let mode;
    if (plugin.length && raw.length) mode = 'both';
    else if (plugin.length)          mode = 'plugin-only';
    else                              mode = 'raw-only';

    findings.push({
      id:          conflict.id,
      displayName: conflict.displayName,
      mode,
      plugin,
      raw,
    });
  }

  let summary;
  if (findings.length === 0)                              summary = 'clean';
  else if (findings.every(f => f.mode === 'plugin-only')) summary = 'plugin-only';
  else if (findings.every(f => f.mode === 'raw-only'))    summary = 'raw-only';
  else                                                    summary = 'mixed';

  return { findings, summary };
}

// ── Report formatting ──────────────────────────────────────────────────────
function formatReport(result) {
  if (result.summary === 'clean') return null;

  const lines = [];

  for (const f of result.findings) {
    const hasRaw    = f.raw.length    > 0;
    const hasPlugin = f.plugin.length > 0;

    if (hasRaw) {
      lines.push(`⚠️  PDLC conflict: ${f.displayName} appears to be installed as raw skills/commands (not as a Claude Code plugin).`);
      lines.push('');
      lines.push('   Locations detected:');
      for (const h of f.raw) {
        if (h.kind === 'skill-dir') {
          lines.push(`     • [${h.scope}] ${h.skillDir}/  — fingerprint skill directory`);
        } else {
          const collisionNote = h.severity === 'collision'
            ? ` — would collide with ${h.collidesWith}`
            : ' — foreign slash command';
          lines.push(`     • [${h.scope}] ${h.path}${collisionNote}`);
        }
      }
      lines.push('');
      lines.push('   Why this matters: when raw command files share a name with a PDLC command (e.g. `/brainstorm`),');
      lines.push('   one silently shadows the other and which one wins is implementation-defined. Plugin installs');
      lines.push('   avoid this by namespacing each plugin\'s commands.');
      lines.push('');
      lines.push('   Resolution options:');
      lines.push(`     A. Reinstall ${f.displayName} as a proper Claude Code plugin so its commands are`);
      lines.push(`        namespaced. After removing the raw files, run:`);
      lines.push(`            claude plugins install ${f.id}@<marketplace>`);
      lines.push('        Both /brainstorm (PDLC) and /<plugin>:brainstorm will then coexist cleanly.');
      lines.push('     B. Manually remove the conflicting raw files:');
      for (const h of f.raw.filter(x => x.kind === 'command')) {
        lines.push(`            rm ${h.path}`);
      }
      for (const h of f.raw.filter(x => x.kind === 'skill-dir')) {
        lines.push(`            rm -rf ${h.skillDir}`);
      }
      lines.push('     C. Keep both as-is — accept that one /brainstorm shadows the other.');
      if (hasPlugin) {
        lines.push('');
        lines.push(`   (${f.displayName} is also enabled as a plugin; that side is fine and stays namespaced.)`);
      }
    } else if (hasPlugin) {
      lines.push(`ℹ️  ${f.displayName} is installed as a Claude Code plugin alongside PDLC.`);
      lines.push('');
      lines.push('   Detected at:');
      for (const h of f.plugin) {
        const keys = h.keys.join(', ');
        lines.push(`     • [${h.scope}] ${h.path}  (${h.via}: ${keys})`);
      }
      lines.push('');
      lines.push('   No command collision: plugin commands are namespaced (e.g. `/superpowers:brainstorm`)');
      lines.push('   while PDLC\'s remain unnamespaced (`/brainstorm`). Both coexist. Heads-up: invoking the');
      lines.push('   other tool\'s skills mid-PDLC-feature may diverge from PDLC\'s phase discipline.');
    }
    lines.push('');
  }

  return lines.join('\n').replace(/\n+$/, '');
}

module.exports = { detectPluginConflicts, formatReport, PDLC_MARKER };

// ── CLI entry ──────────────────────────────────────────────────────────────
if (require.main === module) {
  const args     = process.argv.slice(2);
  const json     = args.includes('--json');
  const repoIdx  = args.indexOf('--repo-root');
  const repoRoot = repoIdx >= 0 ? args[repoIdx + 1] : process.cwd();

  const result = detectPluginConflicts({ repoRoot });

  if (json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const report = formatReport(result);
    if (report) {
      process.stdout.write(report + '\n');
    } else {
      process.stdout.write('✓ No plugin conflicts detected — PDLC has clean ownership of its slash commands.\n');
    }
  }

  // Exit codes:
  //   0 — clean OR plugin-only (informational, not a real conflict)
  //   2 — at least one raw-clone conflict was detected
  const hasRawConflict = result.summary === 'raw-only' || result.summary === 'mixed';
  process.exit(hasRawConflict ? 2 : 0);
}
