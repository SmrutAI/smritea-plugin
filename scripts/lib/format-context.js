/**
 * Format SmriTea search results into a <smritea-context> XML block for injection into AI context.
 *
 * @param {Array<{memory?: {content?: string, actorType?: string}, score?: number}>} results
 * @param {{ maxItems?: number }} [options]
 * @returns {string}
 */
export function formatContext(results, options = {}) {
  const maxItems = options.maxItems ?? 10;

  if (!results || results.length === 0) {
    return '';
  }

  const sorted = [...results].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const lines = [];
  let count = 0;

  for (const result of sorted) {
    if (count >= maxItems) break;
    const content = result?.memory?.content;
    if (!content) continue;

    const actor = result.memory?.actorType;
    const actorTag = actor ? ` [${actor}]` : '';
    const score = result.score != null ? `${Math.round(result.score * 100)}%` : '?%';
    lines.push(`${actorTag} ${content} [${score}]`);
    count++;
  }

  if (lines.length === 0) {
    return '';
  }

  return [
    '<smritea-context>',
    '--- Relevant Memories ---',
    ...lines,
    '',
    "Use these memories naturally — don't force them into the conversation.",
    '</smritea-context>',
  ].join('\n');
}
