---
description: Configure SmriTea plugin settings for this project
---

Show and update SmriTea plugin configuration for this project.

Read these files when they exist:
- `~/.smritea/auth.json`
- `~/.smritea/config.json`
- `.smritea/config.json`

Show the current state in a clear table with these rows:
- `login_status`
- `selected_app_id`
- `selected_app_name`
- `selected_app_api_key`
- `project_name`

Use these sources:
- `login_status` from `~/.smritea/auth.json` token presence
- `selected_app_id` from `~/.smritea/config.json`
- `selected_app_name` from `~/.smritea/auth.json.apps[selected_app_id].app_name`
- `selected_app_api_key` from `~/.smritea/auth.json.apps[selected_app_id].api_key`
- `project_name` from `.smritea/config.json`

Mask API keys in the table. Show only the first 8 characters, then `...`.
Show `not set` when a value does not exist.

Rules:
1. Keep auth state only in `~/.smritea/auth.json`
2. Keep selected app and user-level config only in `~/.smritea/config.json`
3. Keep project metadata only in `.smritea/config.json`
4. Do not treat auth state as project metadata
5. Do not emphasize base URLs or old API-key-first setup

If no selected app exists:
1. Use the MCP app-selection flow to list apps
2. Ask the user to choose one
3. Write the selected app ID to `~/.smritea/config.json`

If the selected app has no API key:
1. Create a new API key for that app through the Studio JWT-backed MCP flow
2. Persist it in `~/.smritea/auth.json`
3. Keep project metadata separate in `.smritea/config.json`

Let the user update project metadata separately from auth state.
