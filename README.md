# Instagram Video Transcription Tool

🎥 Download Instagram videos, transcribe them with Whisper, analyze with AI, and export to Notion-friendly CSV format.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- 📥 **Download Instagram videos** using yt-dlp (bypasses bot detection)
- 🎤 **Transcribe with timestamps** using OpenAI Whisper
- 🤖 **AI Analysis** with local Ollama models (summaries, topics, hashtags)
- 📊 **Notion-ready CSV export** (one row per video with timestamps)
- 📝 **Markdown summaries** with AI analysis exported separately
- 📅 **Timestamped outputs** - files include dates to prevent overwrites
- ⚡ **One-command mode** - use `--full` flag for everything
- 🔄 **Batch processing** with configurable delays
- 🌐 **Account scraping** to extract all videos from a profile

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Install](https://nodejs.org/))
- **yt-dlp** ([Install](https://github.com/yt-dlp/yt-dlp#installation))
- **FFmpeg** ([Install](https://ffmpeg.org/download.html))
- **Whisper** ([Install](https://github.com/openai/whisper#setup))
- **Ollama** (optional, for AI analysis) ([Install](https://ollama.ai/))

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ig-transcribe.git
cd ig-transcribe

# Install dependencies
npm install

# Setup environment
npm run setup
```

### Basic Usage

```bash
# Transcribe a single video
node index.js "https://www.instagram.com/p/ABC123"

# Full AI analysis (recommended - includes everything)
node index.js "https://www.instagram.com/reel/XYZ789" --full

# Or with custom model
node index.js "https://www.instagram.com/reel/XYZ789" --full --model gemma3:4b
```

### Batch Processing Workflow

```bash
# 1. Extract URLs from Instagram account (use browser console - see docs)
# Add URLs to urls.txt (one per line)

# 2. Batch process all videos with full AI analysis
node examples/batch-process.js urls.txt --full --delay 12000

# 3. Import output/transcriptions-notion_2025-11-08.csv into Notion
```

## 📊 Output Formats

All output files include timestamps in the filename (e.g., `transcriptions_2025-11-08.csv`) to prevent overwrites.

### Notion CSV (Recommended)
One row per video with all data in a single database entry:

| Video URL | AI Summary | Full Transcript | Transcript with Timestamps | Duration | Topics | Hashtags | Date |
|-----------|------------|-----------------|---------------------------|----------|--------|----------|------|

**Timestamp format**: `00:00 - text | 00:05 - text | 00:10 - text`

### AI Summary Markdown
Separate markdown file with AI analysis (generated when using `--full` or AI flags):
- Video URL and metadata
- AI-generated summary
- Key topics (bulleted list)
- Generated hashtags

**Example**: `transcriptions-summary_2025-11-08.md`

### Standard CSV
One row per transcript segment (for video editing):

| Instagram URL | Start Time | End Time | Text Segment |
|---------------|------------|----------|--------------|

## 📸 Screenshots

### Terminal Output
![Terminal Output](examples/output_terminal.png)

### Example Output
![Output Example](examples/output_example.png)

## 📚 Documentation

- [Getting Started](docs/getting-started.md) - 5-minute setup
- [Installation Guide](docs/installation.md) - Detailed setup instructions
- [Usage Guide](docs/usage.md) - All commands and options
- [Notion Integration](docs/notion.md) - Complete Notion workflow
- [Batch Processing](docs/batch-processing.md) - Account scraping and automation
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
- [Architecture](docs/architecture.md) - Technical details

## 🎯 Use Cases

- **Content Analysis**: Analyze Instagram video content at scale
- **Notion Database**: Build a searchable database of video transcripts
- **SEO Research**: Extract topics and keywords from competitors
- **Content Repurposing**: Get timestamped transcripts for editing
- **Research**: Archive and analyze social media content

## 🔧 Configuration

Create `.env` file (or edit `.env.example`):

```bash
# Ollama AI Models
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Output settings
OUTPUT_DIR=./output
CSV_PATH=./output/transcriptions.csv

# Transcription settings
TRANSCRIBE_METHOD=auto  # auto, whisper-cli, ollama
```

## 📖 Examples

### Single Video with Full Analysis (Recommended)

```bash
# One command does it all!
node index.js "https://www.instagram.com/reel/ABC123" --full

# Or specify a custom model
node index.js "https://www.instagram.com/reel/ABC123" --full --model deepseek-r1:14b
```

**Output files**:
- `transcriptions-notion_2025-11-08.csv` - Notion-ready CSV
- `transcriptions-summary_2025-11-08.md` - Markdown summary with AI analysis

### Custom AI Options

```bash
# Just summary and topics (no hashtags)
node index.js "https://www.instagram.com/reel/ABC123" \
  --ai --summarize --topics --notion

# Just transcription (no AI)
node index.js "https://www.instagram.com/reel/ABC123"
```

### Batch Processing 100 Videos

```bash
# Step 1: Use browser console to extract URLs (see docs/batch-processing.md)
# Step 2: Save to urls.txt
# Step 3: Process with 12-second delays

node examples/batch-process.js urls.txt --full --delay 12000
```

### For Video Editing (Precise Timestamps)

```bash
node index.js "URL" --method whisper-cli
# Output: transcriptions_2025-11-08.csv with frame-accurate timestamps
```

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for personal and educational use only. Always respect Instagram's Terms of Service and content creators' rights. Use responsibly and ethically.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloading
- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition
- [Ollama](https://ollama.ai/) - Local AI models
- [FFmpeg](https://ffmpeg.org/) - Audio/video processing

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/yourusername/ig-transcribe/issues)
- 💬 [Discussions](https://github.com/yourusername/ig-transcribe/discussions)

---

Made with ❤️ for content creators and researchers
