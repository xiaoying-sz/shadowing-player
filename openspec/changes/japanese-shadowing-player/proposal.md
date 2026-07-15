## Why

Japanese language learners lack a dedicated desktop audio player for shadowing practice (シャドーイング). Existing solutions are either mobile-only apps with limited loop controls, general media players without sentence-level navigation, or web-based tools that lack recording/export capabilities. A focused desktop application with precise audio control, SRT subtitle support with furigana rendering, and integrated shadow recording would significantly improve the efficiency of self-study Japanese learners.

## What Changes

- **New standalone application** at `D:\CodingAgent\language-player\` — an Electron + React + TypeScript desktop audio player
- Audio file playback (MP3, M4A, WAV) with play/pause, progress seeking, and speed control (0.5x–2.0x, step 0.25x)
- Sentence-level navigation (previous/next sentence) driven by SRT subtitle timing
- Three loop modes: single sentence, paragraph (multi-sentence), and custom A-B region
- Japanese-specific subtitle rendering with furigana (ruby text) support
- Multiple subtitle display modes: 日本語 only, +ローマ字, +中文訳, all combined
- Optional subtitle loading — user can play audio with or without subtitles, toggle on/off
- Shadow reading mode with simultaneous microphone recording
- Recording export as standalone voice file or mixed stereo comparison (original L / voice R)
- Full keyboard shortcut support for efficient practice flow

## Capabilities

### New Capabilities
- `audio-playback`: Load and play audio files (MP3, M4A, WAV) with play/pause, seeking, progress display, and speed control (0.5x–2.0x in 0.25x steps)
- `subtitle-engine`: Parse SRT subtitle files, synchronize with audio playback position, support furigana ruby text syntax, and provide sentence-level data for navigation and loop
- `sentence-navigation`: Skip to previous/next sentence using subtitle timing data, display current sentence highlight, allow click-to-seek on subtitle panel
- `loop-control`: Three loop modes — single sentence loop, paragraph (contiguous sentences) loop, and custom A-B region loop; visual indicators for loop boundaries
- `shadow-recording`: One-click shadow mode that plays audio while simultaneously recording microphone input; adjustable recording delay (200–1000ms, default 400ms); original audio volume control during recording
- `audio-export`: Export recorded shadow audio as standalone WAV file, or as stereo mixed file (original on L channel, voice on R channel) for comparison playback
- `japanese-subtitle-display`: Render furigana ruby text via HTML `<ruby>` tags; toggle furigana visibility; switch between display modes (日本語, +ローマ字, +中文訳, all combined); subtitle visibility toggle

### Modified Capabilities

- None — this is a new application with no existing capabilities.

## Impact

- New project directory at `D:\CodingAgent\language-player\`
- New Electron + React + TypeScript codebase (no modifications to existing code in current workspace)
- Dependencies: Electron, React, TypeScript, Vite, Tailwind CSS, electron-builder
- Build output: Windows NSIS installer (post-MVP: macOS DMG)
- No external API or service dependencies — fully offline capable
