/**
 * Format a relative timestamp from an ISO-8601 date string.
 * @param {string|undefined} isoString
 * @returns {string}
 */
function formatRelativeTime(isoString) {
  if (!isoString) return '?';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '?';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 60) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${diffWeeks}w ago`;
  if (diffDays >= 365) return `${Math.floor(diffDays / 365)}y ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Format SmriTea search results into a <smritea-context> XML block for injection into AI context.
 *
 * @param {Array<{memory?: {content?: string, createdAt?: string, actorType?: string}, score?: number}>} results
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

    const time = formatRelativeTime(result.memory?.createdAt);
    const actor = result.memory?.actorType;
    const actorTag = actor ? ` [${actor}]` : '';
    const score = result.score != null ? `${Math.round(result.score * 100)}%` : '?%';
    lines.push(`[${time}]${actorTag} ${content} [${score}]`);
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
