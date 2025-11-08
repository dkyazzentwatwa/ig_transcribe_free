import { logger } from '../utils/logger.js';
import * as whisper from './whisper.js';

/**
 * Main transcription function using Whisper
 * @param {string} audioPath - Path to audio file
 * @param {object} options - Transcription options
 * @returns {Promise<object>} Transcription result with segments
 */
export async function transcribe(audioPath, options = {}) {
  const method = options.method || process.env.TRANSCRIBE_METHOD || 'auto';

  logger.info(`Transcription method: ${method}`);

  try {
    // Try Whisper CLI first (best timestamps)
    if (method === 'whisper-cli' || method === 'auto') {
      try {
        logger.info('Using Whisper CLI...');
        return await whisper.transcribeWithWhisperCLI(audioPath);
      } catch (error) {
        if (method === 'whisper-cli') {
          throw error;
        }
        logger.warn(`Whisper CLI not available: ${error.message}`);
      }
    }

    // Fallback to Ollama Whisper with chunking
    if (method === 'ollama' || method === 'auto') {
      try {
        const isOllamaAvailable = await whisper.checkOllamaWhisper();
        if (isOllamaAvailable) {
          logger.info('Using Ollama Whisper with chunking...');
          return await whisper.transcribe(audioPath, { useChunking: true });
        }
      } catch (error) {
        if (method === 'ollama') {
          throw error;
        }
        logger.warn(`Ollama Whisper failed: ${error.message}`);
      }
    }

    throw new Error('No transcription method available. Please install: pip install openai-whisper');

  } catch (error) {
    logger.error(`Transcription failed: ${error.message}`);
    throw error;
  }
}

/**
 * Check which transcription methods are available
 * @returns {Promise<object>} Available methods
 */
export async function checkAvailableMethods() {
  const methods = {
    whisperCli: false,
    ollamaWhisper: false,
  };

  try {
    await whisper.transcribeWithWhisperCLI('/dev/null');
    methods.whisperCli = true;
  } catch {}

  try {
    methods.ollamaWhisper = await whisper.checkOllamaWhisper();
  } catch {}

  return methods;
}

export default {
  transcribe,
  checkAvailableMethods,
};
