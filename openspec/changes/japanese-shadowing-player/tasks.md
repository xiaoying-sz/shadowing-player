## 1. Project Scaffolding

- [ ] 1.1 Initialize Electron + React + TypeScript project with Vite at `D:\CodingAgent\language-player\`
- [ ] 1.2 Set up project directory structure (electron/, src/, resources/)
- [ ] 1.3 Configure Electron main process, preload script, and IPC bridge
- [ ] 1.4 Set up Tailwind CSS and base styling
- [ ] 1.5 Configure electron-builder for Windows (NSIS) packaging
- [ ] 1.6 Create custom frameless TitleBar component with file name display
- [ ] 1.7 Create DropZone component for drag-and-drop file loading
- [ ] 1.8 Set up PlayerContext (React Context) for global player state management

## 2. Audio Playback Engine

- [ ] 2.1 Implement AudioService with play(), pause(), seek(), getPosition(), getDuration() using HTMLAudioElement
- [ ] 2.2 Implement speed control with 7 preset levels (0.50x–2.00x, step 0.25x) via playbackRate
- [ ] 2.3 Verify pitch preservation across all speed levels on Chromium/Electron
- [ ] 2.4 Implement audio file loading via Electron file dialog (MP3, M4A, WAV)
- [ ] 2.5 Implement drag-and-drop file loading for audio files
- [ ] 2.6 Create ProgressBar component with click-to-seek and time display
- [ ] 2.7 Create SpeedSelector component with 7 speed buttons and current-highlight
- [ ] 2.8 Create TransportControls component (play/pause, rewind/forward 5s)
- [ ] 2.9 Wire up Space/ArrowLeft/ArrowRight keyboard shortcuts for playback control

## 3. Subtitle Engine

- [ ] 3.1 Implement SubParser — parse standard SRT files into SubtitleSentence[] with start/end/timing
- [ ] 3.2 Implement auto-match: look for same-name .srt in audio file's directory
- [ ] 3.3 Implement manual subtitle loading via file dialog
- [ ] 3.4 Implement getAtTime(time) — return current subtitle sentence by audio position
- [ ] 3.5 Implement extended furigana syntax parsing: `{漢字|よみ}` → ruby segments
- [ ] 3.6 Implement pipe-delimited multi-line parsing: `日本語|romaji|中文訳`

## 4. Subtitle Display & Japanese Features

- [ ] 4.1 Create SubtitlePanel component — scrollable sentence list with current-highlight
- [ ] 4.2 Create RubyText component — render furigana via `<ruby>` HTML tags
- [ ] 4.3 Implement furigana toggle (show/hide) with keyboard shortcut
- [ ] 4.4 Create DisplayModeSelector with 4 modes: 日本語, +ローマ字, +中文訳, 全部表示
- [ ] 4.5 Implement subtitle visibility toggle (show/hide entire panel)
- [ ] 4.6 Implement click-on-sentence to seek to that position
- [ ] 4.7 Implement empty state / "Load Subtitle" prompt when no subtitle loaded

## 5. Sentence Navigation & Loop Control

- [ ] 5.1 Implement prevSentence()/nextSentence() navigation using subtitle timing data
- [ ] 5.2 Wire up ArrowUp/ArrowDown keyboard shortcuts for sentence navigation
- [ ] 5.3 Create LoopModeSelector — cycle through Off → Sentence → Paragraph → A-B
- [ ] 5.4 Implement LoopService with sentence loop mode (auto-seek to sentence start)
- [ ] 5.5 Implement paragraph loop mode (loop N consecutive sentences)
- [ ] 5.6 Implement A-B loop mode (user-defined markers, loop between them)
- [ ] 5.7 Add loop boundary visual indicators on ProgressBar
- [ ] 5.8 Handle edge case: loop mode without subtitle data (only A-B available)

## 6. Shadow Recording & Export

- [ ] 6.1 Implement RecorderService using MediaRecorder API for microphone capture
- [ ] 6.2 Implement microphone permission request and error handling
- [ ] 6.3 Create ShadowPanel component with Start/Stop button
- [ ] 6.4 Implement adjustable recording delay slider (200–1000ms, default 400ms)
- [ ] 6.5 Implement original audio volume slider during recording
- [ ] 6.6 Implement recording state indication (idle, recording, done)
- [ ] 6.7 Implement voice-only WAV export via Electron save dialog
- [ ] 6.8 Implement stereo mixed export (L: original, R: voice) via OfflineAudioContext
- [ ] 6.9 Wire up R key shortcut for recording toggle

## 7. Polish & Packaging

- [ ] 7.1 Implement application icon and app metadata
- [ ] 7.2 Configure electron-builder NSIS installer for Windows
- [ ] 7.3 Test and handle edge cases: no mic, corrupted files, large files
- [ ] 7.4 Add loading states and error messages for all operations
- [ ] 7.5 Verify all keyboard shortcuts work correctly
- [ ] 7.6 End-to-end test: full workflow from loading audio to exporting shadow recording
