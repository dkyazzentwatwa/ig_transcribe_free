#!/usr/bin/env node

import { config } from './src/config.js';
import { logger } from './src/utils/logger.js';
import { downloadWithYtDlp, checkYtDlp } from './src/scraper/yt-dlp.js';
import { extractAudio, checkFFmpeg, getAudioMetadata } from './src/audio/extractor.js';
import { transcribe, checkAvailableMethods } from './src/transcribe/index.js';
import { writeTranscriptionToCSV, writeTranscriptionToJSON, writeNotionCSV, writeAISummaryToMarkdown } from './src/output/csv-writer.js';
import {
  summarizeTranscription,
  extractKeyTopics,
  generateHashtags,
  listOllamaModels
} from './src/ai/ollama.js';
import { isValidInstagramUrl } from './src/utils/helpers.js';

/**
 * Main workflow to process Instagram video
 * @param {string} instagramUrl - Instagram video URL
 * @param {object} options - Processing options
 */
async function processInstagramVideo(instagramUrl, options = {}) {
  const startTime = Date.now();

  try {
    // Validate URL
    if (!isValidInstagramUrl(instagramUrl)) {
      throw new Error(`Invalid Instagram URL: ${instagramUrl}`);
    }

    logger.info('='.repeat(60));
    logger.info('Instagram Video Transcription Pipeline');
    logger.info('='.repeat(60));
    logger.info(`URL: ${instagramUrl}`);

    // Step 1: Download video with yt-dlp
    logger.info('\n[1/5] Downloading Instagram video...');

    const hasYtDlp = await checkYtDlp();
    if (!hasYtDlp) {
      throw new Error('yt-dlp is required. Install with: brew install yt-dlp');
    }

    const videoPath = await downloadWithYtDlp(instagramUrl);
    logger.info(`✓ Video downloaded: ${videoPath}`);

    // Step 2: Extract audio
    logger.info('\n[2/5] Extracting audio from video...');
    const audioPath = await extractAudio(videoPath);
    logger.info(`✓ Audio extracted: ${audioPath}`);

    // Get audio metadata
    const metadata = await getAudioMetadata(audioPath);
    if (metadata) {
      logger.info(`  Duration: ${metadata.duration.toFixed(2)}s`);
      logger.info(`  Sample Rate: ${metadata.sampleRate}Hz`);
      logger.info(`  Channels: ${metadata.channels}`);
    }

    // Step 3: Transcribe audio
    logger.info('\n[3/5] Transcribing audio...');
    const transcription = await transcribe(audioPath, {
      method: options.transcribeMethod,
      useChunking: options.useChunking,
    });
    logger.info(`✓ Transcription completed`);
    logger.info(`  Text length: ${transcription.text.length} characters`);
    logger.info(`  Segments: ${transcription.segments?.length || 0}`);

    // Step 4: AI Processing (if enabled)
    const aiResults = {};
    if (options.aiProcessing) {
      logger.info('\n[4/5] AI Processing with Ollama...');

      try {
        const models = await listOllamaModels();
        logger.info(`  Available models: ${models.join(', ')}`);

        if (options.summarize) {
          logger.info('  Generating summary...');
          aiResults.summary = await summarizeTranscription(transcription.text, {
            model: options.aiModel,
          });
          logger.info(`\n--- SUMMARY ---\n${aiResults.summary}\n`);
        }

        if (options.extractTopics) {
          logger.info('  Extracting key topics...');
          aiResults.topics = await extractKeyTopics(transcription.text, {
            model: options.aiModel,
          });
          logger.info(`\n--- KEY TOPICS ---\n${aiResults.topics}\n`);
        }

        if (options.generateHashtags) {
          logger.info('  Generating hashtags...');
          aiResults.hashtags = await generateHashtags(transcription.text, {
            model: options.aiModel,
          });
          logger.info(`\n--- HASHTAGS ---\n${aiResults.hashtags}\n`);
        }

      } catch (error) {
        logger.warn(`AI processing failed: ${error.message}`);
      }

      // Write AI summary to markdown if we have results
      if (Object.keys(aiResults).length > 0) {
        try {
          const summaryPath = await writeAISummaryToMarkdown(instagramUrl, aiResults, metadata);
          logger.info(`✓ AI summary written: ${summaryPath}`);
        } catch (error) {
          logger.warn(`Failed to write AI summary: ${error.message}`);
        }
      }
    }

    // Step 5: Write to CSV
    logger.info('\n[5/5] Writing results to CSV...');

    let csvPath;
    if (options.notionFormat) {
      // Write Notion-friendly format (one row per video)
      csvPath = await writeNotionCSV(instagramUrl, transcription, aiResults, metadata);
      logger.info(`✓ Notion CSV written: ${csvPath}`);
    } else {
      // Write default format (one row per segment)
      csvPath = await writeTranscriptionToCSV(instagramUrl, transcription);
      logger.info(`✓ CSV written: ${csvPath}`);
    }

    // Optional: Write to JSON
    if (options.outputJson) {
      const jsonPath = config.output.csvPath.replace('.csv', '.json');
      await writeTranscriptionToJSON(instagramUrl, transcription, jsonPath);
      logger.info(`✓ JSON written: ${jsonPath}`);
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info('\n' + '='.repeat(60));
    logger.info('✓ Pipeline completed successfully');
    logger.info(`  Total time: ${duration}s`);
    logger.info('='.repeat(60));

    return {
      success: true,
      videoPath,
      audioPath,
      transcription,
      csvPath,
    };

  } catch (error) {
    logger.error(`\n✗ Pipeline failed: ${error.message}`);
    logger.error(error.stack);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check system requirements
 */
async function checkRequirements() {
  logger.info('Checking system requirements...\n');

  // Check yt-dlp (for Instagram video download)
  const hasYtDlp = await checkYtDlp();
  logger.info(`yt-dlp: ${hasYtDlp ? '✓ Installed' : '✗ Not found (install with: brew install yt-dlp)'}`);

  // Check FFmpeg
  const hasFFmpeg = await checkFFmpeg();
  logger.info(`FFmpeg: ${hasFFmpeg ? '✓ Installed' : '✗ Not found'}`);

  // Check transcription methods
  const methods = await checkAvailableMethods();
  logger.info(`Apple Speech: ${methods.appleSpeech ? '✓ Available' : '✗ Not available'}`);
  logger.info(`Ollama Whisper: ${methods.ollamaWhisper ? '✓ Available' : '✗ Not available'}`);

  // Check Ollama for AI processing
  try {
    const models = await listOllamaModels();
    logger.info(`Ollama Models: ✓ ${models.length} models available`);
    if (models.length > 0) {
      logger.info(`  ${models.join(', ')}`);
    }
  } catch (error) {
    logger.info('Ollama: ✗ Not available');
  }

  logger.info('\n');
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);

  // Help command
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Instagram Video Transcription Tool

Usage:
  node index.js <instagram_url> [options]

Options:
  --method <method>        Transcription method (auto|ollama|whisper-cli)
  --chunking               Use chunking for timestamps
  --json                   Also output JSON file
  --notion                 Export in Notion-friendly CSV format (one row per video)
  --ai                     Enable AI processing
  --summarize              Generate summary (requires --ai)
  --topics                 Extract key topics (requires --ai)
  --hashtags               Generate hashtags (requires --ai)
  --full                   Enable everything (AI, summarize, topics, hashtags, notion)
  --model <model>          Ollama model for AI processing (default: from .env)
  --check                  Check system requirements
  --help, -h               Show this help message

Examples:
  node index.js "https://instagram.com/p/ABC123"
  node index.js "https://instagram.com/reel/XYZ789" --full
  node index.js "https://instagram.com/reel/XYZ789" --full --model gemma3:4b
  node index.js "https://instagram.com/p/ABC123" --ai --summarize --topics --hashtags --notion

Environment Variables:
  See .env.example for configuration options
    `);
    process.exit(0);
  }

  // Check requirements command
  if (args.includes('--check')) {
    await checkRequirements();
    process.exit(0);
  }

  // Parse arguments
  const instagramUrl = args[0];

  if (!instagramUrl) {
    console.error('Error: Instagram URL required\n');
    console.error('Usage: node index.js <instagram_url> [options]');
    console.error('Run with --help for more information');
    process.exit(1);
  }

  const fullMode = args.includes('--full');

  const options = {
    transcribeMethod: args.includes('--method')
      ? args[args.indexOf('--method') + 1]
      : 'auto',
    useChunking: args.includes('--chunking'),
    notionFormat: args.includes('--notion') || fullMode,
    outputJson: args.includes('--json'),
    aiProcessing: args.includes('--ai') || fullMode,
    summarize: args.includes('--summarize') || fullMode,
    extractTopics: args.includes('--topics') || fullMode,
    generateHashtags: args.includes('--hashtags') || fullMode,
    aiModel: args.includes('--model')
      ? args[args.indexOf('--model') + 1]
      : config.ollama.model,
  };

  // Run pipeline
  const result = await processInstagramVideo(instagramUrl, options);

  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export { processInstagramVideo, checkRequirements };
export default processInstagramVideo;
