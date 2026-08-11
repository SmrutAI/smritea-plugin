import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { homedir } from 'node:os';

/**
 * Read and parse a JSON file. Returns null on any error (missing, unreadable, malformed).
 * @param {string} filePath
 * @returns {object|null}
 */
function readJsonFile(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Resolve SmriTea plugin configuration.
 *
 * Never throws. Returns a merged config from:
 * 1. environment variables
 * 2. ~/.smritea/auth.json
 * 3. ~/.smritea/config.json
 * 4. project .smritea/config.json
 * 5. hardcoded URL defaults
 *
 * credentials.json is not used.
 *
 * @returns {{
 *   studioAccessToken: string|null,
 *   selectedAppId: string|null,
 *   selectedAppAPIKey: string|null,
 *   projectName: string|null,
 *   dataBaseUrl: string,
 *   studioBaseUrl: string,
 *   apiKey: string|null,
 *   appId: string|null,
 * }}
 */
export function resolveConfig() {
  const authConfig = readJsonFile(join(homedir(), '.smritea', 'auth.json'));
  const globalConfig = readJsonFile(join(homedir(), '.smritea', 'config.json'));
  const projectConfig = readJsonFile(join(process.cwd(), '.smritea', 'config.json'));

  const studioAccessToken =
    process.env.SMRITEA_STUDIO_ACCESS_TOKEN ||
    (typeof authConfig?.access_token === 'string' && authConfig.access_token.trim() !== ''
      ? authConfig.access_token
      : null);

  const selectedAppId =
    process.env.SMRITEA_APP_ID ||
    (typeof globalConfig?.selected_app_id === 'string' && globalConfig.selected_app_id.trim() !== ''
      ? globalConfig.selected_app_id
      : null);

  const selectedAppAPIKey =
    process.env.SMRITEA_API_KEY ||
    (selectedAppId && authConfig?.apps && typeof authConfig.apps === 'object'
      ? authConfig.apps[selectedAppId]?.api_key || null
      : null);

  const projectName =
    process.env.SMRITEA_PROJECT_NAME ||
    (typeof projectConfig?.project === 'string' && projectConfig.project.trim() !== ''
      ? projectConfig.project
      : basename(process.cwd()));

  const dataBaseUrl =
    process.env.SMRITEA_BASE_URL ||
    (typeof globalConfig?.base_url === 'string' && globalConfig.base_url.trim() !== ''
      ? globalConfig.base_url
      : 'https://api-us.smritea.ai');

  const studioBaseUrl =
    process.env.SMRITEA_STUDIO_BASE_URL ||
    (typeof globalConfig?.studio_base_url === 'string' && globalConfig.studio_base_url.trim() !== ''
      ? globalConfig.studio_base_url
      : 'https://api.smritea.ai');

  return {
    studioAccessToken,
    selectedAppId,
    selectedAppAPIKey,
    projectName,
    dataBaseUrl,
    studioBaseUrl,
    apiKey: selectedAppAPIKey,
    appId: selectedAppId,
  };
}
