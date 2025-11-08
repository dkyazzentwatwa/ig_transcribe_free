import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Check if Ollama is running and list available models
 * @returns {Promise<Array>} List of available models
 */
export async function listOllamaModels() {
  try {
    const response = await axios.get(`${config.ollama.baseUrl}/api/tags`);
    const models = response.data.models || [];
    logger.info(`Found ${models.length} Ollama models`);
    return models.map(m => m.name);
  } catch (error) {
    logger.error(`Cannot connect to Ollama: ${error.message}`);
    throw new Error(`Ollama not available at ${config.ollama.baseUrl}`);
  }
}

/**
 * Generate text using Ollama
 * @param {string} prompt - Prompt for the model
 * @param {object} options - Generation options
 * @returns {Promise<string>} Generated text
 */
export async function generate(prompt, options = {}) {
  const model = options.model || process.env.OLLAMA_MODEL || 'llama3';
  const temperature = options.temperature || 0.7;
  const maxTokens = options.maxTokens || 2000;

  logger.info(`Generating with Ollama model: ${model}`);

  try {
    const response = await axios.post(
      `${config.ollama.baseUrl}/api/generate`,
      {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
        },
      },
      {
        timeout: 120000, // 2 minutes
      }
    );

    const generatedText = response.data.response;
    logger.info('Generation completed');
    return generatedText;

  } catch (error) {
    logger.error(`Ollama generation failed: ${error.message}`);
    throw new Error(`Generation failed: ${error.message}`);
  }
}

/**
 * Summarize transcription text
 * @param {string} transcription - Transcription text
 * @param {object} options - Options
 * @returns {Promise<string>} Summary
 */
export async function summarizeTranscription(transcription, options = {}) {
  const prompt = `Please provide a concise summary of the following video transcription. Focus on the main points and key takeaways:

Transcription:
${transcription}

Summary:`;

  return await generate(prompt, options);
}

/**
 * Extract key topics from transcription
 * @param {string} transcription - Transcription text
 * @param {object} options - Options
 * @returns {Promise<string>} Key topics
 */
export async function extractKeyTopics(transcription, options = {}) {
  const prompt = `Extract the main topics and themes discussed in this video transcription. List them as bullet points:

Transcription:
${transcription}

Main topics:`;

  return await generate(prompt, options);
}

/**
 * Generate hashtags for social media
 * @param {string} transcription - Transcription text
 * @param {object} options - Options
 * @returns {Promise<string>} Hashtags
 */
export async function generateHashtags(transcription, options = {}) {
  const prompt = `Based on this video transcription, suggest 10-15 relevant hashtags for social media posting:

Transcription:
${transcription}

Hashtags:`;

  return await generate(prompt, options);
}

/**
 * Sentiment analysis of transcription
 * @param {string} transcription - Transcription text
 * @param {object} options - Options
 * @returns {Promise<string>} Sentiment analysis
 */
export async function analyzeSentiment(transcription, options = {}) {
  const prompt = `Analyze the sentiment and tone of this video transcription. Describe the overall mood, emotion, and speaker's attitude:

Transcription:
${transcription}

Sentiment Analysis:`;

  return await generate(prompt, options);
}

/**
 * Process transcription with custom prompt
 * @param {string} transcription - Transcription text
 * @param {string} customPrompt - Custom processing prompt
 * @param {object} options - Options
 * @returns {Promise<string>} Result
 */
export async function processWithCustomPrompt(transcription, customPrompt, options = {}) {
  const prompt = `${customPrompt}

Transcription:
${transcription}

Response:`;

  return await generate(prompt, options);
}

export default {
  listOllamaModels,
  generate,
  summarizeTranscription,
  extractKeyTopics,
  generateHashtags,
  analyzeSentiment,
  processWithCustomPrompt,
};
