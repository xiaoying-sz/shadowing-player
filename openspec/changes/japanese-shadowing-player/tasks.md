## 1. Project Scaffolding ✅

- [x] 1.1 Initialize Electron + React + TypeScript project with Vite
- [x] 1.2 Set up project directory structure (electron/, src/, resources/)
- [x] 1.3 Configure Electron main process, preload script, and IPC bridge
- [x] 1.4 Set up Tailwind CSS and base styling
- [x] 1.5 Configure electron-builder for Windows (NSIS) packaging
- [x] 1.6 Create custom frameless TitleBar component with file name display
- [x] 1.7 Create DropZone component for drag-and-drop file loading
- [x] 1.8 Set up PlayerContext (React Context) for global player state management

## 2. Audio Playback Engine ✅

- [x] 2.1 Implement AudioService with play(), pause(), seek(), getPosition(), getDuration() using HTMLAudioElement
- [x] 2.2 Implement speed control with 7 preset levels (0.50x–2.00x, step 0.25x) via playbackRate
- [x] 2.3 Verify pitch preservation across all speed levels on Chromium/Electron
- [x] 2.4 Implement audio file loading via Electron file dialog (MP3, M4A, WAV)
- [x] 2.5 Implement drag-and-drop file loading for audio files
- [x] 2.6 Create ProgressBar component with click-to-seek and time display
- [x] 2.7 Create SpeedSelector component with 7 speed buttons and current-highlight
- [x] 2.8 Create TransportControls component (play/pause, rewind/forward 5s)
- [x] 2.9 Wire up Space/ArrowLeft/ArrowRight keyboard shortcuts for playback control
- [x] 2.10 **Added**: Folder loading with playlist sidebar, Ctrl+N/P for next/prev in playlist

## 3. Subtitle Engine ✅

- [x] 3.1 Implement SubParser — parse standard SRT files into SubtitleSentence[] with start/end/timing
- [x] 3.2 Implement auto-match: look for same-name .srt in audio file's directory
- [x] 3.3 Implement manual subtitle loading via file dialog
- [x] 3.4 Implement getAtTime(time) — return current subtitle sentence by audio position
- [x] 3.5 Implement extended furigana syntax parsing: `{漢字|よみ}` → ruby segments
- [x] 3.6 Implement pipe-delimited multi-line parsing: `日本語|romaji|中文訳`

## 4. Subtitle Display & Japanese Features ✅

- [x] 4.1 Create SubtitlePanel component — scrollable sentence list with current-highlight
- [x] 4.2 Create RubyText component — render furigana via `<ruby>` HTML tags
- [x] ~~4.3 Implement furigana toggle (show/hide)~~ **Removed**: furigana always visible
- [x] ~~4.4 Create DisplayModeSelector with 4 modes~~ **Removed**: toolbar simplified, Japanese-only display
- [x] 4.5 Implement subtitle visibility toggle (show/hide entire panel)
- [x] 4.6 Implement click-on-sentence to seek AND play that position
- [x] 4.7 Implement empty state / "Load Subtitle" prompt when no subtitle loaded

## 5. Sentence Navigation & Loop Control ✅

- [x] 5.1 Implement prevSentence()/nextSentence() navigation using subtitle timing data
- [x] 5.2 Wire up ArrowUp/ArrowDown keyboard shortcuts for sentence navigation
- [x] 5.3 Create LoopModeSelector — cycle through Off → Sentence → Paragraph → A-B
- [x] 5.4 Implement LoopService with sentence loop mode (auto-seek to sentence start)
- [x] 5.5 Implement paragraph loop mode (loop N consecutive sentences)
- [x] 5.6 Implement A-B loop mode (user-defined markers, loop between them)
- [x] 5.7 Add loop boundary visual indicators on ProgressBar
- [x] 5.8 Handle edge case: loop mode without subtitle data (only A-B available)
- [x] 5.9 **Added**: Smart backward — jump to previous sentence if within 1s of current start

## 6. Shadow Recording & Export ✅

- [x] 6.1 Implement RecorderService using MediaRecorder API for microphone capture
- [x] 6.2 Implement microphone permission request and error handling
- [x] 6.3 Create ShadowPanel component with Start/Stop button
- [x] 6.4 Implement adjustable recording delay slider (200–1000ms, default 400ms)
- [x] 6.5 Implement original audio volume slider during recording
- [x] 6.6 Implement recording state indication (idle, recording, done)
- [x] 6.7 Implement audio export: WebM (raw), WAV (PCM 16-bit), MP3 (128kbps via ffmpeg), M4A (AAC via ffmpeg)
- [x] ~~6.8 Implement stereo mixed export~~ **Replaced**: single-format export with in-app format selector (WebM/WAV/MP3/M4A)
- [x] 6.9 Wire up R key shortcut for recording toggle
- [x] 6.10 **Added**: Recording quality toggle (标准: 44.1kHz+echo cancellation / 高质量: 48kHz+128kbps Opus)
- [x] 6.11 **Added**: ffmpeg-static + fluent-ffmpeg for main-process audio conversion
- [x] 6.12 **Fixed**: Recording blob timing — state change moved to onstop to ensure data available before export

## 7. Polish & Packaging

- [ ] 7.1 Implement application icon and app metadata
- [ ] 7.2 Configure electron-builder NSIS installer for Windows
- [x] 7.3 Test and handle edge cases: no mic, corrupted files, large files
- [x] 7.4 Add loading states and error messages for all operations
- [x] 7.5 Verify all keyboard shortcuts work correctly
- [x] 7.6 End-to-end test: full workflow from loading audio to exporting shadow recording
