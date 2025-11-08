import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

export const config = {
  // Ollama configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3',
    whisperModel: process.env.OLLAMA_WHISPER_MODEL || 'dimavz/whisper-tiny:latest',
  },

  // Puppeteer configuration
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    slowMo: parseInt(process.env.PUPPETEER_SLOWMO || '50', 10),
    defaultTimeout: parseInt(process.env.PUPPETEER_TIMEOUT || '30000', 10),
  },

  // Proxy configuration (optional)
  proxy: {
    enabled: process.env.PROXY_ENABLED === 'true',
    url: process.env.PROXY_URL || null, // e.g., 'http://proxy.example.com:8080'
    username: process.env.PROXY_USERNAME || null,
    password: process.env.PROXY_PASSWORD || null,
  },

  // User agent rotation
  userAgent: {
    rotate: process.env.ROTATE_USER_AGENT !== 'false',
  },

  // Delays and timeouts
  delays: {
    minDelay: parseInt(process.env.MIN_DELAY || '1000', 10),
    maxDelay: parseInt(process.env.MAX_DELAY || '3000', 10),
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10),
  },

  // Output configuration
  output: {
    videoDir: process.env.VIDEO_DIR || './downloads/videos',
    audioDir: process.env.AUDIO_DIR || './downloads/audio',
    csvPath: process.env.CSV_PATH || './output/transcriptions.csv',
    logPath: process.env.LOG_PATH || './logs/app.log',
  },

  // FFmpeg configuration
  ffmpeg: {
    sampleRate: parseInt(process.env.FFMPEG_SAMPLE_RATE || '16000', 10),
    channels: parseInt(process.env.FFMPEG_CHANNELS || '1', 10),
    format: process.env.FFMPEG_FORMAT || 'wav',
  },

  // Instagram configuration
  instagram: {
    loginRequired: process.env.IG_LOGIN_REQUIRED === 'true',
    username: process.env.IG_USERNAME || null,
    password: process.env.IG_PASSWORD || null,
  },
};

export default config;
