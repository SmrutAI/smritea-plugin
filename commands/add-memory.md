---
description: Save a memory to SmriTea for the current project/app
---

Save this memory to SmriTea for the current project/app:

$ARGUMENTS

Steps:
1. If `$ARGUMENTS` is empty, ask the user what memory they want to save and stop.
2. Resolve config using the same project/global settings as the other SmriTea commands.
3. Call `add_memory` with:
   - `content`: the full `$ARGUMENTS` text exactly as provided
   - the currently selected app/project context
4. On success, confirm the memory was saved and briefly summarize what was stored.
5. On failure, show the error and suggest checking `/smritea:login` and `/smritea:config` if the issue is auth or app selection.
