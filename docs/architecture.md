# Architecture Documentation

Technical overview of ig-transcribe system architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     ig-transcribe                        │
│                                                          │
│  Instagram URL → Download → Extract → Transcribe → AI   │
│                     ↓          ↓          ↓        ↓     │
│                   Video     Audio     Text    Analysis   │
│                                                    ↓     │
│                                              CSV Export  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Single Video Processing

```
1. URL Validation
   ├─ Extract video ID
   └─ Validate format

2. Video Download (yt-dlp)
   ├─ downloads/videos/{video_id}.mp4
   └─ Fallback: Puppeteer scraper (removed)

3. Audio Extraction (FFmpeg)
   ├─ Input: downloads/videos/{video_id}.mp4
   ├─ Output: downloads/audio/{video_id}.wav
   └─ Format: 16kHz, mono, WAV

4. Transcription (Whisper)
   ├─ Method 1: Whisper CLI (best)
   ├─ Method 2: Ollama Whisper + chunking
   └─ Output: { text, segments: [{ start, end, text }] }

5. AI Processing (Ollama) [optional]
   ├─ Summary generation
   ├─ Topic extraction
   └─ Hashtag generation

6. Export
   ├─ Standard CSV: One row per segment
   └─ Notion CSV: One row per video
```

### Batch Processing

```
1. Load URLs from file
   └─ Filter comments and blank lines

2. For each URL:
   ├─ Process video (same as single)
   ├─ Log result (success/failure)
   ├─ Append to CSV
   └─ Wait (configurable delay)

3. Summary Report
   ├─ Total processed
   ├─ Successful count
   └─ Failed URLs with errors
```

## Module Structure

### Core Modules

```
src/
├── scraper/
│   └── yt-dlp.js           # Video download
├── audio/
│   └── extractor.js        # Audio extraction
├── transcribe/
│   ├── index.js            # Main transcription logic
│   └── whisper.js          # Whisper implementations
├── ai/
│   └── ollama.js           # AI processing
├── output/
│   └── csv-writer.js       # CSV/JSON export
├── utils/
│   ├── helpers.js          # Utilities
│   └── logger.js           # Logging
└── config.js               # Configuration
```

### Module Dependencies

```
index.js
  ├── config.js
  ├── scraper/yt-dlp.js
  │   └── utils/helpers.js
  ├── audio/extractor.js
  │   └── config.js
  ├── transcribe/index.js
  │   ├── transcribe/whisper.js
  │   └── utils/logger.js
  ├── ai/ollama.js
  │   └── axios
  └── output/csv-writer.js
      └── csv-writer (npm)
```

## Component Details

### 1. Video Downloader (yt-dlp)

**File:** `src/scraper/yt-dlp.js`

**Purpose:** Download Instagram videos

**Process:**
```javascript
1. Validate URL
2. Extract video ID
3. Execute yt-dlp command:
   yt-dlp "{url}" -o "{outputPath}" --format best
4. Return video path
```

**Error Handling:**
- yt-dlp not installed → Error with install instructions
- Video unavailable → Specific error message
- Download timeout → Retry logic

### 2. Audio Extractor (FFmpeg)

**File:** `src/audio/extractor.js`

**Purpose:** Extract audio from video

**Process:**
```javascript
1. Check video file exists
2. Execute FFmpeg:
   ffmpeg -i "{videoPath}"
          -vn                 # No video
          -ar 16000          # 16kHz sample rate
          -ac 1              # Mono
          -acodec pcm_s16le  # WAV codec
          -y                 # Overwrite
          "{audioPath}"
3. Get metadata (duration, channels)
4. Return audio path + metadata
```

**Audio Specs:**
- Format: WAV
- Sample Rate: 16000 Hz (optimal for Whisper)
- Channels: 1 (mono)
- Codec: PCM 16-bit

### 3. Transcription Engine

**File:** `src/transcribe/index.js`

**Purpose:** Coordinate transcription methods

**Strategy Selection:**
```
Auto Mode:
  1. Try Whisper CLI
     └─ Success: Return with timestamps
     └─ Fail: Continue

  2. Try Ollama Whisper + chunking
     └─ Success: Return with chunked timestamps
     └─ Fail: Error
```

#### Whisper CLI Method

**File:** `src/transcribe/whisper.js` → `transcribeWithWhisperCLI()`

**Process:**
```javascript
1. Execute:
   whisper "{audioPath}"
           --model tiny
           --output_format json
           --output_dir /tmp

2. Read JSON output:
   /tmp/{basename}.json

3. Parse segments:
   {
     text: "full transcript",
     segments: [
       { start: 0.0, end: 5.36, text: "..." },
       ...
     ]
   }

4. Return structured data
```

**Models Available:**
- tiny: Fastest, lower accuracy
- base: Balanced
- small: Better accuracy
- medium: High accuracy
- large: Best accuracy (slow)

#### Ollama Whisper Method

**File:** `src/transcribe/whisper.js` → `transcribeWithChunking()`

**Process:**
```javascript
1. Get audio duration (FFprobe)
2. Calculate chunks (30s each)
3. For each chunk:
   a. Extract chunk with FFmpeg
   b. Transcribe with Ollama
   c. Record: { start, end, text }
   d. Clean up chunk file
4. Combine all segments
5. Return structured data
```

### 4. AI Processing (Ollama)

**File:** `src/ai/ollama.js`

**Purpose:** Generate summaries, topics, hashtags

**Process:**
```javascript
1. Check Ollama connection
2. For each AI task:
   a. Build prompt
   b. POST to Ollama API:
      {
        model: "gemma3:4b",
        prompt: "...",
        stream: false
      }
   c. Parse response
3. Return AI results
```

**AI Functions:**
- `summarizeTranscription()` - Concise summary
- `extractKeyTopics()` - List of topics
- `generateHashtags()` - Relevant hashtags

### 5. CSV Writer

**File:** `src/output/csv-writer.js`

**Purpose:** Export to CSV/JSON

#### Standard CSV Format

```javascript
writeTranscriptionToCSV() {
  For each segment:
    {
      instagram_url,
      start_time: "HH:MM:SS.mmm",
      end_time: "HH:MM:SS.mmm",
      start_seconds,
      end_seconds,
      text_segment
    }
}
```

#### Notion CSV Format

```javascript
writeNotionCSV() {
  // Single record per video
  {
    video_url,
    ai_summary,
    full_transcript,
    timestamped_transcript: "MM:SS - text | MM:SS - text",
    duration_seconds,
    segments_count,
    topics: "topic1, topic2",
    hashtags: "#hash1, #hash2",
    date_processed: "MM/DD/YYYY"
  }
}
```

**Timestamp Format:**
```javascript
formatTimestamp(seconds) {
  // Converts: 65.5 → "00:01:05.500"
  hours = floor(seconds / 3600)
  minutes = floor((seconds % 3600) / 60)
  secs = floor(seconds % 60)
  ms = floor((seconds % 1) * 1000)

  return `${hours}:${minutes}:${secs}.${ms}`
}

// For Notion transcript:
// Remove leading "00:" if hours = 0
// Result: "01:05.500 - text"
```

## Configuration System

**File:** `src/config.js`

**Environment Variables:**

```javascript
{
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3',
    whisperModel: process.env.OLLAMA_WHISPER_MODEL || 'dimavz/whisper-tiny:latest'
  },

  ffmpeg: {
    sampleRate: 16000,
    channels: 1,
    audioFormat: 'wav'
  },

  output: {
    csvPath: process.env.CSV_PATH || './output/transcriptions.csv',
    jsonPath: process.env.JSON_PATH || './output/transcriptions.json'
  },

  downloads: {
    videosDir: './downloads/videos',
    audioDir: './downloads/audio'
  }
}
```

## Error Handling

### Error Hierarchy

```
1. ValidationError
   └─ Invalid URLs, missing parameters

2. DownloadError
   └─ yt-dlp failures, network issues

3. ProcessingError
   └─ FFmpeg, Whisper failures

4. AIError
   └─ Ollama connection, model errors

5. OutputError
   └─ File write permissions, disk space
```

### Error Recovery

```javascript
try {
  // Try primary method
  return await transcribeWithWhisperCLI(audioPath);
} catch (error) {
  logger.warn('Whisper CLI failed, trying fallback...');

  try {
    // Try fallback method
    return await transcribeWithChunking(audioPath);
  } catch (fallbackError) {
    // Log and throw
    logger.error('All transcription methods failed');
    throw new Error('Transcription failed');
  }
}
```

## Performance Considerations

### Bottlenecks

1. **Download Speed** (2-5s)
   - Depends on: Network, video size
   - Optimization: None (external service)

2. **Audio Extraction** (< 1s)
   - Depends on: Video duration, CPU
   - Optimization: Already optimized

3. **Transcription** (15-60s)
   - Depends on: Audio duration, model size, CPU
   - Optimization: Use smaller model (tiny vs base)

4. **AI Processing** (5-30s)
   - Depends on: Text length, model size, GPU/CPU
   - Optimization: Use smaller model, batch requests

### Memory Usage

```
Download:  ~50MB per video
Audio:     ~15MB per minute (16kHz mono WAV)
Whisper:   ~1GB (model in RAM)
Ollama:    4-16GB (depends on model)
Total:     6-20GB recommended
```

### Disk Usage

```
Videos:    ~5-50MB per video
Audio:     ~1MB per minute
Output:    ~1KB per video (CSV)
Temp:      Auto-cleaned
```

## Scalability

### Single Instance Limits

- **Sequential Processing**: One video at a time
- **Rate Limits**: Instagram ~100-200 videos/hour
- **Disk I/O**: Limited by SSD/HDD speed

### Scaling Strategies

**Horizontal Scaling:**
```bash
# Split URLs across machines
split -l 100 urls.txt batch-

# Machine 1
node examples/batch-process.js batch-aa --delay 15000

# Machine 2
node examples/batch-process.js batch-ab --delay 15000
```

**Parallel Processing (Same Machine):**
```bash
# Process different batches in parallel
node examples/batch-process.js batch1.txt --delay 12000 &
node examples/batch-process.js batch2.txt --delay 12000 &
```

**Limitations:**
- Ollama can only run one model at a time
- Whisper CLI is CPU-bound
- Instagram rate limits apply per IP

## Security Considerations

### API Keys

- ✅ No API keys required (all local)
- ✅ Ollama runs locally
- ✅ Whisper runs locally

### Instagram Access

- ⚠️ Uses yt-dlp (respect Instagram ToS)
- ⚠️ Account scraping may trigger rate limits
- ✅ No password storage

### Data Privacy

- ✅ All processing is local
- ✅ No data sent to external services
- ✅ Videos/audio can be deleted after processing

## Testing

### Manual Testing

```bash
# Test single video
node index.js "https://www.instagram.com/p/test/"

# Test with all features
node index.js "URL" --notion --ai --summarize --topics

# Test batch (small)
echo "https://instagram.com/p/test/" > test.txt
node examples/batch-process.js test.txt
```

### Component Testing

```bash
# Test Whisper
whisper test.wav --model tiny --output_format json

# Test Ollama
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"gemma3:4b","prompt":"Test"}'

# Test FFmpeg
ffmpeg -i test.mp4 -vn -ar 16000 -ac 1 test.wav
```

## Future Improvements

### Planned Features

1. **Direct file input**: Process local video files
2. **GPU acceleration**: Faster Whisper transcription
3. **Custom prompts**: User-defined AI prompts
4. **API server**: REST API for integrations
5. **Web UI**: Browser-based interface

### Architecture Changes

1. **Queue System**: Redis-based job queue
2. **Database**: Store results in SQLite/PostgreSQL
3. **Caching**: Cache transcriptions by video ID
4. **Streaming**: Real-time transcription updates

## Related Documentation

- [Installation Guide](installation.md)
- [Usage Guide](usage.md)
- [Troubleshooting](troubleshooting.md)
