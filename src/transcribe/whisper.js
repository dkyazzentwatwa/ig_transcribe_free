import axios from 'axios';
import { readFileSync, existsSync } from 'fs';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if Ollama is running and Whisper model is available
 * @returns {Promise<boolean>}
 */
export async function checkOllamaWhisper() {
  try {
    const response = await axios.get(`${config.ollama.baseUrl}/api/tags`);
    const models = response.data.models || [];
    const whisperModelName = config.ollama.whisperModel || 'dimavz/whisper-tiny:latest';
    const hasWhisper = models.some(m => m.name === whisperModelName || m.name.includes('whisper'));

    if (!hasWhisper) {
      logger.warn(`Whisper model not found in Ollama. Run: ollama pull ${whisperModelName}`);
      return false;
    }

    logger.info(`Found Whisper model: ${whisperModelName}`);
    return true;
  } catch (error) {
    logger.error(`Cannot connect to Ollama at ${config.ollama.baseUrl}`);
    return false;
  }
}

/**
 * Transcribe audio using Ollama Whisper (dimavz/whisper-tiny)
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<object>} Transcription with segments
 */
export async function transcribeWithOllama(audioPath) {
  if (!existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  logger.info(`Transcribing audio: ${audioPath}`);

  try {
    // Use Ollama's generate endpoint with the Whisper model
    // The dimavz/whisper-tiny model expects the file path as the prompt
    const response = await axios.post(
      `${config.ollama.baseUrl}/api/generate`,
      {
        model: config.ollama.whisperModel || 'dimavz/whisper-tiny:latest',
        prompt: audioPath,
        stream: false,
      },
      {
        timeout: 300000, // 5 minutes timeout for long audio
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    let transcription = response.data.response;
    logger.info('Transcription completed');

    // Try to parse as JSON if it contains segments
    try {
      const parsed = JSON.parse(transcription);
      if (parsed.segments || parsed.text) {
        return {
          text: parsed.text || parsed.segments?.map(s => s.text).join(' ') || '',
          segments: parsed.segments || [{
            start: 0,
            end: 0,
            text: parsed.text || transcription
          }]
        };
      }
    } catch {
      // Not JSON, treat as plain text
    }

    // Simple text response - create basic segment structure
    return {
      text: transcription,
      segments: [
        {
          start: 0,
          end: 0, // Will be updated with actual duration
          text: transcription,
        },
      ],
    };

  } catch (error) {
    logger.error(`Ollama transcription failed: ${error.message}`);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Alternative: Use whisper.cpp or openai-whisper for better timestamp support
 * This requires whisper to be installed locally via pip or compiled
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<object>} Transcription with segments
 */
export async function transcribeWithWhisperCLI(audioPath) {
  if (!existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  logger.info(`Transcribing with Whisper CLI: ${audioPath}`);

  try {
    // Check if whisper is installed
    let whisperCommand = 'whisper';

    // Try to detect which whisper is available
    try {
      await execAsync('which whisper');
    } catch {
      try {
        await execAsync('which whisper.cpp');
        whisperCommand = 'whisper.cpp';
      } catch {
        throw new Error('Whisper CLI not found. Install with: pip install openai-whisper');
      }
    }

    // Get base name without extension
    const { parse } = await import('path');
    const { name: baseName } = parse(audioPath);
    const outputDir = '/tmp';

    // Run whisper with JSON output
    const command = `${whisperCommand} "${audioPath}" --model tiny --output_format json --output_dir "${outputDir}"`;
    logger.debug(`Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

    // Read the JSON output - whisper creates filename based on input
    const jsonPath = `${outputDir}/${baseName}.json`;
    logger.debug(`Looking for JSON output at: ${jsonPath}`);

    if (existsSync(jsonPath)) {
      const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'));
      logger.info('Transcription with timestamps completed');

      // Convert Whisper format to our format
      return {
        text: jsonData.text || '',
        segments: jsonData.segments?.map(s => ({
          start: s.start || 0,
          end: s.end || 0,
          text: s.text || '',
        })) || [{
          start: 0,
          end: 0,
          text: jsonData.text || '',
        }],
      };
    } else {
      throw new Error(`Whisper did not produce JSON output at ${jsonPath}`);
    }

  } catch (error) {
    logger.error(`Whisper CLI transcription failed: ${error.message}`);
    throw error;
  }
}

/**
 * Create timestamped segments by splitting audio into chunks
 * This is a fallback method when direct timestamp extraction isn't available
 * @param {string} audioPath - Path to audio file
 * @param {number} chunkDuration - Duration of each chunk in seconds
 * @returns {Promise<Array>} Array of segments with timestamps
 */
export async function transcribeWithChunking(audioPath, chunkDuration = 30) {
  logger.info(`Transcribing with chunking method (${chunkDuration}s chunks)...`);

  try {
    // Get audio duration
    const { stdout: durationStr } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
    );
    const totalDuration = parseFloat(durationStr.trim());
    const numChunks = Math.ceil(totalDuration / chunkDuration);

    logger.info(`Audio duration: ${totalDuration}s, creating ${numChunks} chunks`);

    const segments = [];

    // Split audio into chunks and transcribe each
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * chunkDuration;
      const endTime = Math.min((i + 1) * chunkDuration, totalDuration);
      const chunkPath = `/tmp/chunk_${i}.wav`;

      // Extract chunk
      await execAsync(
        `ffmpeg -i "${audioPath}" -ss ${startTime} -t ${chunkDuration} -ar 16000 -ac 1 -y "${chunkPath}"`
      );

      // Transcribe chunk
      logger.info(`Transcribing chunk ${i + 1}/${numChunks}...`);
      const result = await transcribeWithOllama(chunkPath);

      segments.push({
        start: startTime,
        end: endTime,
        text: result.text.trim(),
      });

      // Clean up chunk file
      await execAsync(`rm "${chunkPath}"`).catch(() => {});
    }

    logger.info('Chunked transcription completed');

    return {
      text: segments.map(s => s.text).join(' '),
      segments: segments,
    };

  } catch (error) {
    logger.error(`Chunked transcription failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main transcription function with fallback strategies
 * @param {string} audioPath - Path to audio file
 * @param {object} options - Transcription options
 * @returns {Promise<object>} Transcription result with segments
 */
export async function transcribe(audioPath, options = {}) {
  const useChunking = options.useChunking || false;
  const chunkDuration = options.chunkDuration || 30;

  try {
    // Strategy 1: Try Whisper CLI if available (best timestamps)
    try {
      logger.info('Attempting transcription with Whisper CLI...');
      return await transcribeWithWhisperCLI(audioPath);
    } catch (error) {
      logger.warn('Whisper CLI not available, trying alternative methods...');
    }

    // Strategy 2: Use chunking with Ollama for timestamps
    if (useChunking) {
      logger.info('Using chunking method for timestamps...');
      return await transcribeWithChunking(audioPath, chunkDuration);
    }

    // Strategy 3: Simple Ollama transcription (no timestamps)
    logger.info('Using Ollama Whisper (no precise timestamps)...');
    const result = await transcribeWithOllama(audioPath);

    // Get audio duration to update segment end time
    const { stdout: durationStr } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
    ).catch(() => ({ stdout: '0' }));

    const duration = parseFloat(durationStr.trim());
    result.segments[0].end = duration;

    return result;

  } catch (error) {
    logger.error(`All transcription methods failed: ${error.message}`);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

export default {
  checkOllamaWhisper,
  transcribeWithOllama,
  transcribeWithWhisperCLI,
  transcribeWithChunking,
  transcribe,
};
