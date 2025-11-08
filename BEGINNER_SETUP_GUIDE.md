# Complete Beginner's Guide to Instagram Video Transcription

Welcome! This guide will walk you through installing and using this tool to transcribe Instagram videos. No prior coding experience needed - just follow along step by step.

## What Does This Tool Do?

This tool helps you:
- Download Instagram videos
- Transcribe them (convert speech to text)
- Get AI summaries and topic analysis
- Export everything to a spreadsheet for Notion or Excel

Think of it like having a personal assistant that watches Instagram videos and writes down everything said, plus gives you a summary!

---

## Part 1: Installing Everything You Need

We need to install 6 things. Don't worry - we'll go through each one!

### 1. Install Node.js (The Engine)

**What is it?** Node.js is like the engine that makes this tool run.

**How to install:**

**For Mac:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" version (the green button)
3. Open the downloaded file and follow the installer
4. When done, open Terminal (search for "Terminal" in Spotlight)
5. Type `node --version` and press Enter
6. You should see something like `v18.17.0` or higher

**For Windows:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" version (the green button)
3. Run the installer and click "Next" through everything
4. Open Command Prompt (search for "cmd" in Start menu)
5. Type `node --version` and press Enter
6. You should see a version number

### 2. Install yt-dlp (The Video Downloader)

**What is it?** This downloads Instagram videos. Think of it as a specialized Instagram video saver.

**For Mac:**
```bash
# First, install Homebrew if you don't have it (it's like an app store for developer tools)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install yt-dlp
brew install yt-dlp
```

**For Windows:**
1. Download from [github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases)
2. Scroll down to "Assets" and download `yt-dlp.exe`
3. Move it to `C:\Windows\System32\` (you might need admin permission)

### 3. Install FFmpeg (The Audio Processor)

**What is it?** This extracts audio from videos so we can transcribe it.

**For Mac:**
```bash
brew install ffmpeg
```

**For Windows:**
1. Go to [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Click "Windows" and download from one of the builds
3. Extract the zip file
4. Add to PATH (search online for "add ffmpeg to PATH Windows" for detailed steps)

**Easier Windows option:** Use [Chocolatey](https://chocolatey.org/) package manager:
```bash
choco install ffmpeg
```

### 4. Install Python and Whisper (The Transcriber)

**What is it?** Whisper is OpenAI's speech-to-text AI. It's what actually "listens" to the audio and writes it down.

**For Mac:**
```bash
# Install Python (usually already installed on Mac)
brew install python3

# Install Whisper
pip3 install openai-whisper
```

**For Windows:**
1. Download Python from [python.org/downloads](https://python.org/downloads/)
2. Run installer - **IMPORTANT: Check "Add Python to PATH"**
3. Open Command Prompt and run:
```bash
pip install openai-whisper
```

### 5. Install Ollama (The AI Brain) - **IMPORTANT SECTION!**

**What is it?** Ollama is like having ChatGPT running on your own computer. It creates summaries, extracts topics, and analyzes the transcripts. It works completely offline and is FREE!

**Why might this be tricky?** Ollama is newer software, so the setup has an extra step or two. Don't worry - we'll get through it!

#### Step-by-Step Ollama Installation:

**For Mac:**

1. **Download Ollama:**
   - Go to [ollama.ai](https://ollama.ai/)
   - Click "Download for macOS"
   - Open the downloaded file and drag Ollama to Applications

2. **Start Ollama:**
   - Open Terminal
   - Type: `ollama serve`
   - You should see: `Ollama is running on http://localhost:11434`
   - **Keep this Terminal window open!** Ollama needs to stay running.

3. **Download the AI Model:**
   - Open a NEW Terminal window (Command + N)
   - Type: `ollama pull gemma3:4b`
   - This downloads the AI model (about 2GB - takes a few minutes)
   - When done, you'll see: `success`

**For Windows:**

1. **Download Ollama:**
   - Go to [ollama.ai/download](https://ollama.ai/download)
   - Click "Download for Windows"
   - Run the installer

2. **Start Ollama:**
   - Open Command Prompt
   - Type: `ollama serve`
   - You should see it's running on `http://localhost:11434`
   - **Keep this window open!**

3. **Download the AI Model:**
   - Open a NEW Command Prompt window
   - Type: `ollama pull gemma3:4b`
   - Wait for the download to complete

**For Linux:**
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# In a new terminal, pull the model
ollama pull gemma3:4b
```

#### Ollama Troubleshooting:

**"Connection refused" error:**
- Make sure `ollama serve` is running in another window
- Try opening: [http://localhost:11434](http://localhost:11434) in your browser
- You should see "Ollama is running"

**"Model not found" error:**
- Make sure you ran `ollama pull gemma3:4b`
- Check available models: `ollama list`

**Ollama won't start:**
- Restart your computer
- Try running as administrator (Windows) or with sudo (Mac/Linux)

### 6. Download This Project

Now let's get the actual transcription tool!

1. **Download the code:**
   ```bash
   # If you have git installed:
   git clone https://github.com/yourusername/ig-transcribe.git
   cd ig-transcribe

   # Or download the ZIP file from GitHub and extract it
   ```

2. **Install the project:**
   ```bash
   # This installs all the JavaScript packages needed
   npm install

   # This creates the folders and configuration file
   npm run setup
   ```

---

## Part 2: Your First Transcription

Let's transcribe an Instagram video!

### Step 1: Make Sure Ollama is Running

**IMPORTANT:** Before transcribing, make sure Ollama is running!

```bash
# In a Terminal/Command Prompt window, run:
ollama serve
```

Keep this window open. You should see "Ollama is running".

### Step 2: Find an Instagram Video

1. Go to Instagram
2. Find a video/reel you want to transcribe
3. Click "Share" → "Copy Link"
4. The link looks like: `https://www.instagram.com/p/ABC123/`

### Step 3: Run the Transcription

Open a NEW Terminal/Command Prompt (keep the Ollama one open) and run:

```bash
# Navigate to the project folder
cd ig-transcribe

# Basic transcription (no AI)
node index.js "YOUR_INSTAGRAM_LINK_HERE"

# With AI summaries and topics (recommended!)
node index.js "YOUR_INSTAGRAM_LINK_HERE" --notion --ai --summarize --topics --model gemma3:4b
```

**Example:**
```bash
node index.js "https://www.instagram.com/p/DPQLZE_jl-f/" --notion --ai --summarize --topics --model gemma3:4b
```

### Step 4: Watch the Magic Happen

You'll see progress messages:
```
✓ Downloading video...
✓ Extracting audio...
✓ Transcribing with Whisper...
✓ Generating AI summary...
✓ Extracting topics...
✓ Saved to: output/transcriptions-notion.csv
```

This takes 1-3 minutes depending on video length.

### Step 5: See Your Results

The transcription is saved in the `output` folder:

**For Notion users:**
- Open `output/transcriptions-notion.csv`
- Import this into Notion as a database

**For everyone else:**
- Open `output/transcriptions.csv` in Excel or Google Sheets
- You'll see the full transcript with timestamps

---

## Part 3: Processing Multiple Videos

Want to transcribe many videos at once?

### Step 1: Create a List of URLs

1. Create a file called `my-videos.txt`
2. Put one Instagram URL per line:
   ```
   https://www.instagram.com/p/ABC123/
   https://www.instagram.com/reel/XYZ789/
   https://www.instagram.com/p/DEF456/
   ```

### Step 2: Run Batch Processing

```bash
node examples/batch-process.js my-videos.txt --notion --ai --summarize --topics --delay 12000
```

The `--delay 12000` adds a 12-second pause between videos (to avoid Instagram rate limits).

---

## Understanding the Options

When you run the tool, you can add these options:

| Option | What it does |
|--------|-------------|
| `--ai` | Use AI analysis (requires Ollama) |
| `--summarize` | Create a summary of the video |
| `--topics` | Extract main topics discussed |
| `--hashtags` | Generate relevant hashtags |
| `--notion` | Export in Notion-friendly format |
| `--model gemma3:4b` | Which AI model to use |
| `--delay 12000` | Wait 12 seconds between videos (batch only) |

**Example combinations:**

```bash
# Just transcribe, no AI
node index.js "URL"

# Transcribe + AI summary
node index.js "URL" --ai --summarize --model gemma3:4b

# Everything for Notion
node index.js "URL" --notion --ai --summarize --topics --hashtags --model gemma3:4b
```

---

## Common Problems & Solutions

### Problem: "yt-dlp not found"

**Solution:**
```bash
# Mac
brew install yt-dlp

# Windows
# Download from: github.com/yt-dlp/yt-dlp/releases
```

### Problem: "Whisper not found"

**Solution:**
```bash
pip3 install openai-whisper

# If that doesn't work:
python3 -m pip install openai-whisper
```

### Problem: "Cannot connect to Ollama"

**Solution:**
1. Make sure `ollama serve` is running in another terminal
2. Check if Ollama is running: open [http://localhost:11434](http://localhost:11434)
3. Restart Ollama: Close it and run `ollama serve` again

### Problem: "Model not found"

**Solution:**
```bash
# Download the model
ollama pull gemma3:4b

# Check what models you have
ollama list
```

### Problem: "Instagram video download failed"

**Solution:**
```bash
# Update yt-dlp (Instagram changes frequently)
# Mac:
brew upgrade yt-dlp

# Windows: Download latest version from GitHub
```

### Problem: Transcription is slow

**Explanation:** This is normal! Whisper is very accurate but takes time:
- 1-minute video = ~2 minutes to transcribe
- 5-minute video = ~5-10 minutes

The AI analysis (summary, topics) adds another 30-60 seconds.

---

## Daily Usage Workflow

Here's how to use this tool regularly:

### Every Time You Start:

1. **Start Ollama (if using AI features):**
   ```bash
   ollama serve
   ```
   Keep this terminal open.

2. **Open a new terminal for transcribing:**
   ```bash
   cd ig-transcribe
   ```

3. **Transcribe videos:**
   ```bash
   node index.js "URL" --notion --ai --summarize --topics --model gemma3:4b
   ```

### Tips:

- Create a text file with your favorite command so you can copy-paste it
- Use batch processing for multiple videos
- Check the `output` folder for all your transcriptions
- Import CSV files into Notion or Excel for organizing

---

## What AI Models Can I Use?

You can use different Ollama models. Here are some options:

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `gemma3:4b` | 2.5GB | Fast | Good | Recommended for most people |
| `gemma3:8b` | 4.7GB | Medium | Better | More detailed summaries |
| `llama3` | 4.7GB | Medium | Better | Alternative to gemma3:8b |
| `llama3:70b` | 40GB | Slow | Best | High-end computers only |

**To download a different model:**
```bash
ollama pull llama3
```

**To use it:**
```bash
node index.js "URL" --ai --summarize --model llama3
```

---

## System Requirements

**Minimum:**
- 8GB RAM
- 10GB free disk space
- Internet connection (for downloading videos and models)

**Recommended:**
- 16GB RAM (for larger AI models)
- 20GB+ free disk space
- Fast internet (for downloading Ollama models)

**Note:** The first time you transcribe, Whisper downloads its model (~150MB). This is one-time only.

---

## Getting Help

**Something not working?**

1. Check the error message - it usually tells you what's wrong
2. Make sure Ollama is running (`ollama serve`)
3. Check the [Troubleshooting Guide](docs/troubleshooting.md)
4. Make sure all dependencies are installed:
   ```bash
   npm run check
   ```

**Still stuck?**
- Check existing issues on GitHub
- Create a new issue with the error message

---

## Next Steps

Once you're comfortable with the basics:

- [Notion Integration Guide](docs/notion.md) - Build a searchable database
- [Batch Processing Guide](docs/batch-processing.md) - Scrape entire accounts
- [Advanced Usage](docs/usage.md) - All commands and options

---

## Quick Reference Card

**Save this for later:**

```bash
# Start Ollama (keep running)
ollama serve

# Download a model (one time)
ollama pull gemma3:4b

# Transcribe one video
node index.js "INSTAGRAM_URL" --notion --ai --summarize --topics --model gemma3:4b

# Batch transcribe
node examples/batch-process.js urls.txt --notion --ai --summarize --topics --delay 12000

# Check if everything is installed
npm run check
```

---

**You're all set! Happy transcribing!**

Remember: Keep `ollama serve` running when you want AI features. That's the most common "gotcha" for beginners.
