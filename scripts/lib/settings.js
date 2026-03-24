import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
 * Resolve SmriTea plugin configuration using 3-tier priority:
 *   1. Environment variables
 *   2. .smritea/config.json (project-level, relative to cwd)
 *   3. ~/.smritea/credentials.json (global)
 *   4. Hardcoded defaults
 *
 * Never throws. Always returns { apiKey, baseUrl, appId } with nulls for unconfigured values.
 *
 * @returns {{ apiKey: string|null, baseUrl: string, appId: string|null }}
 */
export function resolveConfig() {
  const projectConfig = readJsonFile(join(process.cwd(), '.smritea', 'config.json'));
  const globalConfig = readJsonFile(join(homedir(), '.smritea', 'credentials.json'));

  const apiKey =
    process.env.SMRITEA_API_KEY ||
    projectConfig?.apiKey ||
    globalConfig?.apiKey ||
    null;

  const baseUrl =
    process.env.SMRITEA_BASE_URL ||
    projectConfig?.baseUrl ||
    globalConfig?.baseUrl ||
    'https://api.smritea.ai';

  const appId =
    process.env.SMRITEA_APP_ID ||
    projectConfig?.appId ||
    null;

  return { apiKey, baseUrl, appId };
}
