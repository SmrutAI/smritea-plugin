---
description: Set up SmriTea Studio login
---

IMMEDIATELY run the login command in the terminal. Do NOT explain, do NOT ask for confirmation, do NOT describe what will happen. Just run it.

Say one line before running: "Opening browser for Studio login..."

Then run: `command -v smritea-mcp >/dev/null 2>&1 && smritea-mcp login || npx smritea-mcp login`

Never run just `npx smritea-mcp login` or just `smritea-mcp login` on their own — always run the full
command above exactly as written.

After it completes:
- Success: say "Studio login succeeded. Tokens saved to ~/.smritea/auth.json. Run /smritea:config to select an app."
- Failure: show the error output and stop.
