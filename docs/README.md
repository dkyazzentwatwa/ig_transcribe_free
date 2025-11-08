# Documentation

Complete documentation for ig-transcribe.

## Getting Started

- **[Installation Guide](installation.md)** - Complete setup instructions
- **[Usage Guide](usage.md)** - How to use all features
- **[Quick Start](../README.md#quick-start)** - Get running in 5 minutes

## Features

- **[Notion Integration](notion.md)** - Build a Notion database of transcripts
- **[Batch Processing](batch-processing.md)** - Process multiple videos at scale
- **[Account Scraping](batch-processing.md#extracting-urls-from-instagram-accounts)** - Extract all videos from a profile

## Technical

- **[Architecture](architecture.md)** - System design and internals
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

## Output Formats

### Notion CSV Format
**Best for:** Building Notion databases, content analysis

One row per video:
```csv
Video URL, AI Summary, Full Transcript, Transcript with Timestamps, Duration, Topics, Hashtags, Date
```

### Standard CSV Format
**Best for:** Video editing, precise timestamps

One row per segment:
```csv
Instagram URL, Start Time, End Time, Start (seconds), End (seconds), Text Segment
```

## Common Tasks

### Single Video

```bash
# Basic transcription
node index.js "https://www.instagram.com/p/ABC123"

# With AI and Notion export
node index.js "URL" --notion --ai --summarize --topics --model gemma3:4b
```

### Batch Processing

```bash
# 1. Get URLs (browser console method - see batch-processing.md)
# 2. Save to urls.txt
# 3. Process
node examples/batch-process.js urls.txt --notion --ai --summarize --delay 12000
```

### Troubleshooting

See [Troubleshooting Guide](troubleshooting.md) for:
- Installation issues
- Download failures
- Transcription errors
- AI processing problems

## File Structure

```
ig-transcribe/
├── docs/                    # Documentation (you are here)
│   ├── installation.md      # Setup guide
│   ├── usage.md            # Usage examples
│   ├── notion.md           # Notion integration
│   ├── batch-processing.md # Batch workflows
│   ├── troubleshooting.md  # Common issues
│   └── architecture.md     # Technical details
│
├── src/                    # Source code
│   ├── scraper/           # Video downloading
│   ├── audio/             # Audio extraction
│   ├── transcribe/        # Speech-to-text
│   ├── ai/                # AI analysis
│   ├── output/            # CSV/JSON export
│   └── utils/             # Utilities
│
├── examples/              # Example scripts
│   └── batch-process.js   # Batch processing
│
├── scripts/               # Helper scripts
│   └── scrape-account.js  # Account scraper
│
├── index.js               # Main entry point
├── README.md             # Project overview
└── .env.example          # Config template
```

## Support

- 📖 **[Documentation](.)** - You're here!
- 🐛 **[Issues](https://github.com/yourusername/ig-transcribe/issues)** - Report bugs
- 💬 **[Discussions](https://github.com/yourusername/ig-transcribe/discussions)** - Ask questions
- 🤝 **[Contributing](../CONTRIBUTING.md)** - Contribute code

## Next Steps

1. [Install dependencies](installation.md)
2. [Run your first transcription](usage.md)
3. [Setup Notion integration](notion.md)
4. [Process videos in batch](batch-processing.md)
