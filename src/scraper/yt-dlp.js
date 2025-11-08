import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { extractVideoId } from '../utils/helpers.js';

const execAsync = promisify(exec);

/**
 * Check if yt-dlp is installed
 * @returns {Promise<boolean>}
 */
export async function checkYtDlp() {
  try {
    await execAsync('yt-dlp --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Download Instagram video using yt-dlp
 * @param {string} url - Instagram video URL
 * @returns {Promise<string>} Path to downloaded video
 */
export async function downloadWithYtDlp(url) {
  const hasYtDlp = await checkYtDlp();
  if (!hasYtDlp) {
    throw new Error('yt-dlp is not installed. Install with: brew install yt-dlp');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error(`Could not extract video ID from URL: ${url}`);
  }

  const outputDir = config.output.videoDir;
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, `${videoId}.mp4`);

  logger.info(`Downloading Instagram video with yt-dlp: ${url}`);
  logger.info(`Output: ${outputPath}`);

  try {
    // yt-dlp command with options for Instagram
    const command = `yt-dlp "${url}" -o "${outputPath}" --quiet --no-warnings --format best`;

    logger.debug(`Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minutes
    });

    if (stderr) {
      logger.debug(`yt-dlp stderr: ${stderr}`);
    }

    if (!existsSync(outputPath)) {
      throw new Error('Video file was not created by yt-dlp');
    }

    logger.info('✓ Video downloaded successfully with yt-dlp');
    return outputPath;

  } catch (error) {
    logger.error(`yt-dlp download failed: ${error.message}`);
    throw new Error(`Failed to download video with yt-dlp: ${error.message}`);
  }
}

export default downloadWithYtDlp;
