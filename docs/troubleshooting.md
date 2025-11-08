# Troubleshooting Guide

Common issues and solutions for ig-transcribe.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Download Issues](#download-issues)
- [Transcription Issues](#transcription-issues)
- [AI Processing Issues](#ai-processing-issues)
- [Batch Processing Issues](#batch-processing-issues)
- [Output Issues](#output-issues)

## Installation Issues

### yt-dlp not found

**Error:**
```
Error: yt-dlp is required. Install with: brew install yt-dlp
```

**Solution:**

```bash
# macOS
brew install yt-dlp

# Linux
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Verify
yt-dlp --version
```

### Whisper not installed

**Error:**
```
ERROR: Whisper CLI not found. Install with: pip install openai-whisper
```

**Solution:**

```bash
# Install with pip3
pip3 install openai-whisper

# Or specific Python version
python3 -m pip install openai-whisper

# macOS with Homebrew Python
/opt/homebrew/bin/pip3 install openai-whisper

# Verify
whisper --help
```

### FFmpeg not found

**Error:**
```
Error: ffmpeg is required for audio extraction
```

**Solution:**

```bash
# macOS
brew install ffmpeg

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

### Ollama connection refused

**Error:**
```
ERROR: Cannot connect to Ollama at http://localhost:11434
```

**Solution:**

```bash
# Start Ollama server
ollama serve

# In another terminal, verify
curl http://localhost:11434/api/tags

# Check if model is installed
ollama list

# Pull model if needed
ollama pull gemma3:4b
```

## Download Issues

### Invalid Instagram URL

**Error:**
```
Error: Invalid Instagram URL: https://www.instagram.com/username/reel/ABC123/
```

**Solution:**

This has been fixed in the latest version. Update your code:

```bash
git pull origin main
npm install
```

Or check URL format:
```bash
# Supported formats:
https://www.instagram.com/p/ABC123/
https://www.instagram.com/reel/ABC123/
https://www.instagram.com/username/reel/ABC123/
https://www.instagram.com/username/p/ABC123/
```

### Instagram download fails

**Error:**
```
WARNING: The program functionality for this site has been marked as broken
ERROR: Unable to extract data
```

**Solution:**

```bash
# 1. Update yt-dlp (most common fix)
brew upgrade yt-dlp  # macOS
sudo yt-dlp -U       # Linux

# 2. Try with cookies (for private/age-restricted content)
# Currently not supported in CLI - workaround:
# Download video manually, then process local file

# 3. Check if video is available
# Open URL in browser to verify it exists
```

### Video is private/unavailable

**Error:**
```
Error: Video not available
```

**Reasons:**
- Video was deleted
- Account is private
- Age-restricted content
- Region-blocked

**Solution:**

```bash
# For private accounts:
# 1. Use browser to log in
# 2. Download video manually
# 3. Process local file (feature coming soon)

# For batch processing:
# Remove unavailable URLs from urls.txt
```

### yt-dlp timeout

**Error:**
```
Error: Command failed: yt-dlp ... (timeout)
```

**Solution:**

```bash
# Increase timeout in src/scraper/yt-dlp.js
# Or check internet connection
ping instagram.com

# Try again with slower connection
node index.js "URL" --delay 5000
```

## Transcription Issues

### Whisper not producing JSON

**Error:**
```
ERROR: Whisper did not produce JSON output
```

**Solution:**

```bash
# 1. Check Whisper version
whisper --version

# 2. Reinstall Whisper
pip3 install --force-reinstall openai-whisper

# 3. Try with smaller model
whisper audio.wav --model tiny --output_format json

# 4. Check /tmp for output files
ls -la /tmp/*.json
```

### Audio extraction fails

**Error:**
```
Error: moov atom not found
```

**Cause:** Corrupted or incomplete video file

**Solution:**

```bash
# 1. Re-download video
rm downloads/videos/ABC123.mp4
node index.js "URL"

# 2. Check video file
ffmpeg -i downloads/videos/ABC123.mp4

# 3. Try different download method
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" "URL"
```

### Transcription returns empty text

**Error:**
```
Warning: Transcription text is empty
```

**Causes:**
- No audio in video
- Audio quality too poor
- Wrong audio format

**Solution:**

```bash
# 1. Check audio file
ffprobe downloads/audio/ABC123.wav

# 2. Play audio to verify content
afplay downloads/audio/ABC123.wav  # macOS
aplay downloads/audio/ABC123.wav   # Linux

# 3. Try with different model
node index.js "URL" --method whisper-cli

# 4. Increase audio quality
# Edit src/audio/extractor.js:
# Change sampleRate from 16000 to 44100
```

### Transcription accuracy issues

**Problem:** Transcription has many errors

**Solutions:**

```bash
# 1. Use larger Whisper model (slower but more accurate)
# Edit src/transcribe/whisper.js
# Change: --model tiny
# To: --model base  (or small, medium, large)

# 2. Improve audio quality
# Edit src/audio/extractor.js
# Increase sample rate to 44100

# 3. Try different method
node index.js "URL" --method auto
```

## AI Processing Issues

### Ollama model not found

**Error:**
```
ERROR: Model 'gemma3:4b' not found
```

**Solution:**

```bash
# List installed models
ollama list

# Pull the model
ollama pull gemma3:4b

# Verify
ollama list | grep gemma3
```

### AI generation fails

**Error:**
```
ERROR: Ollama transcription failed: Request failed with status code 500
```

**Solution:**

```bash
# 1. Restart Ollama
pkill ollama
ollama serve

# 2. Check model integrity
ollama pull gemma3:4b --force

# 3. Try different model
node index.js "URL" --ai --summarize --model llama3

# 4. Check system resources
# Ollama needs 8GB+ RAM for most models
htop  # Check available memory
```

### Out of memory (Ollama)

**Error:**
```
Error: Ollama failed to load model
```

**Solution:**

```bash
# 1. Use smaller model
ollama pull gemma3:4b  # 4GB instead of 7GB

# 2. Close other applications

# 3. Set Ollama memory limit
# Edit ~/.ollama/config.json:
{
  "memory_limit": "8GB"
}
```

## Batch Processing Issues

### Batch stops after errors

**Problem:** Batch processing stops when one video fails

**Expected Behavior:** Should continue with next video

**Solution:**

Check if you're on latest version:
```bash
git pull origin main
```

The batch processor should show:
```
✗ Failed: <error message>
Waiting Xs before next video...
[2/100] Processing: <next URL>
```

### Rate limit exceeded

**Error:**
```
ERROR: Instagram rate limit exceeded
```

**Solution:**

```bash
# 1. Increase delays between videos
node examples/batch-process.js urls.txt --delay 30000  # 30 seconds

# 2. Pause processing
# Ctrl+C to stop
# Wait 1-2 hours
# Resume with remaining URLs

# 3. Split into smaller batches
split -l 50 urls.txt batch-
# Process each batch with delays
```

### Batch progress lost

**Problem:** Need to track which videos were processed

**Solution:**

```bash
# 1. Check logs
cat logs/latest.log | grep "✓ Success"

# 2. Save progress to file
node examples/batch-process.js urls.txt --notion 2>&1 | tee batch-progress.log

# 3. Extract completed URLs
grep "Processing:" batch-progress.log | grep -A 1 "✓ Success"

# 4. Remove completed URLs from urls.txt and restart
```

## Output Issues

### CSV not created

**Error:**
```
Output file not found: output/transcriptions-notion.csv
```

**Solution:**

```bash
# 1. Check if directory exists
ls -la output/

# 2. Create directory
mkdir -p output

# 3. Check permissions
chmod 755 output/

# 4. Try with explicit path
node index.js "URL" --notion
ls -la output/transcriptions-notion.csv
```

### Notion CSV import fails

**Problem:** Notion rejects CSV import

**Causes:**
- Encoding issues
- Special characters
- Commas in content

**Solution:**

```bash
# 1. Check file encoding
file output/transcriptions-notion.csv
# Should be: UTF-8 Unicode text

# 2. Convert if needed
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv

# 3. Open in Excel/Numbers first
# Save as CSV (UTF-8)
# Then import to Notion

# 4. Remove problematic characters
sed -i '' 's/[^[:print:]\t]//g' output/transcriptions-notion.csv
```

### Timestamps incorrect

**Problem:** Timestamps don't match video

**Causes:**
- Wrong transcription method
- Audio extraction issue

**Solution:**

```bash
# 1. Use Whisper CLI for best timestamps
node index.js "URL" --method whisper-cli

# 2. Check audio duration
ffprobe downloads/audio/ABC123.wav

# 3. Compare with video duration
ffprobe downloads/videos/ABC123.mp4

# 4. Re-extract audio
rm downloads/audio/ABC123.wav
node index.js "URL"
```

## Account Scraping Issues

### yt-dlp account scraper broken

**Error:**
```
ERROR: [instagram:user] Unable to extract data
WARNING: The program functionality for this site has been marked as broken
```

**Cause:** Instagram changed their API, yt-dlp user extractor doesn't work

**Solution:**

Use browser console method (fastest):

1. Open profile: `https://www.instagram.com/username/`
2. Open DevTools (F12)
3. Run auto-scroll script (see [batch-processing.md](batch-processing.md))
4. Paste URLs into urls.txt

### Browser console warning

**Warning:**
```
Stop! This is a browser feature intended for developers...
```

**This is normal Instagram security**

The code I provided is safe and read-only. Just type `allow pasting` and continue.

## Performance Issues

### Processing very slow

**Problem:** Each video takes 3+ minutes

**Solutions:**

```bash
# 1. Use faster Whisper model
# Edit src/transcribe/whisper.js: --model tiny

# 2. Skip AI processing for speed
node index.js "URL"  # No --ai flag

# 3. Process in parallel (advanced)
# Split urls.txt into chunks
# Run multiple instances:
node examples/batch-process.js batch1.txt --delay 10000 &
node examples/batch-process.js batch2.txt --delay 10000 &
```

### Disk space issues

**Error:**
```
ENOSPC: no space left on device
```

**Solution:**

```bash
# 1. Check disk space
df -h

# 2. Clean up downloads
rm downloads/videos/*.mp4
rm downloads/audio/*.wav

# 3. Keep only CSV output
# Add to index.js to auto-delete after processing

# 4. Use external drive
# Edit .env:
DOWNLOADS_DIR=/Volumes/External/ig_transcribe
```

## Still Having Issues?

### Debug Mode

```bash
# Run with verbose logging
LOG_LEVEL=debug node index.js "URL"

# Check log files
tail -f logs/latest.log
```

### Get Help

1. **Check documentation**: [docs/](.)
2. **Search issues**: [GitHub Issues](https://github.com/yourusername/ig-transcribe/issues)
3. **Create issue**: Include error logs and system info
4. **Discord/Discussions**: [Community](https://github.com/yourusername/ig-transcribe/discussions)

### System Information

When reporting issues, include:

```bash
# System info
uname -a
node --version
npm --version
yt-dlp --version
ffmpeg -version
whisper --version
ollama --version

# Error logs
cat logs/latest.log
```
