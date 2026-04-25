#!/usr/bin/env bash
# PDLC local-clone installer.
#
# Used when both npmjs (`npm install -g @pdlc-os/pdlc`) and
# `npm install -g github:pdlc-os/pdlc` are blocked — typically locked-down
# corporate networks that allow GitHub HTTPS but block npm registry traffic.
#
# Canonical invocation (from the project README):
#   git clone https://github.com/pdlc-os/pdlc.git ~/.pdlc && bash ~/.pdlc/install.sh
#
# After install, the user upgrades with `pdlc upgrade` — no need to re-run
# this script.
#
# This script is intentionally thin: it validates the environment, creates
# the two ~/.local/bin symlinks (pdlc, superclaude), and hands off to
# `node bin/pdlc.js install` which runs the full Claude Code setup
# (settings, hooks, slash commands, Beads/Dolt/Python prompts).

set -euo pipefail

# ─── Resolve install dir from this script's location ─────────────────────────
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$INSTALL_DIR"

# ─── Verify we're inside a PDLC repo ─────────────────────────────────────────
if [ ! -f "$INSTALL_DIR/package.json" ]; then
  echo "✗ No package.json at $INSTALL_DIR — is this a PDLC clone?"
  echo "  Expected layout: clone the repo, then run \`bash <clone>/install.sh\`."
  exit 1
fi

PKG_NAME="$(node -p "require('$INSTALL_DIR/package.json').name" 2>/dev/null || echo '')"
if [ "$PKG_NAME" != "@pdlc-os/pdlc" ]; then
  echo "✗ $INSTALL_DIR is not a PDLC clone (package.json name is '$PKG_NAME')."
  echo "  Run this script only from inside a clone of https://github.com/pdlc-os/pdlc"
  exit 1
fi

# ─── Verify Node ≥ 18 ────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node is required but was not found on PATH."
  echo "  Install Node 18+ and re-run \`bash install.sh\`."
  exit 1
fi

NODE_MAJOR="$(node -p 'parseInt(process.versions.node.split(".")[0], 10)')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✗ Node ≥ 18 required, found v$(node -p 'process.versions.node')."
  echo "  Upgrade Node and re-run \`bash install.sh\`."
  exit 1
fi

# ─── Verify git ──────────────────────────────────────────────────────────────
if ! command -v git >/dev/null 2>&1; then
  echo "✗ git is required for install/upgrade but was not found on PATH."
  exit 1
fi

# ─── Resolve target bin dir (override via PDLC_BIN_DIR) ──────────────────────
BIN_DIR="${PDLC_BIN_DIR:-$HOME/.local/bin}"
mkdir -p "$BIN_DIR"

# ─── Detect existing global npm install of PDLC ──────────────────────────────
EXISTING_NPM_PDLC="$(command -v pdlc 2>/dev/null || true)"
if [ -n "$EXISTING_NPM_PDLC" ]; then
  EXISTING_REAL="$(readlink -f "$EXISTING_NPM_PDLC" 2>/dev/null || echo "$EXISTING_NPM_PDLC")"
  TARGET_REAL="$INSTALL_DIR/bin/pdlc.js"
  if [ "$EXISTING_REAL" != "$TARGET_REAL" ] && [[ "$EXISTING_NPM_PDLC" != "$BIN_DIR/"* ]]; then
    echo "ℹ  Existing pdlc found at $EXISTING_NPM_PDLC"
    echo "   This installer will create $BIN_DIR/pdlc → $INSTALL_DIR/bin/pdlc.js"
    echo "   Whichever appears first on PATH will win. To remove the existing one:"
    echo "     npm uninstall -g @pdlc-os/pdlc"
    echo ""
  fi
fi

# ─── Make source binaries executable ─────────────────────────────────────────
chmod +x "$INSTALL_DIR/bin/pdlc.js" "$INSTALL_DIR/bin/superclaude.sh"

# ─── Create symlinks (idempotent — ln -sf replaces stale links) ──────────────
PDLC_LINK="$BIN_DIR/pdlc"
SUPERCLAUDE_LINK="$BIN_DIR/superclaude"

# Refuse to overwrite a non-symlink (someone's hand-installed binary)
for link in "$PDLC_LINK" "$SUPERCLAUDE_LINK"; do
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    echo "✗ $link exists and is not a symlink. Refusing to overwrite."
    echo "  Remove it manually if you want this install to take over."
    exit 1
  fi
done

ln -sf "$INSTALL_DIR/bin/pdlc.js" "$PDLC_LINK"
ln -sf "$INSTALL_DIR/bin/superclaude.sh" "$SUPERCLAUDE_LINK"

echo "✓ Symlinks created:"
echo "    $PDLC_LINK → $INSTALL_DIR/bin/pdlc.js"
echo "    $SUPERCLAUDE_LINK → $INSTALL_DIR/bin/superclaude.sh"
echo ""

# ─── Hand off to the existing install command ────────────────────────────────
# `pdlc install` runs the full Claude Code setup: settings merge, hooks,
# slash commands, superclaude symlink (idempotent — overlaps fine with the
# one we just created), PATH-on-rc-file offer, Beads/Dolt/Python prompts.
#
# We invoke it via `node $INSTALL_DIR/bin/pdlc.js` (absolute path) so this
# script doesn't depend on the just-created symlink being on PATH yet.

exec node "$INSTALL_DIR/bin/pdlc.js" install
