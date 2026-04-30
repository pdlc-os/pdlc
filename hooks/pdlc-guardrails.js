#!/usr/bin/env node
// pdlc-guardrails.js — PDLC PreToolUse hook for Claude Code
// Fires before every Bash tool execution; enforces Tier 1 (hard block) and
// Tier 2 (pause & confirm) safety guardrails defined in plan.md / CONSTITUTION.md.

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Output helpers ────────────────────────────────────────────────────────────
function allow() {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

function block(reason) {
  process.stdout.write(JSON.stringify({ continue: false, reason }));
  process.exit(0);
}

function warn(systemMessage) {
  process.stdout.write(JSON.stringify({ continue: true, systemMessage }));
  process.exit(0);
}

// ── Tier 1 block message builder ─────────────────────────────────────────────
function tier1Block(reason, command) {
  // Escape double quotes in the command for safe embedding
  const safeCmd = command.replace(/"/g, '\\"');
  const msg =
    `\x1b[41m\x1b[37m ⛔ PDLC HARD BLOCK — TIER 1 SAFETY ⛔ \x1b[0m\n` +
    `\x1b[31mThis action is blocked: ${reason}.\n\n` +
    `To override, run the double-RED confirmation protocol:\n` +
    `  \`/override "${safeCmd}"\`\n\n` +
    `This requires two explicit confirmations and is permanently logged.\x1b[0m`;
  block(msg);
}

// ── Tier 2 confirmation message builder ──────────────────────────────────────
function tier2Block(command) {
  const msg =
    `⚠️  PDLC Tier 2 Confirmation Required\n\n` +
    `About to run: ${command}\n\n` +
    `Type 'yes' to confirm or 'no' to cancel.`;
  block(msg);
}

function tier2Logged(command) {
  warn(`⚠️ Tier 2 action logged: ${command}`);
}

// ── CONSTITUTION.md helpers ───────────────────────────────────────────────────
function readConstitution(cwd) {
  try {
    const constitutionPath = path.join(cwd, 'docs', 'pdlc', 'memory', 'CONSTITUTION.md');
    return fs.readFileSync(constitutionPath, 'utf8');
  } catch (_) {
    return null;
  }
}

// Parse tier2_as_tier3 overrides from the "## 8. Safety Guardrail Overrides" table.
// Returns an array of lowercase tier 2 item strings that have been downgraded.
function parseTier2Overrides(constitutionContent) {
  if (!constitutionContent) return [];

  const overrides = [];

  // Find the Safety Guardrail Overrides section
  const sectionMatch = constitutionContent.match(
    /##\s*8\.\s*Safety Guardrail Overrides([\s\S]*?)(?=\n##\s|\n---\s*$|$)/i
  );
  if (!sectionMatch) return overrides;

  const section = sectionMatch[1];

  // Parse markdown table rows — skip the header and separator rows
  const tableRowRe = /^\|\s*([^|]+?)\s*\|/gm;
  let match;
  let rowIndex = 0;

  while ((match = tableRowRe.exec(section)) !== null) {
    rowIndex++;
    if (rowIndex <= 2) continue; // skip header + separator

    const cell = match[1].trim().toLowerCase();
    // Skip placeholder rows
    if (!cell || cell.startsWith('<!--') || cell === 'tier 2 item') continue;
    overrides.push(cell);
  }

  return overrides;
}

// Check if a command string matches any of the downgraded tier2 items
function isTier2Downgraded(command, overrides) {
  const cmdLower = command.toLowerCase();
  return overrides.some(override => {
    if (!override || override.startsWith('<!--')) return false;
    // Match by keyword presence
    return cmdLower.includes(override) || override.includes(cmdLower.slice(0, 20));
  });
}

// ── STATE.md test-gate check ──────────────────────────────────────────────────
// Returns true if test gates appear to have passed (or if STATE.md is absent —
// in that case we give the benefit of the doubt).
function testGatesHavePassed(cwd) {
  try {
    const statePath = path.join(cwd, 'docs', 'pdlc', 'memory', 'STATE.md');
    const content   = fs.readFileSync(statePath, 'utf8');
    // Look for explicit gate-failure markers written by PDLC hooks.
    // If the phase is NOT Operation/Ship, deploy is likely premature.
    const phaseMatch = content.match(/##\s*Current Phase\s*\n[\s\S]*?\n([A-Za-z]+)/);
    if (phaseMatch) {
      const phase = phaseMatch[1].trim().toLowerCase();
      // Only allow deploy commands during Operation phase
      if (phase !== 'operation') return false;
    }
    return true;
  } catch (_) {
    return true; // No STATE.md — don't block
  }
}

// ── Deploy command detection ──────────────────────────────────────────────────
const DEPLOY_PATTERNS = [
  /\bfly\s+deploy\b/i,
  /\bvercel\s+deploy\b/i,
  /\bnpm\s+run\s+deploy\b/i,
  /\byarn\s+deploy\b/i,
  /\bpnpm\s+deploy\b/i,
  /\bheroku\s+.*deploy\b/i,
  /\baws\s+.*deploy\b/i,
  /\bgcloud\s+.*deploy\b/i,
  /\bdocker\s+.*push\b/i,
  /\bkubectl\s+apply\b/i,
  /\bterraform\s+apply\b/i,
  /\bpulumi\s+up\b/i,
  /\bcdk\s+deploy\b/i,
  /\beb\s+deploy\b/i,
  /\bsam\s+deploy\b/i,
  /\bserverless\s+deploy\b/i,
];

function isDeployCommand(cmd) {
  return DEPLOY_PATTERNS.some(re => re.test(cmd));
}

// ── Production DB detection ───────────────────────────────────────────────────
const PROD_DB_INDICATORS = [
  /prod(uction)?[_-]?(db|database|host|url|pg|mysql|sqlite)/i,
  /DATABASE_URL.*prod/i,
  /-h\s+(prod|production|db\.prod|rds\.amazonaws)/i,
  /postgresql:\/\/.*prod/i,
  /mysql:\/\/.*prod/i,
  /@prod[^a-z]/i,
];

function isProductionDbCommand(cmd) {
  if (!/\b(psql|mysql|sqlite3|mariadb)\b/.test(cmd)) return false;
  return PROD_DB_INDICATORS.some(re => re.test(cmd));
}

// ── External write call detection ─────────────────────────────────────────────
const EXTERNAL_WRITE_PATTERNS = [
  /curl\s+.*-X\s+(POST|PUT|PATCH|DELETE)/i,
  /curl\s+.*(--data|--data-raw|--data-binary|-d\s)/i,
  /wget\s+.*--post(-data)?/i,
  /\bfetch\b.*\b(POST|PUT|PATCH|DELETE)\b/i,
  /\baxios\.(post|put|patch|delete)\b/i,
  /\bhttpie\b.*\b(POST|PUT|DELETE)\b/i,
];

// Only flag calls to clearly external (non-localhost) URLs
const EXTERNAL_URL_PATTERN = /https?:\/\/(?!localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[::1\])/i;

function isExternalWriteCall(cmd) {
  return EXTERNAL_WRITE_PATTERNS.some(re => re.test(cmd)) &&
         EXTERNAL_URL_PATTERN.test(cmd);
}

// ── Metadata commands that legitimately quote file names in message text ────
// git commit, git tag -m, gh release/pr/issue with --notes/--body commonly contain
// PDLC memory file names in their message bodies. Those commands don't modify the
// filesystem, so file-write guardrails must not fire on them.
const METADATA_COMMAND_PATTERNS = [
  /^\s*git\s+commit\b/,
  /^\s*git\s+tag\b.*\s-[am]\b/,
  /^\s*gh\s+(release|pr|issue)\b/,
  /^\s*gh\s+api\b/,
];

function isMetadataCommand(cmd) {
  return METADATA_COMMAND_PATTERNS.some(re => re.test(cmd));
}

// ── Protected memory file write-target detection ───────────────────────────
// Catches Bash-redirection writes to PDLC's protected memory files. Scoped to
// `docs/pdlc/memory/` so files merely *named* CONSTITUTION.md or DECISIONS.md
// elsewhere on disk (test fixtures, unrelated user notes) don't trip this.
// Mirrors the Edit/Write tool path's `getProtectedFileMatch()` logic.
//
// Patterns covered:
//   sed/awk/tee/mv/cp …… docs/pdlc/memory/CONSTITUTION.md
//   echo/printf …… > docs/pdlc/memory/DECISIONS.md
//   > path/.../docs/pdlc/memory/CONSTITUTION.md  (any redirection target)
const PROTECTED_MEMORY_WRITE_PATTERNS = [
  /\b(sed|awk|tee|mv|cp|rm|install|cat)\s+[^|;&]*docs\/pdlc\/memory\/(CONSTITUTION|DECISIONS)\.md\b/,
  />>?\s*[^|;&]*docs\/pdlc\/memory\/(CONSTITUTION|DECISIONS)\.md\b/,
];

// Returns the matched basename ('CONSTITUTION.md' or 'DECISIONS.md') or null.
function writesToProtectedMemoryFile(cmd) {
  for (const re of PROTECTED_MEMORY_WRITE_PATTERNS) {
    if (re.test(cmd)) {
      if (/docs\/pdlc\/memory\/CONSTITUTION\.md\b/.test(cmd)) return 'CONSTITUTION.md';
      if (/docs\/pdlc\/memory\/DECISIONS\.md\b/.test(cmd))    return 'DECISIONS.md';
      return 'memory file';
    }
  }
  return null;
}

// ── Protected PDLC files ─────────────────────────────────────────────────────
const PROTECTED_FILES = {
  // Tier 2 — pause and confirm
  tier2: [
    'CONSTITUTION.md',
    'DECISIONS.md',
  ],
  // Tier 3 — logged warning
  tier3: [
    'STATE.md',
    'ROADMAP.md',
    'INTENT.md',
    'OVERVIEW.md',
    'CHANGELOG.md',
  ],
};

function getProtectedFileMatch(filePath) {
  if (!filePath) return null;
  const basename = path.basename(filePath);
  const inMemory = filePath.includes('docs/pdlc/memory/') || filePath.includes('docs\\pdlc\\memory\\');

  if (!inMemory) return null;

  if (PROTECTED_FILES.tier2.includes(basename)) return { file: basename, tier: 2 };
  if (PROTECTED_FILES.tier3.includes(basename)) return { file: basename, tier: 3 };
  return null;
}

// First-time create detection — Tier 2 protects against state drift in existing
// files. A file that does not yet exist has no prior state to drift from, so
// `/setup` Step 5 (which Writes CONSTITUTION.md and DECISIONS.md from templates)
// is naturally an "init mode" pass-through. Subsequent overwrites on the same
// path still trip Tier 2.
function fileExistsOnDisk(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

// Temp-path detection for `rm -rf` exemption — system temp roots are designed
// to be ephemeral, and blocking deletes inside them interrupts test fixtures,
// scratch workflows, and `mktemp -d` cleanup. Only subpaths of these roots are
// exempt; `rm -rf /tmp` itself still trips the normal guardrails.
const TEMP_PATH_PREFIXES = [
  '/tmp/',
  '/var/tmp/',
  '/var/folders/',
  '/private/tmp/',
  '/private/var/tmp/',
  '/private/var/folders/',
];

function unwrapQuotes(s) {
  if (!s) return s;
  s = s.trim();
  if (s.length >= 2) {
    const first = s[0];
    const last  = s[s.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return s.slice(1, -1);
    }
  }
  return s;
}

function isTempPath(target) {
  if (!target) return false;
  const t = unwrapQuotes(target);
  return TEMP_PATH_PREFIXES.some(prefix => t.startsWith(prefix));
}

// Extract the first argument after `rm` + flags. Handles double-quoted,
// single-quoted, and bare-token forms. The earlier `(.+)$` regex was greedy
// to end-of-string and broke on compound commands — e.g. for
// `echo a; rm -rf "$X"; echo b` it captured `"$X"; echo b` as the target,
// which then failed isTempPath even when $X resolved to /tmp/foo.
function extractRmTarget(command) {
  const m = command.match(/rm\s+(?:-[a-zA-Z]+\s+)+("[^"]*"|'[^']*'|\S+)/);
  return m ? m[1] : '';
}

// Best-effort: find an earlier shell assignment of `varName` in the same
// command string. Recognises VAR="..." (preserves embedded spaces) and
// VAR=value (bare, no whitespace). Does not handle VAR=$(...), arithmetic
// expansion, or arrays — returns null for those (caller treats as
// unresolvable and falls through to existing path checks).
function findShellAssignment(varName, command) {
  const quoted = new RegExp('(?:^|[\\s;&|])' + varName + '=(?:"([^"]*)"|\'([^\']*)\')');
  const qm = command.match(quoted);
  if (qm) return qm[1] !== undefined ? qm[1] : qm[2];
  const bare = new RegExp('(?:^|[\\s;&|])' + varName + '=(\\S+)');
  const bm = command.match(bare);
  if (bm) return bm[1];
  return null;
}

// Resolve a `$VAR` / `${VAR}` reference at the start of an rm target using
// an earlier assignment in the same command. Returns the resolved literal
// string (with any literal suffix preserved), or the original target if
// not statically resolvable. Conservative: handles a single variable at the
// start of the target with an optional literal suffix; does not recurse,
// does not chain across multiple variables.
function resolveRmTarget(target, command) {
  const unquoted = unwrapQuotes(target);
  const m = unquoted.match(/^\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?(.*)$/);
  if (!m) return unquoted;
  const value = findShellAssignment(m[1], command);
  if (value === null) return unquoted;
  return value + m[2];
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  let input = {};

  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (raw) input = JSON.parse(raw);
  } catch (_) {
    allow();
  }

  const toolName = input.tool_name || '';
  const cwd      = input.cwd || process.cwd();

  // ── Handle Edit and Write tools ─────────────────────────────────────────────
  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = (input.tool_input && input.tool_input.file_path) || '';
    const match = getProtectedFileMatch(filePath);

    if (!match) allow();

    const constitution   = readConstitution(cwd);
    const tier2Overrides = parseTier2Overrides(constitution);

    if (match.tier === 2) {
      // Init-mode pass-through: a Write that creates the file for the first
      // time has no existing state to protect, so Tier 2 doesn't apply. Logged
      // as Tier 3 for visibility. /setup Step 5a/5e relies on this when
      // generating CONSTITUTION.md and DECISIONS.md from templates.
      if (toolName === 'Write' && !fileExistsOnDisk(filePath)) {
        warn(`⚠️ Tier 3 logged: Write creating new ${match.file} (init mode — Tier 2 bypassed; no prior state to protect)`);
      }

      // Check if this specific file has been downgraded to tier 3
      const label = `changing ${match.file.toLowerCase().replace('.md', '')}`;
      if (isTier2Downgraded(label, tier2Overrides)) {
        warn(`⚠️ Tier 3 logged: ${toolName} on protected file ${match.file}`);
      } else {
        block(
          `⚠️  PDLC Tier 2 Confirmation Required\n\n` +
          `About to ${toolName.toLowerCase()} protected file: ${match.file}\n\n` +
          `This file is part of PDLC's memory bank and is normally managed by PDLC commands.\n` +
          `Direct edits may cause state drift that \`/diagnose\` will flag.\n\n` +
          `Type 'yes' to confirm or 'no' to cancel.`
        );
      }
    } else if (match.tier === 3) {
      warn(`⚠️ Tier 3 logged: ${toolName} on PDLC memory file ${match.file}`);
    }

    allow();
  }

  // ── Handle Bash tool ────────────────────────────────────────────────────────
  if (toolName !== 'Bash') {
    allow();
  }

  const command = (input.tool_input && input.tool_input.command) || '';

  if (!command) allow();

  // ── Metadata-command short-circuit ──────────────────────────────────────────
  // git commit / git tag -m / gh release|pr|issue / gh api legitimately quote
  // arbitrary text in their argument bodies — commit messages, release notes,
  // PR descriptions. That text routinely mentions destructive command names
  // ("rm -rf", "git reset --hard", "DROP TABLE", "curl -X POST") to describe
  // what a release contains. Those substrings are message-body data; the outer
  // command does not execute them. Without this short-circuit, every rule
  // below false-positives on harmless metadata.
  //
  // Trade-off: a chained command like `git commit -m "x" && rm -rf /etc`
  // would also bypass guardrails. The threat model here is accidental
  // destruction (which doesn't chain through commit messages), not
  // adversarial bypass (which the hook can't stop anyway). The simple
  // full-bypass is the pragmatic answer.
  if (isMetadataCommand(command)) {
    allow();
  }

  // ── Read CONSTITUTION.md ────────────────────────────────────────────────────
  const constitution   = readConstitution(cwd);
  const tier2Overrides = parseTier2Overrides(constitution);

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1 — Hard blocks
  // ═══════════════════════════════════════════════════════════════════════════

  // 1a. Force-push to main / master
  if (
    /git\s+push\s+.*(-f\b|--force\b)/.test(command) &&
    /\b(main|master)\b/.test(command)
  ) {
    tier1Block('force-pushing to main/master is not allowed', command);
  }

  // Also catch: git push --force (without explicit branch but implicitly dangerous)
  if (/git\s+push\s+(-f\b|--force\b)/.test(command) && !/git\s+push\s+.*-f\s+\S+\s+\S+:\S+/.test(command)) {
    // If no refspec that maps to a non-protected branch, be safe and check:
    if (!command.includes('feature/') && !command.includes('fix/') && !command.includes('chore/')) {
      tier1Block('force-pushing without an explicit non-protected branch target', command);
    }
  }

  // 1b. DROP TABLE without preceding migration file
  if (/DROP\s+TABLE\b/i.test(command)) {
    // We don't have full session history here, so always block and ask for
    // confirmation that a migration file has been created.
    tier1Block(
      'DROP TABLE detected — a migration file must be created before dropping tables',
      command
    );
  }

  // 1c. rm -rf on paths that look outside the project/feature scope
  if (/rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+/.test(command)) {
    // Extract the rm argument (handles "...", '...', and bare tokens) and
    // resolve any $VAR / ${VAR} prefix using earlier assignments in the same
    // command. The raw target is preserved for the block message; the
    // resolved target is what we actually evaluate against path predicates.
    const rawTarget = extractRmTarget(command);
    const resolvedTarget = resolveRmTarget(rawTarget, command);

    // Skip the Tier 1 check entirely when the resolved target is a subpath
    // of a system temp root. Tier 2 (rule 2a) below also skips for these.
    // Bare temp roots (e.g. `rm -rf /tmp`) do not match the prefixes and
    // still trip both rules.
    if (!isTempPath(resolvedTarget)) {
      // Block if target is absolute and appears to be outside the project
      const isAbsolute = resolvedTarget.startsWith('/');
      const isInProject = isAbsolute && resolvedTarget.startsWith(cwd);
      const isDotDot    = resolvedTarget.includes('../') || resolvedTarget.includes('/..');
      const isHome      = /^~\/|^\/home\/|^\/Users\//.test(resolvedTarget) && !isInProject;
      const isSystemPath = /^(\/etc|\/var|\/usr|\/bin|\/sbin|\/lib|\/opt|\/sys|\/proc|\/dev)/.test(resolvedTarget);

      if (isSystemPath || (isAbsolute && !isInProject) || isDotDot || isHome) {
        tier1Block(
          `rm -rf on a path outside the project directory (${rawTarget || 'unknown'})`,
          command
        );
      }
      // Otherwise falls through to Tier 2 check below
    }
  }

  // 1d. Deploy commands when test gates haven't passed
  if (isDeployCommand(command) && !testGatesHavePassed(cwd)) {
    tier1Block(
      'deploy attempted before test gates have passed — run `/ship` to go through the proper Ship flow',
      command
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2 — Pause & confirm (or log if downgraded via CONSTITUTION.md)
  // ═══════════════════════════════════════════════════════════════════════════

  function handleTier2(label) {
    if (isTier2Downgraded(label, tier2Overrides)) {
      tier2Logged(command);
    } else {
      tier2Block(command);
    }
  }

  // 2a. rm -rf (non-Tier-1 cases — reached here only if not blocked above).
  //     Subpaths of system temp roots (/tmp/, /var/tmp/, /var/folders/, and
  //     their /private/-prefixed macOS canonical forms) are exempt — these
  //     directories are designed to be ephemeral.
  if (/rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+/.test(command)) {
    const rawTarget = extractRmTarget(command);
    const resolvedTarget = resolveRmTarget(rawTarget, command);
    if (!isTempPath(resolvedTarget)) {
      handleTier2('rm -rf');
    }
  }

  // 2b. git reset --hard — exempt when running inside a system temp directory
  //     (typical scratch-clone test fixtures have no real work to lose).
  if (/git\s+reset\s+--hard\b/.test(command)) {
    if (!isTempPath(cwd)) {
      handleTier2('git reset --hard');
    }
  }

  // 2c. Production DB access
  if (isProductionDbCommand(command)) {
    handleTier2('running db migrations in production');
  }

  // 2d. External API write calls (curl/fetch with POST/PUT/DELETE to external URLs)
  if (isExternalWriteCall(command)) {
    handleTier2('any external api call that writes/posts/sends');
  }

  // 2e. Modifying CONSTITUTION.md or DECISIONS.md via Bash redirection
  //
  // Only fire when the path being written is under `docs/pdlc/memory/` — files
  // merely named CONSTITUTION.md or DECISIONS.md elsewhere on disk (test
  // fixtures, unrelated notes) are not the project's protected memory.
  // Also exempt when cwd is a system temp directory (test fixture scenario).
  // (Metadata commands — git commit, gh release, etc. — are already short-
  // circuited at the top of the Bash branch.)
  if (!isTempPath(cwd)) {
    const protectedFile = writesToProtectedMemoryFile(command);
    if (protectedFile) {
      handleTier2(`changing ${protectedFile.toLowerCase().replace('.md', '')}`);
    }
  }

  // ── All clear ───────────────────────────────────────────────────────────────
  allow();
}

main();
