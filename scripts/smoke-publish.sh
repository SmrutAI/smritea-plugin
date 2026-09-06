#!/usr/bin/env bash
# smoke-publish.sh — smoke-test the plugin exactly as a marketplace user receives it.
#
# The plugin ships via `claude plugin marketplace add SmrutAI/smritea-plugin` (a git clone):
# no npm install ever runs on the user's machine, so hooks/scripts must work from the
# committed files alone. Two failure classes this catches:
#   1. Stale bundle — scripts/dist/context-hook.js was committed from older sources
#      (it inlines smritea-mcp dist code at build time).
#   2. Non-self-contained bundle — a hook gained a require/import that esbuild did not
#      inline; it resolves in this repo (node_modules present) but not on user machines.
#
# Steps: rebuild the bundle and require zero git diff (freshness); stage ONLY the
# marketplace-shipped files into a scratch dir; execute the SessionStart hook there with
# a clean HOME and no node_modules; assert no module-resolution error.
#
# Self-contained on purpose: this script must keep working in the standalone
# SmrutAI/smritea-plugin clone, so it references nothing outside the plugin directory.
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; BOLD='\033[1m'; RESET='\033[0m'
ok()   { printf "${GREEN}  ✓${RESET} %s\n" "$*"; }
err()  { printf "${RED}  ✗ ERROR:${RESET} %s\n" "$*" >&2; }
step() { printf "\n${BOLD}%s${RESET}\n" "$*"; }
fail() { err "$*"; exit 1; }

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

step "Rebuilding hook bundle (freshness check)"
make -C "$PLUGIN_DIR" build >/dev/null
if ! git -C "$PLUGIN_DIR" diff --quiet -- scripts/dist; then
    git -C "$PLUGIN_DIR" --no-pager diff --stat -- scripts/dist
    fail "committed scripts/dist bundle is STALE — rebuild changed it; commit the regenerated bundle"
fi
ok "committed bundle matches a fresh build"

step "Staging marketplace-shipped files (no node_modules, no repo layout)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/smritea-plugin-smoke.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT
STAGE="$WORK/plugin"
CLEAN_HOME="$WORK/home"
mkdir -p "$STAGE" "$CLEAN_HOME"
for item in .claude-plugin .mcp.json hooks scripts/dist commands skills cursor LICENSE README.md; do
    if [ -e "$PLUGIN_DIR/$item" ]; then
        mkdir -p "$STAGE/$(dirname "$item")"
        cp -R "$PLUGIN_DIR/$item" "$STAGE/$item"
    fi
done
ok "staged $(find "$STAGE" -type f | wc -l | tr -d ' ') files"

step "Validating the shipped .mcp.json MCP-server declaration"
# The MCP artifact itself is exercised by smritea-mcp's own `make smoke` (pack +
# clean install + bin execution); here we statically validate that the shipped
# .mcp.json actually points Claude Code at that artifact via npx.
if [ ! -f "$STAGE/.mcp.json" ]; then
    fail ".mcp.json missing from the staged plugin — marketplace installs would have no MCP server"
fi
STAGE="$STAGE" node -e "
const cfg = JSON.parse(require('fs').readFileSync(process.env.STAGE + '/.mcp.json', 'utf8'));
const server = cfg.mcpServers && cfg.mcpServers.smritea;
if (!server) throw new Error('.mcp.json has no mcpServers.smritea entry');
if (server.command !== 'npx') throw new Error('.mcp.json command must be npx, got: ' + server.command);
if (!Array.isArray(server.args) || !server.args.includes('smritea-mcp') || !server.args.includes('serve')) {
    throw new Error('.mcp.json args must invoke \"smritea-mcp serve\", got: ' + JSON.stringify(server.args));
}
" || fail ".mcp.json validation failed"
ok ".mcp.json declares 'npx smritea-mcp serve' (artifact itself is covered by smritea-mcp's make smoke)"

step "Executing the SessionStart hook from the staged copy"
# Same invocation as hooks/hooks.json; clean HOME so no real ~/.smritea state is read
# or written; perl alarm enforces a hard 20s cap (hooks.json allows 15s).
set +e
OUTPUT="$(printf '{"hook_event_name":"SessionStart"}' | \
    HOME="$CLEAN_HOME" CLAUDE_PLUGIN_ROOT="$STAGE" \
    perl -e 'alarm 20; exec @ARGV' node "$STAGE/scripts/dist/context-hook.js" 2>&1)"
CODE=$?
set -e
printf '%s\n' "$OUTPUT"
echo "exit=$CODE"

if printf '%s' "$OUTPUT" | grep -qiE "cannot find module|ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND"; then
    fail "module resolution error — the shipped bundle is not self-contained"
fi
if [ "$CODE" -ne 0 ]; then
    fail "SessionStart hook exited $CODE — a marketplace install would break on session start"
fi
ok "smoke-plugin-publish PASSED: shipped files are fresh, self-contained, and the hook runs cleanly"
