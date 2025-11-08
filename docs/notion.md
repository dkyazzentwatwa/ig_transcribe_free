# Notion Integration Guide

This guide shows you how to extract Instagram videos and import them into Notion.

## Quick Start

### 1. Scrape All Videos from an Instagram Account

```bash
# Extract all video URLs from a public account
npm run scrape-account username

# For private accounts or better reliability, use browser cookies
npm run scrape-account username -- --browser chrome

# Limit to first 50 videos
npm run scrape-account username -- --max 50
```

This creates a `urls.txt` file with all video URLs.

### 2. Batch Process Videos with Notion Format

```bash
# Process all videos with AI analysis and Notion-friendly CSV export
node examples/batch-process.js urls.txt --notion --ai --summarize --topics --model gemma3:4b

# With custom delay between downloads (10 seconds)
node examples/batch-process.js urls.txt --notion --ai --summarize --topics --delay 10000
```

### 3. Import into Notion

1. Open the generated file: `output/transcriptions-notion.csv`
2. In Notion, create a new database or open an existing one
3. Click the `⋮` menu → Import → CSV
4. Select `transcriptions-notion.csv`
5. Notion will automatically create properties for each column

## Notion CSV Format

The `--notion` flag creates a CSV with **one row per video** (instead of one row per segment):

| Column | Type | Description |
|--------|------|-------------|
| Video URL | URL | Instagram video link (set as URL property in Notion) |
| Full Transcript | Text | Complete video transcription |
| Duration (seconds) | Number | Video length in seconds |
| Segments | Number | Number of transcript segments |
| AI Summary | Text | AI-generated summary (if --summarize used) |
| Topics | Text | Key topics (if --topics used) |
| Hashtags | Text | Generated hashtags (if --hashtags used) |
| Date Processed | Date | When the video was processed (MM/DD/YYYY format) |

## Notion Database Setup

After importing, configure your Notion database properties:

1. **Video URL** → Change to "URL" property type
2. **Date Processed** → Change to "Date" property type
3. **Duration (seconds)** → Change to "Number" property type
4. **Topics** → Optional: Convert to "Multi-select" by splitting on commas
5. **Hashtags** → Optional: Convert to "Multi-select" by splitting on commas

## Example Workflow

Complete workflow from Instagram account to Notion database:

```bash
# Step 1: Extract video URLs from account
npm run scrape-account tech_creator -- --browser chrome --max 100

# Step 2: Batch process with AI (recommended: 10-15s delays)
node examples/batch-process.js urls.txt \
  --notion \
  --ai \
  --summarize \
  --topics \
  --hashtags \
  --model gemma3:4b \
  --delay 12000

# Step 3: Import output/transcriptions-notion.csv into Notion
```

## Single Video Export

To export a single video in Notion format:

```bash
node index.js "https://instagram.com/p/ABC123" \
  --notion \
  --ai \
  --summarize \
  --topics \
  --hashtags \
  --model gemma3:4b
```

## Tips

### Authentication for Private Accounts

Use browser cookies for accessing private accounts or improving reliability:

```bash
# Chrome
npm run scrape-account username -- --browser chrome

# Firefox
npm run scrape-account username -- --browser firefox

# Safari
npm run scrape-account username -- --browser safari
```

### Rate Limiting

To avoid Instagram rate limits:

- **Default**: 5-10 second random delays (automatic)
- **Safe**: 10-15 seconds (`--delay 12000`)
- **Very Safe**: 20-30 seconds (`--delay 25000`)

### Batch Processing Tips

1. **Review urls.txt** before processing to remove unwanted videos
2. **Start small** - Test with first 10 videos: `--max 10`
3. **Monitor progress** - Logs show which video is currently processing
4. **Resume on failure** - Failed URLs are logged, remove successful ones from urls.txt and retry

## Troubleshooting

### Account Scraping Issues

**"Unable to extract data"**
- Account may be private → Use `--browser` option
- Update yt-dlp: `brew upgrade yt-dlp`
- Try a different browser: `--browser firefox` instead of chrome

**"No video URLs found"**
- Account may only have photos (no videos/reels)
- Account may be completely private (even with cookies)
- Check if username is spelled correctly

### Notion Import Issues

**Dates not importing correctly**
- Dates are in MM/DD/YYYY format (Notion standard)
- Manually change property type to "Date" after import

**Multi-select not working for Topics/Hashtags**
- Import as text first
- After import, Notion can convert text to multi-select
- Topics/Hashtags are comma-separated

## Comparison: Default vs Notion Format

### Default Format (Segments)
```csv
Instagram URL,Start Time,End Time,Text Segment
https://instagram.com/p/ABC,00:00:00,00:00:05,First segment
https://instagram.com/p/ABC,00:00:05,00:00:10,Second segment
... (16 rows for one 96-second video)
```
**Use when**: You need precise timestamps for video editing, captions, or analysis

### Notion Format (Videos)
```csv
Video URL,Full Transcript,Duration,AI Summary,Topics,Hashtags,Date Processed
https://instagram.com/p/ABC,"First segment Second segment...",96,"Summary...",topic1,#hash1,10/04/2025
```
**Use when**: You want a Notion database of videos with transcripts and AI insights

Both formats are generated simultaneously - just use `--notion` flag for the Notion version!
