# SmriTea Plugin for Claude Code and Cursor

Persistent AI memory across sessions — store, search, and recall context automatically.

## What It Does

- **SessionStart hook**: Automatically fetches relevant memories at the start of each session and injects them as
  context
- **MCP tools**: Exposes `add_memory`, `search_memories`, `get_memory`, `delete_memory`, `select_app`, `list_apps` via
  the SmriTea MCP server
- **Commands**: `/smritea:login`, `/smritea:config`, `/smritea:recall <topic>`
- **Skills**: Guides the AI on when and how to use memory tools

## Installation

### 1. Load the plugin (local testing)

```bash
# From the smritea-cloud repo root
claude --plugin-dir ./typescript/smritea-plugin
```

This loads the plugin for the current session. It is not published to any marketplace yet.

### 2. Log in

Run in your AI coding assistant:

```
/smritea:login
```

Follow the prompts to enter your API key (get one at https://app.smritea.ai → Settings → API Keys).

### 3. Select an app

```
/smritea:config
```

This shows your current settings and lets you select an app for this project.

### 4. Verify

```
/smritea:recall test
```

If configured correctly, this will search your memories and show results (or "no memories found").

## Commands

| Command                   | Description                                                           |
|---------------------------|-----------------------------------------------------------------------|
| `/smritea:login`          | Set up API key and base URL (stored in `~/.smritea/credentials.json`) |
| `/smritea:config`         | View and update project settings (stored in `.smritea/config.json`)   |
| `/smritea:recall <topic>` | Search memories for context relevant to a topic                       |

## Configuration

The plugin uses a 3-tier config resolution (highest priority first):

| Setting  | Env Var            | Project File           | Global File                   | Default                  |
|----------|--------------------|------------------------|-------------------------------|--------------------------|
| API Key  | `SMRITEA_API_KEY`  | `.smritea/config.json` | `~/.smritea/credentials.json` | —                        |
| Base URL | `SMRITEA_BASE_URL` | `.smritea/config.json` | `~/.smritea/credentials.json` | `https://api.smritea.ai` |
| App ID   | `SMRITEA_APP_ID`   | `.smritea/config.json` | —                             | —                        |

### `~/.smritea/credentials.json` (global)

```json
{
  "apiKey": "smr_...",
  "baseUrl": "https://api.smritea.ai"
}
```

### `.smritea/config.json` (project)

```json
{
  "appId": "app_...",
  "baseUrl": "https://api.smritea.ai"
}
```

## How the SessionStart Hook Works

On every new session, the hook:

1. Resolves config (env → project → global)
2. If not configured, prints a setup reminder and exits
3. Searches for relevant memories using the SmriTea SDK
4. Formats results into `<smritea-context>` XML injected as system context

## Cursor Support

Cursor config lives in `cursor/`. Copy or symlink the relevant files to your Cursor config directory.

## License

Apache-2.0 — Copyright 2026 Bytonomics LLP
