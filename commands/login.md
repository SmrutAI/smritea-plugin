---
description: Set up SmriTea credentials (API key and base URL)
---

Set up SmriTea credentials for this machine.

Steps:
1. Tell the user: "To get an API key, create an account at https://app.smritea.ai and go to Settings → API Keys"
2. Ask the user for their API key (must not be empty)
3. Ask for base URL with this message: "Enter base URL (press Enter for default https://api.smritea.ai, or enter a custom URL for local/self-hosted):"
   - If the user presses Enter or types nothing, use `https://api.smritea.ai`
   - Otherwise use the URL they provided
4. Write both values to `~/.smritea/credentials.json`:
   ```json
   {
     "apiKey": "<their-api-key>",
     "baseUrl": "<base-url>"
   }
   ```
   Create `~/.smritea/` directory if it doesn't exist.
5. Validate the credentials by calling the SmriTea health endpoint:
   - Make a GET request to `{baseUrl}/health` with header `Authorization: Bearer {apiKey}`
   - Or use the `search_memories` MCP tool with a simple test query — if it returns without auth error, credentials are valid
6. On success: "Credentials saved to ~/.smritea/credentials.json. Run /smritea:config to select an app for this project."
7. On failure: Show the error, ask if they want to retry with different credentials
