import { resolveConfig } from './lib/settings.js';
import { SmriteaClient } from 'smritea-sdk';
import { formatContext } from './lib/format-context.js';

async function main() {
  const { apiKey, baseUrl, appId } = resolveConfig();

  if (!apiKey) {
    console.log('[smritea] Not configured. Run /smritea:login to set up.');
    process.exit(0);
  }

  if (!appId) {
    console.log('[smritea] No app selected. Run /smritea:config to set an app.');
    process.exit(0);
  }

  const client = new SmriteaClient({ apiKey, appId, baseUrl });
  const results = await client.search('session context relevant memories', { limit: 10 });
  const context = formatContext(results);

  if (context) {
    console.log(context);
  }
}

main().catch((err) => {
  process.stderr.write(`[smritea] Warning: failed to load session context: ${err.message}\n`);
  process.exit(0);
});
