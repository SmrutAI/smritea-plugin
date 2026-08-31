---
description: Configure SmriTea plugin settings for this project
---

IMMEDIATELY run the configure wizard in the terminal. Do NOT explain, do NOT ask for confirmation. Just run it.

Say one line before running: "Let's get smritea set up for this project — a few quick questions..."

Then run: `command -v smritea-mcp >/dev/null 2>&1 && smritea-mcp configure || npx smritea-mcp configure`

Never run just `npx smritea-mcp configure` or just `smritea-mcp configure` on their own — always run the full
command above exactly as written.

The wizard handles login, app selection, project name, and tags interactively.

After it completes:
- Success: say "All set — smritea will remember this project's context from here on."
- Failure: show the error output and stop.
