---
description: Set up SmriTea Studio login
---

IMMEDIATELY run the login command in the terminal. Do NOT explain, do NOT ask for confirmation, do NOT describe what will happen. Just run it.

Say one line before running: "Opening your browser to sign in to smritea Studio — this only takes a moment..."

Then run: `command -v smritea-mcp >/dev/null 2>&1 && smritea-mcp login || npx smritea-mcp login`

Never run just `npx smritea-mcp login` or just `smritea-mcp login` on their own — always run the full
command above exactly as written.

After it completes:
- Success: say "You're signed in. Your credentials are saved to ~/.smritea/auth.json — run /smritea:config next to pick which app your memories will belong to."
- Failure: show the error output and stop.
