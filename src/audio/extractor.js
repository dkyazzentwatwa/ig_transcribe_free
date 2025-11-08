import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join, parse } from 'path';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Check if ffmpeg is installed
 * @returns {Promise<boolean>}
 */
export async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract audio from video file using ffmpeg
 * @param {string} videoPath - Path to video file
 * @param {object} options - Extraction options
 * @returns {Promise<string>} Path to extracted audio file
 */
export async function extractAudio(videoPath, options = {}) {
  // Verify ffmpeg is installed
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    throw new Error('ffmpeg is not installed. Please install ffmpeg to extract audio.');
  }

  // Ensure output directory exists
  const outputDir = options.outputDir || config.output.audioDir;
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Parse video filename
  const { name: videoName } = parse(videoPath);
  const audioFormat = options.format || config.ffmpeg.format;
  const sampleRate = options.sampleRate || config.ffmpeg.sampleRate;
  const channels = options.channels || config.ffmpeg.channels;

  const audioPath = join(outputDir, `${videoName}.${audioFormat}`);

  logger.info(`Extracting audio from: ${videoPath}`);
  logger.info(`Output audio file: ${audioPath}`);
  logger.info(`Format: ${audioFormat}, Sample rate: ${sampleRate}Hz, Channels: ${channels}`);

  try {
    // FFmpeg command to extract audio
    // -i: input file
    // -vn: no video
    // -ar: sample rate
    // -ac: number of audio channels
    // -acodec: audio codec (pcm_s16le for WAV)
    const codec = audioFormat === 'wav' ? 'pcm_s16le' : 'libmp3lame';

    const ffmpegCommand = `ffmpeg -i "${videoPath}" -vn -ar ${sampleRate} -ac ${channels} -acodec ${codec} -y "${audioPath}"`;

    logger.debug(`Executing: ${ffmpegCommand}`);

    const { stdout, stderr } = await execAsync(ffmpegCommand);

    if (stderr && !stderr.includes('error')) {
      logger.debug(`FFmpeg stderr: ${stderr}`);
    }

    if (!existsSync(audioPath)) {
      throw new Error('Audio file was not created');
    }

    logger.info('Audio extraction completed successfully');
    return audioPath;

  } catch (error) {
    logger.error(`Error extracting audio: ${error.message}`);
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
}

/**
 * Get audio duration using ffprobe
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<number>} Duration in seconds
 */
export async function getAudioDuration(audioPath) {
  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    const { stdout } = await execAsync(command);
    const duration = parseFloat(stdout.trim());
    return duration;
  } catch (error) {
    logger.error(`Error getting audio duration: ${error.message}`);
    return 0;
  }
}

/**
 * Get audio metadata
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<object>} Audio metadata
 */
export async function getAudioMetadata(audioPath) {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${audioPath}"`;
    const { stdout } = await execAsync(command);
    const metadata = JSON.parse(stdout);

    const audioStream = metadata.streams?.find(s => s.codec_type === 'audio');

    return {
      duration: parseFloat(metadata.format?.duration || 0),
      sampleRate: parseInt(audioStream?.sample_rate || 0),
      channels: parseInt(audioStream?.channels || 0),
      bitRate: parseInt(metadata.format?.bit_rate || 0),
      format: metadata.format?.format_name,
      codec: audioStream?.codec_name,
    };
  } catch (error) {
    logger.error(`Error getting audio metadata: ${error.message}`);
    return null;
  }
}

export default {
  checkFFmpeg,
  extractAudio,
  getAudioDuration,
  getAudioMetadata,
};
