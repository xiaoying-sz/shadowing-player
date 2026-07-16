## Why

Japanese language learners lack a dedicated desktop audio player for shadowing practice (シャドーイング). Existing solutions are either mobile-only apps with limited loop controls, general media players without sentence-level navigation, or web-based tools that lack recording/export capabilities. A focused desktop application with precise audio control, SRT subtitle support with furigana rendering, and integrated shadow recording would significantly improve the efficiency of self-study Japanese learners.

## What Changes

- **New standalone application** — an Electron + React + TypeScript desktop audio player
- Audio file playback (MP3, M4A, WAV) with play/pause, progress seeking, and speed control (0.5x–2.0x, step 0.25x)
- Sentence-level navigation (previous/next sentence) driven by SRT subtitle timing
- Three loop modes: single sentence, paragraph (multi-sentence), and custom A-B region
- Japanese-specific subtitle rendering with furigana (ruby text) — always visible
- Folder loading with playlist sidebar for batch practice
- Optional subtitle loading — user can play audio with or without subtitles, toggle on/off
- Shadow reading mode with simultaneous microphone recording
- Recording quality toggle (标准 / 高质量)
- Recording export in multiple formats: WebM, WAV, MP3, M4A (via ffmpeg)
- Full keyboard shortcut support for efficient practice flow

## Capabilities

### New Capabilities
- `audio-playback`: Load and play audio files (MP3, M4A, WAV) with play/pause, seeking, progress display, speed control (0.5x–2.0x in 0.25x steps), and folder/playlist loading
- `subtitle-engine`: Parse SRT subtitle files, synchronize with audio playback position, support furigana ruby text syntax, and provide sentence-level data for navigation and loop
- `sentence-navigation`: Skip to previous/next sentence using subtitle timing data, display current sentence highlight, allow click-to-seek-and-play on subtitle panel; smart backward jumps to previous sentence if near start
- `loop-control`: Three loop modes — single sentence loop, paragraph (contiguous sentences) loop, and custom A-B region loop; visual indicators for loop boundaries
- `shadow-recording`: One-click shadow mode that plays audio while simultaneously recording microphone input; adjustable recording delay (200–1000ms, default 400ms); original audio volume control during recording; quality toggle (标准/高质量: 48kHz, 128kbps Opus vs 44.1kHz with echo cancellation)
- `audio-export`: Export recorded shadow audio in WebM (raw), WAV (PCM 16-bit), MP3 (128kbps via ffmpeg), or M4A (AAC via ffmpeg) format with in-app format selector
- `japanese-subtitle-display`: Render furigana ruby text via HTML `<ruby>` tags (always visible); subtitle visibility toggle; display defaults to pure Japanese text mode

### Modified Capabilities

- None — this is a new application with no existing capabilities.

## Impact

- New project directory at `./`
- New Electron + React + TypeScript codebase (no modifications to existing code in current workspace)
- Dependencies: Electron, React, TypeScript, Vite, Tailwind CSS, electron-builder
- Build output: Windows NSIS installer (post-MVP: macOS DMG)
- No external API or service dependencies — fully offline capable
