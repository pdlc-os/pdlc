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
    `  \`/pdlc override "${safeCmd}"\`\n\n` +
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

// ── CONSTITUTION.md write-target detection ──────────────────────────────────
// Only matches when CONSTITUTION.md is the actual operand of a write operation —
// not when it merely appears inside a string argument. Patterns covered:
//   sed/awk/tee/mv/cp …… CONSTITUTION.md
//   echo/printf …… > CONSTITUTION.md
//   > CONSTITUTION.md  or  >> CONSTITUTION.md  (any redirection target)
const CONSTITUTION_WRITE_PATTERNS = [
  /\b(sed|awk|tee|mv|cp|rm|install|cat)\s+[^|;&]*\bCONSTITUTION\.md\b/,
  />>?\s*[^|;&]*CONSTITUTION\.md\b/,
];

function writesToConstitutionFile(cmd) {
  return CONSTITUTION_WRITE_PATTERNS.some(re => re.test(cmd));
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
      // Check if this specific file has been downgraded to tier 3
      const label = `changing ${match.file.toLowerCase().replace('.md', '')}`;
      if (isTier2Downgraded(label, tier2Overrides)) {
        warn(`⚠️ Tier 3 logged: ${toolName} on protected file ${match.file}`);
      } else {
        block(
          `⚠️  PDLC Tier 2 Confirmation Required\n\n` +
          `About to ${toolName.toLowerCase()} protected file: ${match.file}\n\n` +
          `This file is part of PDLC's memory bank and is normally managed by PDLC commands.\n` +
          `Direct edits may cause state drift that \`/pdlc doctor\` will flag.\n\n` +
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
    // Extract the target path
    const rmMatch = command.match(/rm\s+(?:-[a-zA-Z]+\s+)+(.+)$/);
    const target  = rmMatch ? rmMatch[1].trim() : '';

    // Block if target is absolute and appears to be outside the project
    const isAbsolute = target.startsWith('/');
    const isInProject = isAbsolute && target.startsWith(cwd);
    const isDotDot    = target.includes('../') || target.includes('/..');
    const isHome      = /^~\/|^\/home\/|^\/Users\//.test(target) && !isInProject;
    const isSystemPath = /^(\/etc|\/var|\/usr|\/bin|\/sbin|\/lib|\/opt|\/sys|\/proc|\/dev)/.test(target);

    if (isSystemPath || (isAbsolute && !isInProject) || isDotDot || isHome) {
      tier1Block(
        `rm -rf on a path outside the project directory (${target || 'unknown'})`,
        command
      );
    }
    // Otherwise falls through to Tier 2 check below
  }

  // 1d. Deploy commands when test gates haven't passed
  if (isDeployCommand(command) && !testGatesHavePassed(cwd)) {
    tier1Block(
      'deploy attempted before test gates have passed — run `/pdlc ship` to go through the proper Ship flow',
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

  // 2a. rm -rf (non-Tier-1 cases — reached here only if not blocked above)
  if (/rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+/.test(command)) {
    handleTier2('rm -rf');
  }

  // 2b. git reset --hard
  if (/git\s+reset\s+--hard\b/.test(command)) {
    handleTier2('git reset --hard');
  }

  // 2c. Production DB access
  if (isProductionDbCommand(command)) {
    handleTier2('running db migrations in production');
  }

  // 2d. External API write calls (curl/fetch with POST/PUT/DELETE to external URLs)
  if (isExternalWriteCall(command)) {
    handleTier2('any external api call that writes/posts/sends');
  }

  // 2e. Modifying CONSTITUTION.md
  //
  // Only fire when the file is the actual target of a write/edit operation.
  // Commands like `git commit -m "…CONSTITUTION.md §9…"` or `gh release create --notes`
  // legitimately mention the file name in their argument text and must NOT trigger a
  // Tier 2 block — those are metadata operations, not file modifications.
  if (isMetadataCommand(command)) {
    // git/gh commit/release/pr/issue bodies frequently reference PDLC memory files.
    // Skip rule 2e for these — they don't touch the file system.
  } else if (writesToConstitutionFile(command)) {
    handleTier2('changing constitution.md');
  }

  // ── All clear ───────────────────────────────────────────────────────────────
  allow();
}

main();
