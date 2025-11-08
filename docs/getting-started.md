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
✓ CSV written: output/transcriptions.csv
```

### 3. View Results

```bash
cat output/transcriptions.csv
```

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

### Run with AI

```bash
node index.js "https://www.instagram.com/reel/XYZ789" \
  --ai \
  --summarize \
  --topics \
  --model gemma3:4b
```

## Next: Notion Export

```bash
node index.js "URL" \
  --notion \
  --ai \
  --summarize \
  --topics \
  --model gemma3:4b
```

Import `output/transcriptions-notion.csv` into Notion!

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
