import { loadConfig } from 'smritea-mcp/config';

/**
 * Resolve SmriTea plugin configuration.
 *
 * Delegates to smritea-mcp's loadConfig() so the plugin and MCP server always
 * read the same files (settings.json + auth.json) with the same resolution logic.
 * esbuild inlines this at bundle time — no runtime dependency on the MCP package.
 *
 * Never throws. Returns nulls for unconfigured values.
 *
 * @returns {{
 *   selectedAppId: string|undefined,
 *   selectedAppAPIKey: string|undefined,
 *   projectName: string|undefined,
 *   memoryBaseUrl: string,
 *   studioBaseUrl: string,
 * }}
 */
export function resolveConfig() {
  try {
    return loadConfig();
  } catch {
    return {
      selectedAppId: undefined,
      selectedAppAPIKey: undefined,
      projectName: undefined,
      memoryBaseUrl: 'https://api-us.smritea.ai',
      studioBaseUrl: 'https://api.smritea.ai',
    };
  }
}
