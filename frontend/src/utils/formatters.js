/**
 * Format ISO datetime string to a human-readable format
 * @param {string} isoString
 */
export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "5 mins ago", "2 hours ago", "Yesterday")
 * @param {string} isoString
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hrs ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;

    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

/**
 * Truncate long text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format decimal coordinates to 5 decimal places for display
 * @param {number|string} coord
 */
export function formatCoordinate(coord) {
  if (coord === null || coord === undefined || isNaN(Number(coord))) return '0.00000';
  return Number(coord).toFixed(5);
}
