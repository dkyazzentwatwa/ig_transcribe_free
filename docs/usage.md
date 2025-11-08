# Usage Guide

Complete guide to using ig-transcribe for video transcription and analysis.

## Basic Usage

### Single Video Transcription

```bash
# Basic transcription
node index.js "https://www.instagram.com/p/ABC123"

# With AI analysis
node index.js "https://www.instagram.com/reel/XYZ789" \
  --ai \
  --summarize \
  --topics \
  --hashtags \
  --model gemma3:4b

# Notion-friendly export
node index.js "https://www.instagram.com/p/ABC123" \
  --notion \
  --ai \
  --summarize \
  --topics
```

## Command Line Options

### Main Options

| Option | Description | Example |
|--------|-------------|---------|
| `--method <method>` | Transcription method (auto, whisper-cli, ollama) | `--method whisper-cli` |
| `--notion` | Export in Notion-friendly format | `--notion` |
| `--json` | Also output JSON file | `--json` |
| `--chunking` | Use chunking for timestamps | `--chunking` |

### AI Options

| Option | Description | Example |
|--------|-------------|---------|
| `--ai` | Enable AI processing | `--ai` |
| `--summarize` | Generate summary (requires --ai) | `--summarize` |
| `--topics` | Extract key topics (requires --ai) | `--topics` |
| `--hashtags` | Generate hashtags (requires --ai) | `--hashtags` |
| `--model <model>` | Ollama model to use | `--model gemma3:4b` |

### Utility Options

| Option | Description |
|--------|-------------|
| `--check` | Check system requirements |
| `--help, -h` | Show help message |

## Output Formats

### Standard CSV (Default)

One row per transcript segment:

```csv
Instagram URL,Start Time,End Time,Start (seconds),End (seconds),Text Segment
https://instagram.com/p/ABC,00:00:00.000,00:00:05.360,0.000,5.360,First segment text
https://instagram.com/p/ABC,00:00:05.360,00:00:10.880,5.360,10.880,Second segment text
```

**Best for:**
- Video editing
- Caption generation
- Precise timestamp work

### Notion CSV Format (`--notion`)

One row per video:

```csv
Video URL,AI Summary,Full Transcript,Transcript with Timestamps,Duration,Topics,Hashtags,Date
https://instagram.com/p/ABC,Summary here,Full text,00:00 - text | 00:05 - text,96,topic1 topic2,#hash1 #hash2,10/04/2025
```

**Best for:**
- Notion databases
- Content analysis
- Research archiving

### JSON Format (`--json`)

```json
{
  "instagram_url": "https://instagram.com/p/ABC",
  "transcription": {
    "full_text": "Complete transcript...",
    "segments": [
      {
        "start": 0.0,
        "end": 5.36,
        "text": "First segment"
      }
    ]
  },
  "timestamp": "2025-10-04T21:30:00.000Z"
}
```

## Batch Processing

### Process Multiple Videos

```bash
# Create urls.txt with one URL per line
node examples/batch-process.js urls.txt

# With all options
node examples/batch-process.js urls.txt \
  --notion \
  --ai \
  --summarize \
  --topics \
  --hashtags \
  --model gemma3:4b \
  --delay 12000
```

### Batch Options

| Option | Description | Default |
|--------|-------------|---------|
| `--delay <ms>` | Delay between videos (milliseconds) | 5000-10000 (random) |
| `--notion` | Export in Notion format | false |
| All single video options | Same as above | - |

### urls.txt Format

```
# Instagram URLs to process
# Lines starting with # are ignored

https://www.instagram.com/p/ABC123/
https://www.instagram.com/reel/XYZ789/

# You can add comments anywhere
https://www.instagram.com/p/DEF456/
```

## Transcription Methods

### Auto (Default)

Automatically selects best available method:
1. Tries Whisper CLI (best timestamps)
2. Falls back to Ollama Whisper with chunking

```bash
node index.js "URL"  # Uses auto method
```

### Whisper CLI (Recommended)

Best accuracy and timestamp precision:

```bash
node index.js "URL" --method whisper-cli
```

**Pros:**
- Most accurate transcription
- Precise timestamps
- Supports multiple models (tiny, base, small, medium, large)

**Cons:**
- Requires Whisper installation
- Slower than chunking

### Ollama Whisper

Uses local Ollama Whisper model:

```bash
node index.js "URL" --method ollama --chunking
```

**Pros:**
- Fully local processing
- No external API calls

**Cons:**
- Less accurate than Whisper CLI
- May require chunking for timestamps

## AI Processing

### Available Models

```bash
# List installed models
ollama list

# Pull new models
ollama pull gemma3:4b
ollama pull llama3
ollama pull mistral
```

### Summaries

Generate concise summaries of video content:

```bash
node index.js "URL" --ai --summarize --model gemma3:4b
```

Output:
```
--- SUMMARY ---
The speaker discusses how Claude AI organized their business by creating
an onboarding deck and workspace structure, demonstrating the power of
AI-powered systems with institutional memory.
```

### Topic Extraction

Extract key topics and themes:

```bash
node index.js "URL" --ai --topics --model gemma3:4b
```

Output:
```
--- KEY TOPICS ---
- AI workspace organization
- Institutional memory systems
- Claude AI capabilities
- Business automation
```

### Hashtag Generation

Generate relevant hashtags:

```bash
node index.js "URL" --ai --hashtags --model gemma3:4b
```

Output:
```
--- HASHTAGS ---
#AI #ClaudeAI #Automation #Productivity #BusinessTools #AIWorkflow
```

## Examples

### Research Workflow

```bash
# 1. Transcribe with full analysis
node index.js "https://www.instagram.com/p/ABC123" \
  --notion \
  --ai \
  --summarize \
  --topics \
  --hashtags \
  --model gemma3:4b \
  --json

# 2. Import transcriptions-notion.csv into Notion
```

### Content Creator Workflow

```bash
# 1. Get precise timestamps for editing
node index.js "https://www.instagram.com/reel/XYZ789" \
  --method whisper-cli

# 2. Output: transcriptions.csv with frame-accurate timestamps
```

### Batch Analysis Workflow

```bash
# 1. Create urls.txt with competitor videos

# 2. Batch process with delays
node examples/batch-process.js urls.txt \
  --notion \
  --ai \
  --summarize \
  --topics \
  --delay 15000 \
  --model gemma3:4b

# 3. Analyze trends in Notion
```

## Tips & Best Practices

### Rate Limiting

```bash
# Conservative delays (recommended for large batches)
--delay 15000  # 15 seconds

# Moderate delays
--delay 10000  # 10 seconds

# Faster (may trigger rate limits)
--delay 5000   # 5 seconds
```

### Model Selection

| Model | Speed | Quality | RAM | Use Case |
|-------|-------|---------|-----|----------|
| gemma3:4b | Fast | Good | 8GB | Most use cases |
| llama3 | Medium | Better | 16GB | Higher quality needed |
| mistral | Fast | Good | 8GB | Alternative to gemma3 |

### Transcription Quality

```bash
# Highest quality (slow)
--method whisper-cli

# Balanced (recommended)
--method auto

# Fastest (lower quality)
--method ollama --chunking
```

## Troubleshooting

### Video Download Fails

```bash
# Update yt-dlp
brew upgrade yt-dlp

# Try with cookies (for private accounts)
# Note: Not yet implemented in CLI, manual workaround needed
```

### Transcription Errors

```bash
# Check Whisper installation
whisper --help

# Reinstall if needed
pip3 install --force-reinstall openai-whisper
```

### AI Processing Fails

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve

# Pull model again
ollama pull gemma3:4b
```

## Next Steps

- [Notion Integration](notion.md) - Setup Notion database
- [Batch Processing](batch-processing.md) - Process multiple videos
- [Troubleshooting](troubleshooting.md) - Solve common issues
