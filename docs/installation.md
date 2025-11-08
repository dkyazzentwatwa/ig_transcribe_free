# Installation Guide

Complete setup instructions for ig-transcribe.

## System Requirements

- **Operating System**: macOS, Linux, or Windows (WSL recommended)
- **Node.js**: 18.x or higher
- **Python**: 3.8+ (for Whisper)
- **Disk Space**: 2GB+ for dependencies and models

## Step 1: Install System Dependencies

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node
brew install yt-dlp
brew install ffmpeg

# Install Whisper
pip3 install openai-whisper

# Install Ollama (optional - for AI features)
brew install ollama
```

### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# yt-dlp
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# FFmpeg
sudo apt-get install -y ffmpeg

# Whisper
pip3 install openai-whisper

# Ollama
curl https://ollama.ai/install.sh | sh
```

### Windows (WSL)

Use Ubuntu in WSL and follow Linux instructions above, or use native Windows:

```bash
# Install via Chocolatey
choco install nodejs
choco install yt-dlp
choco install ffmpeg

# Whisper
pip install openai-whisper

# Ollama - Download from https://ollama.ai/download
```

## Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/ig-transcribe.git
cd ig-transcribe
```

## Step 3: Install Node Dependencies

```bash
npm install
```

## Step 4: Setup Configuration

```bash
# Create necessary directories and .env file
npm run setup

# Edit .env file with your preferences
nano .env  # or use any text editor
```

### Environment Configuration

Edit `.env`:

```bash
# Ollama Settings (for AI features)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Output Settings
OUTPUT_DIR=./output
CSV_PATH=./output/transcriptions.csv
LOG_LEVEL=info

# Transcription Method (auto, whisper-cli, ollama)
TRANSCRIBE_METHOD=auto
```

## Step 5: Install AI Models (Optional)

If you want AI summaries and topic extraction:

```bash
# Start Ollama
ollama serve

# Pull AI models (in another terminal)
ollama pull gemma3:4b
ollama pull llama3
```

## Step 6: Verify Installation

```bash
# Check all dependencies
npm run check
```

Expected output:
```
✓ Node.js: v18.x.x
✓ yt-dlp: 2025.x.x
✓ FFmpeg: x.x.x
✓ Whisper: Installed
✓ Ollama: Running (optional)
```

## Troubleshooting Installation

### yt-dlp not found

```bash
# macOS
brew install yt-dlp

# Linux
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Whisper installation fails

```bash
# Try with specific Python version
python3 -m pip install --upgrade pip
python3 -m pip install openai-whisper

# macOS with homebrew Python
brew install python3
/opt/homebrew/bin/pip3 install openai-whisper
```

### FFmpeg not found

```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get update
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

### Ollama connection issues

```bash
# Start Ollama server
ollama serve

# Check if running
curl http://localhost:11434/api/tags

# Pull required model
ollama pull gemma3:4b
```

### Permission denied errors

```bash
# macOS/Linux
chmod +x scripts/scrape-account.js
chmod +x index.js

# Fix npm permissions
sudo chown -R $USER ~/.npm
```

## Next Steps

- [Usage Guide](usage.md) - Learn how to use the tool
- [Notion Integration](notion.md) - Setup Notion database
- [Batch Processing](batch-processing.md) - Process multiple videos

## Updating

```bash
# Update dependencies
npm update

# Update yt-dlp (important - Instagram changes frequently)
brew upgrade yt-dlp  # macOS
sudo yt-dlp -U       # Linux

# Update Whisper
pip3 install --upgrade openai-whisper

# Update Ollama models
ollama pull gemma3:4b
```
