#!/usr/bin/env node

/**
 * Instagram Account Video URL Scraper
 * Extracts all video/reel URLs from an Instagram account using yt-dlp
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync } from 'fs';
import { logger } from '../src/utils/logger.js';

const execAsync = promisify(exec);

/**
 * Extract all video URLs from an Instagram account
 * @param {string} username - Instagram username
 * @param {object} options - Scraping options
 * @returns {Promise<string[]>} Array of video URLs
 */
async function scrapeAccountVideos(username, options = {}) {
  const outputFile = options.outputFile || 'urls.txt';
  const browser = options.browser || null; // chrome, firefox, safari, etc.
  const maxVideos = options.maxVideos || null;

  logger.info('='.repeat(60));
  logger.info('Instagram Account Video Scraper');
  logger.info('='.repeat(60));
  logger.info(`Username: ${username}`);
  logger.info(`Output file: ${outputFile}`);

  try {
    // Check if yt-dlp is installed
    try {
      await execAsync('which yt-dlp');
    } catch {
      throw new Error('yt-dlp is not installed. Install with: brew install yt-dlp');
    }

    // Build yt-dlp command
    const profileUrl = `https://www.instagram.com/${username}/`;
    let command = `yt-dlp --flat-playlist --print url "${profileUrl}"`;

    // Add browser cookies if specified
    if (browser) {
      command += ` --cookies-from-browser ${browser}`;
      logger.info(`Using cookies from: ${browser}`);
    }

    // Add max videos limit if specified
    if (maxVideos) {
      command += ` --playlist-end ${maxVideos}`;
      logger.info(`Limiting to first ${maxVideos} videos`);
    }

    logger.info('\nExtracting video URLs from profile...');
    logger.info('This may take a moment depending on account size...\n');

    // Execute command
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large accounts
      timeout: 120000, // 2 minute timeout
    });

    if (stderr && !stderr.includes('WARNING')) {
      logger.warn(`yt-dlp warnings: ${stderr}`);
    }

    // Parse URLs from output
    const urls = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('https://www.instagram.com/'));

    if (urls.length === 0) {
      throw new Error('No video URLs found. The account may be private, empty, or require authentication.');
    }

    logger.info(`✓ Found ${urls.length} video URLs`);

    // Write to file
    let fileContent = `# Instagram videos from @${username}\n`;
    fileContent += `# Generated: ${new Date().toLocaleString()}\n`;
    fileContent += `# Total videos: ${urls.length}\n\n`;
    fileContent += urls.join('\n') + '\n';

    writeFileSync(outputFile, fileContent);
    logger.info(`✓ URLs saved to: ${outputFile}`);

    // Show sample URLs
    logger.info('\nSample URLs (first 5):');
    urls.slice(0, 5).forEach((url, i) => {
      logger.info(`  ${i + 1}. ${url}`);
    });

    if (urls.length > 5) {
      logger.info(`  ... and ${urls.length - 5} more`);
    }

    logger.info('\n' + '='.repeat(60));
    logger.info('Next steps:');
    logger.info('  1. Review urls.txt to verify the URLs');
    logger.info('  2. Run batch processing:');
    logger.info(`     node examples/batch-process.js ${outputFile} --ai --summarize --notion`);
    logger.info('='.repeat(60));

    return urls;

  } catch (error) {
    logger.error(`\nError: ${error.message}`);

    if (error.message.includes('Unable to extract') || error.message.includes('broken')) {
      logger.info('\n⚠️  yt-dlp Instagram user extractor is currently BROKEN');
      logger.info('\nAlternative methods to get video URLs:');
      logger.info('\n📌 EASIEST - Browser Console Method:');
      logger.info('  1. Open https://www.instagram.com/' + username + '/ in browser');
      logger.info('  2. Scroll to load all videos');
      logger.info('  3. Open DevTools (F12 or Cmd+Option+I)');
      logger.info('  4. Paste this in Console tab:');
      logger.info('');
      logger.info('     copy([...document.querySelectorAll(\'a[href*="/p/"], a[href*="/reel/"]\')]');
      logger.info('       .map(a => a.href)');
      logger.info('       .filter((url, i, arr) => arr.indexOf(url) === i)');
      logger.info('       .join(\'\\n\'))');
      logger.info('');
      logger.info('  5. Paste clipboard content into urls.txt');
      logger.info('\n📌 Alternative Tools:');
      logger.info('  • Instaloader: pip3 install instaloader');
      logger.info('  • Gallery-dl: pip3 install gallery-dl');
      logger.info('\nSee scripts/manual-urls.md for detailed instructions');
    }

    throw error;
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Instagram Account Video Scraper

Extract all video/reel URLs from an Instagram account for batch processing.

Usage:
  node scripts/scrape-account.js <username> [options]

Arguments:
  <username>               Instagram username (without @)

Options:
  -o, --output <file>      Output file (default: urls.txt)
  -b, --browser <browser>  Use cookies from browser for authentication
                           (chrome, firefox, safari, edge)
  -m, --max <number>       Maximum number of videos to extract
  --help, -h               Show this help message

Examples:
  # Extract all videos from public account
  node scripts/scrape-account.js username

  # Use Chrome cookies for private/authenticated access
  node scripts/scrape-account.js username --browser chrome

  # Limit to first 50 videos
  node scripts/scrape-account.js username --max 50

  # Custom output file
  node scripts/scrape-account.js username --output my-urls.txt

After scraping:
  node examples/batch-process.js urls.txt --notion --ai --summarize --topics
  `);
  process.exit(0);
}

const username = args[0];
const options = {
  outputFile: args.includes('-o') || args.includes('--output')
    ? args[args.indexOf('-o') !== -1 ? args.indexOf('-o') + 1 : args.indexOf('--output') + 1]
    : 'urls.txt',
  browser: args.includes('-b') || args.includes('--browser')
    ? args[args.indexOf('-b') !== -1 ? args.indexOf('-b') + 1 : args.indexOf('--browser') + 1]
    : null,
  maxVideos: args.includes('-m') || args.includes('--max')
    ? parseInt(args[args.indexOf('-m') !== -1 ? args.indexOf('-m') + 1 : args.indexOf('--max') + 1])
    : null,
};

scrapeAccountVideos(username, options).catch(error => {
  process.exit(1);
});
