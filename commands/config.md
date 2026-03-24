---
description: Configure SmriTea plugin settings for this project
---

Show and update SmriTea plugin configuration for this project.

Steps:
1. Read `.smritea/config.json` if it exists (project-level config)
2. Read `~/.smritea/credentials.json` if it exists (global credentials)
3. Show current settings in a clear table:
   - `app_id`: from project config (or "not set")
   - `base_url`: from project config, or global, or default `https://api.smritea.ai`
   - `api_key`: from project config or global — show only first 8 chars + "..." (masked)

Note: Settings are resolved with this priority (highest first):
- Environment variables (`SMRITEA_API_KEY`, `SMRITEA_BASE_URL`, `SMRITEA_APP_ID`)
- Project config (`.smritea/config.json`)
- Global credentials (`~/.smritea/credentials.json`)
- Built-in defaults (`https://api.smritea.ai`)

4. If the user wants to change the app, use the `select_app` MCP tool to list and select an app
5. For other settings (base_url, api_key), write them directly to the appropriate config file:
   - Project-specific overrides → `.smritea/config.json`
   - Global credentials → `~/.smritea/credentials.json`

Config file format for `.smritea/config.json`:
```json
{
  "appId": "app_...",
  "baseUrl": "https://api.smritea.ai"
}
```

Config file format for `~/.smritea/credentials.json`:
```json
{
  "apiKey": "smr_...",
  "baseUrl": "https://api.smritea.ai"
}
```
