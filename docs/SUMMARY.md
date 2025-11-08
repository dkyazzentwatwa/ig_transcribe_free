# Documentation Summary

Complete guide to ig-transcribe features and workflows.

## 📚 Documentation Index

### Getting Started
- **[Getting Started](getting-started.md)** ⭐ - 5-minute quick start
- **[Installation](installation.md)** - Detailed setup for all platforms
- **[Usage Guide](usage.md)** - Commands, options, and examples

### Features
- **[Notion Integration](notion.md)** - Build searchable Notion databases
- **[Batch Processing](batch-processing.md)** - Process multiple videos at scale
- **[Account Scraping](batch-processing.md#extracting-urls-from-instagram-accounts)** - Extract all videos from profiles

### Technical
- **[Architecture](architecture.md)** - System design and internals
- **[Troubleshooting](troubleshooting.md)** - Solutions to common issues

## 🎯 Common Workflows

### 1. Single Video Transcription

```bash
# Basic
node index.js "https://www.instagram.com/p/ABC123"

# With AI
node index.js "URL" --ai --summarize --topics --model gemma3:4b

# For Notion
node index.js "URL" --notion --ai --summarize --topics
```

### 2. Batch Processing for Notion

```bash
# Step 1: Extract URLs (browser console)
# Open profile → DevTools → Run script (see batch-processing.md)

# Step 2: Process all videos
node examples/batch-process.js urls.txt \
  --notion \
  --ai \
  --summarize \
  --topics \
  --delay 12000

# Step 3: Import to Notion
# Open Notion → Import → Select transcriptions-notion.csv
```

### 3. Competitor Analysis

```bash
# Extract competitor videos
# (Use browser console method)

# Process with detailed analysis
node examples/batch-process.js competitor-urls.txt \
  --notion \
  --ai \
  --summarize \
  --topics \
  --hashtags \
  --model gemma3:4b \
  --delay 15000

# Analyze in Notion
```

## 📊 Output Format Comparison

| Format | Use Case | Rows | Columns |
|--------|----------|------|---------|
| **Notion CSV** | Notion database, analysis | 1 per video | URL, AI Summary, Transcripts, Topics, etc. |
| **Standard CSV** | Video editing, captions | 1 per segment | URL, Start/End times, Text |

## 🔧 Key Configuration

### Transcription Methods

1. **Auto** (default) - Tries Whisper CLI → falls back to Ollama
2. **Whisper CLI** - Best accuracy, precise timestamps
3. **Ollama** - Local processing, requires chunking

### AI Models

| Model | Speed | Quality | RAM | Best For |
|-------|-------|---------|-----|----------|
| gemma3:4b | Fast | Good | 8GB | Most use cases |
| llama3 | Medium | Better | 16GB | Higher quality |
| mistral | Fast | Good | 8GB | Alternative |

### Rate Limiting

| Batch Size | Delay | Risk |
|------------|-------|------|
| < 10 videos | 5-8s | Very Low |
| 10-50 videos | 10-15s | Low |
| 50-100 videos | 15-20s | Medium |
| 100+ videos | 20-30s | Safe |

## 🚨 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| `yt-dlp not found` | `brew install yt-dlp` |
| `Whisper not found` | `pip3 install openai-whisper` |
| `Ollama connection failed` | `ollama serve` |
| `Invalid URL` | Update code: `git pull` |
| `Download fails` | Update: `brew upgrade yt-dlp` |
| `Rate limit` | Increase `--delay` |

## 📈 Performance

**Processing Time per Video:**
- Download: 2-5s
- Audio extraction: <1s
- Transcription: 15-60s (depends on model)
- AI analysis: 5-30s (depends on model)

**Total**: ~20-90s per video

**Batch Example:**
- 100 videos @ 20s each + 12s delay = ~53 minutes

## 🎓 Learning Path

1. **Day 1**: [Getting Started](getting-started.md)
   - Install dependencies
   - Transcribe first video
   - View results

2. **Day 2**: [Usage Guide](usage.md)
   - Try different options
   - Add AI analysis
   - Test Notion export

3. **Day 3**: [Batch Processing](batch-processing.md)
   - Extract URLs from account
   - Process 10-20 videos
   - Import to Notion

4. **Day 4**: [Advanced](architecture.md)
   - Understand architecture
   - Optimize workflows
   - Troubleshoot issues

## 📞 Need Help?

1. Check [Troubleshooting](troubleshooting.md)
2. Search [GitHub Issues](https://github.com/yourusername/ig-transcribe/issues)
3. Ask in [Discussions](https://github.com/yourusername/ig-transcribe/discussions)
4. Read [Architecture](architecture.md) for technical details

## 🔗 Quick Links

- [Installation](installation.md)
- [Usage](usage.md)
- [Notion Guide](notion.md)
- [Batch Processing](batch-processing.md)
- [Troubleshooting](troubleshooting.md)
- [Architecture](architecture.md)
