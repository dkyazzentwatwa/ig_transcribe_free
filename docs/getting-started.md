# Getting Started

Quick guide to get up and running with ig-transcribe in 5 minutes.

## Prerequisites Checklist

Before starting, install:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **yt-dlp** - `brew install yt-dlp` (macOS)
- [ ] **FFmpeg** - `brew install ffmpeg` (macOS)
- [ ] **Whisper** - `pip3 install openai-whisper`
- [ ] **Ollama** (optional) - `brew install ollama` (macOS)

## 5-Minute Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/ig-transcribe.git
cd ig-transcribe
npm install
npm run setup
```

### 2. Test with Single Video

```bash
node index.js "https://www.instagram.com/p/DPQLZE_jl-f/"
```

Expected output:
```
✓ Video downloaded
✓ Audio extracted
✓ Transcription completed
✓ CSV written: output/transcriptions_2025-11-08.csv
```

### 3. View Results

```bash
cat output/transcriptions_2025-11-08.csv
```

**Note**: Output files include the date to prevent overwrites.

## Next: Add AI Features

### Install Ollama and Model

```bash
# Install Ollama
brew install ollama

# Start Ollama
ollama serve

# In another terminal, pull model
ollama pull gemma3:4b
```

### Run with Full AI Analysis

```bash
# One command does it all!
node index.js "https://www.instagram.com/reel/XYZ789" --full
```

**Output files**:
- `output/transcriptions-notion_2025-11-08.csv` - Notion-ready CSV
- `output/transcriptions-summary_2025-11-08.md` - Markdown summary with AI analysis

## Import to Notion

Import `output/transcriptions-notion_2025-11-08.csv` into Notion to build your searchable database!

## What's Next?

- [Full Usage Guide](usage.md) - All commands and options
- [Batch Processing](batch-processing.md) - Process multiple videos
- [Notion Integration](notion.md) - Build your database

## Troubleshooting Quick Fixes

**"yt-dlp not found"**
```bash
brew install yt-dlp
```

**"Whisper not found"**
```bash
pip3 install openai-whisper
```

**"Ollama connection failed"**
```bash
ollama serve
```

---

✨ **You're all set!** Start transcribing Instagram videos.
