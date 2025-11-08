#!/usr/bin/env node

/**
 * Batch processing example
 * Process multiple Instagram URLs from a file
 */

import { readFileSync, existsSync } from 'fs';
import { processInstagramVideo } from '../index.js';
import { logger } from '../src/utils/logger.js';

async function batchProcess(urlsFile, options = {}) {
  if (!existsSync(urlsFile)) {
    console.error(`Error: File not found: ${urlsFile}`);
    process.exit(1);
  }

  // Read URLs from file (one per line)
  const content = readFileSync(urlsFile, 'utf8');
  const urls = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')); // Skip empty lines and comments

  if (urls.length === 0) {
    console.error('Error: No URLs found in file');
    process.exit(1);
  }

  logger.info(`Processing ${urls.length} Instagram URLs...\n`);

  const results = {
    total: urls.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    logger.info(`\n[${ i + 1}/${urls.length}] Processing: ${url}`);

    try {
      const result = await processInstagramVideo(url, options);

      if (result.success) {
        results.successful++;
        logger.info(`✓ Success`);
      } else {
        results.failed++;
        results.errors.push({ url, error: result.error });
        logger.error(`✗ Failed: ${result.error}`);
      }

      // Add delay between videos to avoid rate limiting
      if (i < urls.length - 1) {
        const delay = options.delay || (5000 + Math.random() * 5000); // Default: 5-10 seconds random
        logger.info(`Waiting ${(delay / 1000).toFixed(1)}s before next video...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      results.failed++;
      results.errors.push({ url, error: error.message });
      logger.error(`✗ Failed: ${error.message}`);
    }
  }

  // Summary
  logger.info('\n' + '='.repeat(60));
  logger.info('BATCH PROCESSING COMPLETE');
  logger.info('='.repeat(60));
  logger.info(`Total: ${results.total}`);
  logger.info(`Successful: ${results.successful}`);
  logger.info(`Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    logger.info('\nFailed URLs:');
    results.errors.forEach(({ url, error }) => {
      logger.info(`  ${url}`);
      logger.info(`    Error: ${error}`);
    });
  }

  logger.info('='.repeat(60));
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
Batch Process Instagram Videos

Usage:
  node examples/batch-process.js <urls_file> [options]

Arguments:
  <urls_file>              File containing Instagram URLs (one per line)

Options:
  --method <method>        Transcription method (default: auto)
  --delay <ms>             Delay between videos in milliseconds (default: 5000-10000 random)
  --notion                 Export in Notion-friendly CSV format (one row per video)
  --ai                     Enable AI processing
  --summarize              Generate summaries
  --topics                 Extract topics
  --hashtags               Generate hashtags
  --model <model>          Ollama model (default: llama3)
  --json                   Also output JSON files

Example urls.txt:
  # Instagram URLs to process
  https://www.instagram.com/p/ABC123xyz/
  https://www.instagram.com/reel/XYZ789abc/
  # Lines starting with # are ignored

Example:
  node examples/batch-process.js urls.txt --ai --summarize --model llama3
  `);
  process.exit(0);
}

const urlsFile = args[0];
const options = {
  transcribeMethod: args.includes('--method') ? args[args.indexOf('--method') + 1] : 'auto',
  delay: args.includes('--delay') ? parseInt(args[args.indexOf('--delay') + 1]) : null,
  notionFormat: args.includes('--notion'),
  aiProcessing: args.includes('--ai'),
  summarize: args.includes('--summarize'),
  extractTopics: args.includes('--topics'),
  generateHashtags: args.includes('--hashtags'),
  outputJson: args.includes('--json'),
  aiModel: args.includes('--model') ? args[args.indexOf('--model') + 1] : 'llama3',
};

batchProcess(urlsFile, options).catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
