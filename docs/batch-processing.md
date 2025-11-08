# Batch Processing Guide

Process multiple Instagram videos efficiently with automated workflows.

## Overview

Batch processing allows you to:
- Transcribe multiple videos sequentially
- Apply AI analysis to all videos
- Export everything to a single Notion database
- Manage rate limits with configurable delays

## Quick Start

### 1. Prepare URL List

Create `urls.txt` with one URL per line:

```
# My video collection
https://www.instagram.com/reel/ABC123/
https://www.instagram.com/p/DEF456/
https://www.instagram.com/reel/GHI789/
```

### 2. Run Batch Process

```bash
# With full AI analysis (recommended)
node examples/batch-process.js urls.txt --full --delay 12000

# Or with custom model
node examples/batch-process.js urls.txt --full --model deepseek-r1:14b --delay 12000
```

**Output files**:
- `output/transcriptions-notion_2025-11-08.csv` - All videos in one Notion-ready CSV
- `output/transcriptions-summary_2025-11-08.md` - Individual markdown summaries for each video

## Extracting URLs from Instagram Accounts

### Method 1: Browser Console (Recommended)

This is the fastest method since yt-dlp's Instagram user extractor is currently broken.

**Steps:**

1. **Open Instagram profile** in browser:
   ```
   https://www.instagram.com/username/
   ```

2. **Scroll down** to load all videos (Instagram lazy-loads content)

3. **Open DevTools** (F12 or Cmd+Option+I)

4. **Click Console tab**

5. **Run auto-scroll script** to load all videos:

```javascript
// Auto-scroll and extract URLs
(async function() {
  let lastHeight = 0;
  let scrolls = 0;
  console.log('Auto-scrolling to load all videos...');

  while(scrolls < 200) {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1500));

    if(document.body.scrollHeight === lastHeight) break;
    lastHeight = document.body.scrollHeight;
    scrolls++;

    const urls = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].length;
    console.log(`Scrolled ${scrolls} times, found ${urls} URLs...`);
  }

  const urls = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')]
    .map(a => a.href)
    .filter((url, i, arr) => arr.indexOf(url) === i);

  copy(urls.join('\n'));
  console.log(`✓ Done! Found ${urls.length} unique URLs (copied to clipboard)`);
})();
```

6. **Paste into urls.txt** - URLs are now in your clipboard!

### Method 2: Instaloader (CLI Tool)

```bash
# Install
pip3 install instaloader

# Login (required for most accounts)
instaloader --login YOUR_USERNAME

# Download metadata only (gets URLs)
instaloader --no-videos --no-pictures --no-metadata-json username
```

### Method 3: Manual Collection

For small accounts (<20 videos):
1. Visit each video
2. Copy URL from browser address bar
3. Paste into urls.txt

## Batch Processing Options

### Command Structure

```bash
node examples/batch-process.js <urls_file> [options]
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--delay <ms>` | Delay between videos (milliseconds) | 5000-10000 (random) |
| `--full` | Enable everything (AI, summary, topics, hashtags, notion) | false |
| `--notion` | Export in Notion-friendly format | false |
| `--ai` | Enable AI processing | false |
| `--summarize` | Generate summaries | false |
| `--topics` | Extract topics | false |
| `--hashtags` | Generate hashtags | false |
| `--model <name>` | Ollama model to use | from .env |
| `--json` | Also output JSON files | false |

## Rate Limiting Strategy

### Understanding Instagram Limits

Instagram monitors download patterns. Too many requests = temporary block.

**Recommended delays:**

| Batch Size | Delay | Risk Level |
|------------|-------|------------|
| < 10 videos | 5-8s | Very Low |
| 10-50 videos | 10-15s | Low |
| 50-100 videos | 15-20s | Medium |
| 100+ videos | 20-30s | Safe |

### Delay Examples

```bash
# Small batch (< 10 videos) - 8 seconds
node examples/batch-process.js urls.txt --delay 8000

# Medium batch (50 videos) - 12 seconds
node examples/batch-process.js urls.txt --delay 12000

# Large batch (100+ videos) - 20 seconds
node examples/batch-process.js urls.txt --delay 20000

# Random delays (5-10s) - default
node examples/batch-process.js urls.txt
```

### Random vs Fixed Delays

**Random (default):**
```bash
node examples/batch-process.js urls.txt
# Delays: 5.2s, 8.7s, 6.1s, 9.4s... (harder to detect)
```

**Fixed:**
```bash
node examples/batch-process.js urls.txt --delay 10000
# Delays: 10s, 10s, 10s, 10s... (more predictable)
```

**Recommendation**: Use random delays for large batches to avoid detection patterns.

## Processing Time Estimates

### Calculation

```
Total Time = (Videos × Processing Time) + (Videos × Delay)

Where:
- Processing Time ≈ 15-25 seconds per video
- Delay = Your configured delay
```

### Examples

**50 videos with 12s delay:**
```
50 × 20s + 50 × 12s = 1000s + 600s = 1600s ≈ 27 minutes
```

**100 videos with 15s delay:**
```
100 × 20s + 100 × 15s = 2000s + 1500s = 3500s ≈ 58 minutes
```

## Output Management

### Timestamped Files

All output files include dates in filenames (e.g., `transcriptions-notion_2025-11-08.csv`) to prevent overwrites.

### Notion CSV Format

All videos in one file:
```
output/transcriptions-notion_2025-11-08.csv
```

**Structure:**
- One row per video
- Includes: URL, AI Summary, Full Transcript, Timestamps, Topics, Hashtags

### AI Summary Markdown

Individual summaries for each video:
```
output/transcriptions-summary_2025-11-08.md
```

**Structure:**
- Video URL and metadata
- AI-generated summary
- Key topics (bulleted)
- Hashtags

### Standard CSV Format

All videos in one file:
```
output/transcriptions_2025-11-08.csv
```

**Structure:**
- One row per segment
- Includes: URL, Start Time, End Time, Text

### File Behavior

**Append Mode** - Videos processed on the same day append to existing CSV files

```bash
# First run: Creates file with 50 videos
node examples/batch-process.js batch1.txt --full

# Second run (same day): Adds 50 more videos to same file
node examples/batch-process.js batch2.txt --full

# Result: One file with 100 videos (transcriptions-notion_2025-11-08.csv)
```

## Error Handling

### Automatic Recovery

The batch processor:
- ✅ Continues on errors (doesn't stop entire batch)
- ✅ Logs failed URLs
- ✅ Shows summary at end

### Example Output

```
============================================================
BATCH PROCESSING COMPLETE
============================================================
Total: 100
Successful: 95
Failed: 5

Failed URLs:
  https://www.instagram.com/p/ABC123
    Error: Video not available
  https://www.instagram.com/reel/DEF456
    Error: Download failed
============================================================
```

### Retry Failed Videos

```bash
# 1. Review failed URLs in log
# 2. Create retry.txt with only failed URLs
# 3. Process again
node examples/batch-process.js retry.txt --notion --delay 15000
```

## Complete Workflows

### Workflow 1: Competitor Analysis

```bash
# 1. Extract URLs from competitor account
# (Use browser console method)

# 2. Save to competitor-urls.txt

# 3. Batch process with full AI analysis
node examples/batch-process.js competitor-urls.txt --full --delay 15000

# 4. Import transcriptions-notion_2025-11-08.csv to Notion
# 5. Review transcriptions-summary_2025-11-08.md for quick insights
# 6. Analyze topics, keywords, content patterns
```

### Workflow 2: Content Archive

```bash
# 1. Extract all your own videos
# (Use browser console or manual list)

# 2. Save to my-content.txt

# 3. Process with timestamps for editing
node examples/batch-process.js my-content.txt --delay 5000

# 4. Use transcriptions_2025-11-08.csv for video editing
```

### Workflow 3: Research Database

```bash
# 1. Collect videos from multiple accounts
# researcher1-urls.txt
# researcher2-urls.txt
# researcher3-urls.txt

# 2. Merge into master list
cat *-urls.txt > all-research.txt

# 3. Process all with full AI analysis
node examples/batch-process.js all-research.txt --full --delay 20000

# 4. Import transcriptions-notion_2025-11-08.csv to Notion research database
```

## Advanced Tips

### Split Large Batches

For 500+ videos, split into smaller batches:

```bash
# Split urls.txt into chunks of 100
split -l 100 urls.txt batch-

# Process each batch separately
for batch in batch-*; do
  echo "Processing $batch..."
  node examples/batch-process.js "$batch" --full --delay 20000
  sleep 300  # 5 min pause between batches
done
```

### Monitor Progress

```bash
# Run in background and monitor
node examples/batch-process.js urls.txt --notion --delay 12000 > batch.log 2>&1 &

# Check progress
tail -f batch.log

# Count completed
grep "✓ Success" batch.log | wc -l
```

### Pause and Resume

```bash
# If you need to stop (Ctrl+C)

# 1. Check which videos completed
grep "✓ Success" logs/batch.log

# 2. Remove completed URLs from urls.txt

# 3. Resume processing remaining URLs
node examples/batch-process.js urls.txt --notion --delay 12000
```

## Troubleshooting

### "Rate limit exceeded"

```bash
# Increase delays
node examples/batch-process.js urls.txt --delay 30000

# Or split into smaller batches with pauses
```

### "Video not available"

Some videos may be:
- Deleted
- Made private
- Region-blocked

**Solution**: Review failed URLs, remove unavailable ones, retry

### "Out of memory"

For very large batches (500+):

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" node examples/batch-process.js urls.txt
```

## Next Steps

- [Notion Integration](notion.md) - Import batch results to Notion
- [Troubleshooting](troubleshooting.md) - Solve common issues
- [Usage Guide](usage.md) - Single video options
