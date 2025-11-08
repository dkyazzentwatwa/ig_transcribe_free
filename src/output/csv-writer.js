import { createObjectCsvWriter } from 'csv-writer';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { formatTimestamp } from '../utils/helpers.js';

/**
 * Write transcription results to CSV file
 * @param {string} instagramUrl - Original Instagram URL
 * @param {object} transcription - Transcription result with segments
 * @param {string} csvPath - Path to CSV file (optional)
 * @returns {Promise<void>}
 */
export async function writeTranscriptionToCSV(instagramUrl, transcription, csvPath = null) {
  const outputPath = csvPath || config.output.csvPath;

  // Ensure output directory exists
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  logger.info(`Writing transcription to CSV: ${outputPath}`);

  // Prepare CSV records
  const records = [];

  if (transcription.segments && transcription.segments.length > 0) {
    for (const segment of transcription.segments) {
      records.push({
        instagram_url: instagramUrl,
        start_time: formatTimestamp(segment.start),
        end_time: formatTimestamp(segment.end),
        start_seconds: segment.start.toFixed(3),
        end_seconds: segment.end.toFixed(3),
        text_segment: segment.text.trim(),
      });
    }
  } else {
    // If no segments, write the full text as a single record
    records.push({
      instagram_url: instagramUrl,
      start_time: '00:00:00.000',
      end_time: '00:00:00.000',
      start_seconds: '0.000',
      end_seconds: '0.000',
      text_segment: transcription.text || '',
    });
  }

  // Create CSV writer
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'instagram_url', title: 'Instagram URL' },
      { id: 'start_time', title: 'Start Time (HH:MM:SS.mmm)' },
      { id: 'end_time', title: 'End Time (HH:MM:SS.mmm)' },
      { id: 'start_seconds', title: 'Start (seconds)' },
      { id: 'end_seconds', title: 'End (seconds)' },
      { id: 'text_segment', title: 'Text Segment' },
    ],
    append: existsSync(outputPath), // Append if file exists
  });

  try {
    await csvWriter.writeRecords(records);
    logger.info(`Successfully wrote ${records.length} segments to CSV`);
  } catch (error) {
    logger.error(`Error writing to CSV: ${error.message}`);
    throw new Error(`Failed to write CSV: ${error.message}`);
  }
}

/**
 * Write transcription to JSON file (alternative output format)
 * @param {string} instagramUrl - Original Instagram URL
 * @param {object} transcription - Transcription result
 * @param {string} jsonPath - Path to JSON file
 */
export async function writeTranscriptionToJSON(instagramUrl, transcription, jsonPath) {
  const { writeFileSync } = await import('fs');

  const output = {
    instagram_url: instagramUrl,
    transcription: {
      full_text: transcription.text,
      segments: transcription.segments.map(seg => ({
        start: seg.start,
        end: seg.end,
        text: seg.text,
      })),
    },
    timestamp: new Date().toISOString(),
  };

  // Ensure output directory exists
  const outputDir = dirname(jsonPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    writeFileSync(jsonPath, JSON.stringify(output, null, 2));
    logger.info(`Successfully wrote transcription to JSON: ${jsonPath}`);
  } catch (error) {
    logger.error(`Error writing to JSON: ${error.message}`);
    throw error;
  }
}

/**
 * Write transcription in Notion-friendly format (one row per video)
 * @param {string} instagramUrl - Original Instagram URL
 * @param {object} transcription - Transcription result with segments
 * @param {object} aiResults - Optional AI processing results
 * @param {object} metadata - Optional video metadata
 * @param {string} csvPath - Path to CSV file (optional)
 * @returns {Promise<void>}
 */
export async function writeNotionCSV(instagramUrl, transcription, aiResults = {}, metadata = {}, csvPath = null) {
  const outputPath = csvPath || config.output.csvPath.replace('.csv', '-notion.csv');

  // Ensure output directory exists
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  logger.info(`Writing Notion-friendly CSV: ${outputPath}`);

  // Create timestamped transcript (00:00 - text | 00:05 - text | ...)
  let timestampedTranscript = '';
  if (transcription.segments && transcription.segments.length > 0) {
    timestampedTranscript = transcription.segments
      .map(seg => {
        const timestamp = formatTimestamp(seg.start).substring(3); // Remove "00:" hours if zero
        return `${timestamp} - ${seg.text.trim()}`;
      })
      .join(' | ');
  } else {
    timestampedTranscript = transcription.text || '';
  }

  // Create single record for the video
  const record = {
    video_url: instagramUrl,
    ai_summary: aiResults.summary || '',
    full_transcript: transcription.text || '',
    timestamped_transcript: timestampedTranscript,
    duration_seconds: metadata.duration || (transcription.segments?.length > 0
      ? transcription.segments[transcription.segments.length - 1].end
      : 0),
    segments_count: transcription.segments?.length || 0,
    topics: Array.isArray(aiResults.topics) ? aiResults.topics.join(', ') : (aiResults.topics || ''),
    hashtags: Array.isArray(aiResults.hashtags) ? aiResults.hashtags.join(', ') : (aiResults.hashtags || ''),
    date_processed: new Date().toLocaleDateString('en-US'), // MM/DD/YYYY format for Notion
  };

  // Create CSV writer
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'video_url', title: 'Video URL' },
      { id: 'ai_summary', title: 'AI Summary' },
      { id: 'full_transcript', title: 'Full Transcript' },
      { id: 'timestamped_transcript', title: 'Transcript with Timestamps' },
      { id: 'duration_seconds', title: 'Duration (seconds)' },
      { id: 'segments_count', title: 'Segments' },
      { id: 'topics', title: 'Topics' },
      { id: 'hashtags', title: 'Hashtags' },
      { id: 'date_processed', title: 'Date Processed' },
    ],
    append: existsSync(outputPath), // Append if file exists
  });

  try {
    await csvWriter.writeRecords([record]);
    logger.info(`Successfully wrote video to Notion CSV`);
  } catch (error) {
    logger.error(`Error writing to Notion CSV: ${error.message}`);
    throw new Error(`Failed to write Notion CSV: ${error.message}`);
  }
}

export default {
  writeTranscriptionToCSV,
  writeTranscriptionToJSON,
  writeNotionCSV,
};
