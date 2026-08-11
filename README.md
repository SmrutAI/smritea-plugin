---
type: Overview
title: SmriTea Plugin for Claude Code and Cursor
status: stable
tags:
- readme
---

# SmriTea Plugin for Claude Code and Cursor

Persistent AI memory across sessions — store, search, and recall context automatically.

## What It Does

- **SessionStart hook**: Automatically fetches relevant memories at the start of each session and injects them as
  context
- **MCP tools**: Exposes `add_memory`, `search_memories`, `get_memory`, `delete_memory`, `select_app`, `list_apps` via
  the SmriTea MCP server
- **Commands**: `/smritea:login`, `/smritea:config`, `/smritea:add-memory <text>`, `/smritea:recall <topic>`
- **Skills**: Guides the AI on when and how to use memory tools

## Installation

### 1. Clone the plugin repo

```bash
git clone git@github.com:SmrutAI/smritea-plugin.git
cd smritea-plugin
```

### 2. Load the plugin into Claude Code

```bash
claude --plugin-dir .
```

This loads the plugin for the current session. It is not published to any marketplace yet.

### 3. Log in

Run in your AI coding assistant:

```
/smritea:login
```

This opens the browser, authenticates against your Studio account through `smritea-mcp login`, and saves Studio tokens to `~/.smritea/auth.json`.

### 4. Select an app

```
/smritea:config
```

This shows your current settings and lets you select an app for this project.

### 5. Save a memory

```
/smritea:add-memory user prefers interfaces layered design with clean architecture recommendations, where each layer has dependency injection with interfaces that can be swapped with different implementations/mocks as needed
```

This stores a memory in SmriTea for the currently configured app/project.

### 6. Verify

```
/smritea:recall test
```

If configured correctly, this will search your memories and show results (or "no memories found").

## Commands

| Command                         | Description |
|---------------------------------|-------------|
| `/smritea:login`                | Run browser-based Studio login and save tokens to `~/.smritea/auth.json` |
| `/smritea:config`               | View and update selected app and project metadata |
| `/smritea:add-memory <text>`    | Save a memory to SmriTea for the current project/app |
| `/smritea:recall <topic>`       | Search memories for context relevant to a topic |

## Configuration

The plugin now splits auth, user-level selection, and project metadata.

| File | Purpose |
|------|---------|
| `~/.smritea/auth.json` | Studio access/refresh tokens and per-app API keys |
| `~/.smritea/config.json` | Selected app ID and user-level config |
| `.smritea/config.json` | Project metadata only |

The runtime hook resolves the selected app ID first, then loads the selected app API key from `~/.smritea/auth.json`. It no longer depends on `credentials.json` or the old API-key-first setup.

Environment overrides still apply for `SMRITEA_API_KEY`, `SMRITEA_APP_ID`, `SMRITEA_BASE_URL`, and `SMRITEA_STUDIO_BASE_URL`.

## How the SessionStart Hook Works

On every new session, the hook:

1. Resolves Studio auth, selected app, and project metadata
2. Stops early if no selected app or selected app API key exists
3. Builds the dataplane `SmriteaClient` from the selected app API key and app ID
4. Searches for relevant memories and formats them into `<smritea-context>`

## Cursor Support

Cursor config lives in `cursor/`. Copy or symlink the relevant files to your Cursor config directory.

## License

Apache-2.0 — Copyright 2026 Bytonomics LLP
