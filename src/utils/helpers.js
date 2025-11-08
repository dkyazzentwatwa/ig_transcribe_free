import { config } from '../config.js';
import { createHash } from 'crypto';

/**
 * Generate a random delay between min and max values
 * @param {number} min - Minimum delay in ms (optional)
 * @param {number} max - Maximum delay in ms (optional)
 * @returns {Promise<void>}
 */
export async function randomDelay(min = null, max = null) {
  const minDelay = min || config.delays.minDelay;
  const maxDelay = max || config.delays.maxDelay;
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Extract Instagram video ID from URL
 * @param {string} url - Instagram URL
 * @returns {string|null} Video ID or null
 */
export function extractVideoId(url) {
  const patterns = [
    // Direct URLs: instagram.com/p/ABC123/
    /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/,
    // Profile URLs: instagram.com/username/reel/ABC123/
    /instagram\.com\/[A-Za-z0-9._]+\/(?:p|reel|tv|reels)\/([A-Za-z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Validate Instagram URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export function isValidInstagramUrl(url) {
  const patterns = [
    // Direct URLs: instagram.com/p/ABC123/ or instagram.com/reel/ABC123/
    /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|reels)\/[A-Za-z0-9_-]+/,
    // Profile URLs: instagram.com/username/reel/ABC123/
    /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/(p|reel|tv|reels)\/[A-Za-z0-9_-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

/**
 * Generate a filename-safe hash from URL
 * @param {string} url - URL to hash
 * @returns {string} Hash string
 */
export function hashUrl(url) {
  return createHash('md5').update(url).digest('hex').substring(0, 12);
}

/**
 * Sanitize filename
 * @param {string} filename - Filename to sanitize
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

/**
 * Format timestamp for CSV (seconds to HH:MM:SS.mmm)
 * @param {number} seconds - Time in seconds
 * @returns {string}
 */
export function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export default {
  randomDelay,
  extractVideoId,
  isValidInstagramUrl,
  hashUrl,
  sanitizeFilename,
  formatTimestamp,
};
