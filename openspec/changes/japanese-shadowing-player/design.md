## Context

This is a new Electron + React + TypeScript desktop application for Japanese shadowing practice. The application is a standalone desktop project for Windows.

The application targets Windows as the primary platform (NSIS installer). It is fully offline capable with no external API dependencies.

## Goals / Non-Goals

**Goals:**
- Provide audio playback (MP3, M4A, WAV) with precise position control
- Enable speed control from 0.5x to 2.0x in 0.25x increments (7 levels)
- Parse and display SRT subtitle files, synchronized with audio position
- Render Japanese furigana (ruby text) on subtitle display (always visible)
- Allow toggling subtitle visibility on/off at any time
- Navigate to previous/next sentence using subtitle timing data
- Support three loop modes: single sentence, paragraph (contiguous sentences), custom A-B region
- Provide folder loading with playlist sidebar for batch practice
- Provide one-click shadow recording with adjustable delay (200–1000ms, default 400ms) and quality toggle
- Export recorded shadow audio in multiple formats: WebM, WAV, MP3, M4A (via ffmpeg)
- Support full keyboard shortcuts for efficient practice flow
- Package as Windows installer via electron-builder NSIS

**Non-Goals:**
- Waveform visualization (post-MVP)
- Audio CD ripping (post-MVP)
- YouTube or streaming service integration (post-MVP)
- Speech recognition or pronunciation scoring (post-MVP)
- Mobile platform support (post-MVP)
- Cloud sync or multi-device features (post-MVP)
- ASS/SSA subtitle format support (post-MVP; SRT + VTT only)

## Decisions

### Decision 1: Electron over Tauri

| Factor | Electron | Tauri |
|--------|----------|-------|
| Windows packaging maturity | ✅ Excellent (NSIS) | ⚠️ Growing |
| Web Audio API access | ✅ Direct in renderer | ❌ Requires Rust layer |
| MediaRecorder API | ✅ Built-in | ❌ Requires cpal crate |
| Subtitle rendering (HTML/CSS) | ✅ Native | ✅ Webview |
| Bundle size | ~150MB | ~5MB |
| Community/Chinese resources | ✅ Extensive | ⚠️ Limited |

**Chosen**: Electron. The application is audio-intensive and benefits from direct access to Web Audio API and MediaRecorder API in the renderer process, eliminating the need for native modules or Rust backend code. The larger bundle size is acceptable for a desktop application.

### Decision 2: HTMLAudioElement with playbackRate over AudioBuffer custom engine

| Factor | HTMLAudioElement | AudioBuffer (Web Audio API) |
|--------|-----------------|---------------------------|
| Speed with pitch preservation | ✅ Built-in (Chrome `playbackRate`) | ❌ Manual implementation needed |
| Seeking | ✅ Native | ⚠️ Manual sample calculation |
| Streaming large files | ✅ Streaming | ❌ Must load entire file to memory |
| Implementation complexity | ✅ Simple | ⚠️ High |

**Chosen**: HTMLAudioElement with `playbackRate` for MVP. Chromium's implementation preserves pitch naturally during speed changes. Fallback: if pitch distortion occurs, switch to Web Audio API's `AudioBufferSourceNode` with detune for pitch-preserved speed.

### Decision 3: SRT as primary subtitle format

SRT is chosen because:
- Widely supported, easy to author and edit manually
- Simple text format extensible with furigana syntax: `{漢字|よみ}`
- Can be auto-generated from many Japanese learning resources
- Fallback: VTT format also supported via the same parser

Furigana syntax convention within SRT text:
```
{今日|きょう}はいい{天気|てんき}ですね。
```
Renderer splits text segments, converting `{kanji|reading}` pairs to `<ruby>` HTML tags.

### Decision 4: MediaRecorder API for shadow recording + ffmpeg for export

- Built into Chromium runtime, no native module installation
- Captures audio via audio/webm;codecs=opus format
- Export: decode WebM blob to PCM via OfflineAudioContext, then:
  - WAV: encode PCM to WAV in renderer
  - MP3/M4A: send PCM WAV data to main process via IPC, convert using ffmpeg (ffmpeg-static + fluent-ffmpeg)
- Quality toggle: standard (44.1kHz + echo cancellation) or high (48kHz + 128kbps Opus, no processing)

### Decision 5: Step-based speed selector over continuous slider

- 7 discrete steps (0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00) cover all practical needs
- Simplified UX — no fine-tuning struggle
- Keyboard shortcut (1-7) maps directly to each step
- Implementation: array of preset values, index selection

### Decision 6: Default shadow delay at 400ms

Japanese is a mora-timed (拍) language, unlike stress-timed English. Research on shadowing pedagogy suggests 300–500ms delay for Japanese learners, longer than the 200–300ms typical for English. 400ms is chosen as a reasonable default; user can adjust from 200ms to 1000ms via slider.

### Decision 7: Project location separate from workspace

The application code and openspec artifacts are co-located in the same repository for simplified project management.

### Decision 8: Toolbar simplification

After development, the toolbar was simplified by removing:
- Furigana toggle button (furigana always visible)
- Display mode selector (日本語 / +ローマ字 / +中文訳 / 全部表示)

This reduces UI clutter since the primary use case is Japanese-only shadowing practice. The SRT parser still supports pipe-delimited romaji/translation data for future use.

### Decision 9: ffmpeg-static for audio conversion

- `ffmpeg-static` bundles a static ffmpeg binary for Windows (~30MB in node_modules, not in the app bundle)
- Used in Electron main process via `fluent-ffmpeg` for MP3 (libmp3lame) and M4A (AAC) encoding
- Renderer sends PCM WAV data to main process via IPC
- Main process saves temp WAV, converts via ffmpeg, saves to final path, cleans up temp file
- Fallback: if conversion fails, saves as WAV instead

## Architecture

### Process Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON MAIN PROCESS                        │
│                                                                  │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   WindowManager   │  │  File I/O      │  │  Auto-updater  │   │
│  │  (BrowserWindow)  │  │  (dialog, fs)  │  │  (electron-upd)│   │
│  └──────────────────┘  └────────────────┘  └────────────────┘   │
│                              │                                       │
│                         IPC (contextBridge)                          │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                   RENDERER PROCESS (React)                           │
│                              │                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     App (Root Component)                     │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │               PlayerContext (Provider)                 │   │    │
│  │  │  State: audioFile, subtitles, currentTime, loopMode,  │   │    │
│  │  │         isRecording, playbackRate, delay, ...          │   │    │
│  │  └───────────────────────┬──────────────────────────────┘   │    │
│  │                          │                                   │    │
│  │         ┌────────────────┼──────────────────┐               │    │
│  │         ▼                ▼                  ▼               │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │    │
│  │  │ AudioService │ │  SubParser  │ │  RecorderService  │    │    │
│  │  │              │ │             │ │                   │    │    │
│  │  │ • play/pause │ │ • parseSRT  │ │ • startRecord()   │    │    │
│  │  │ • seekTo()   │ │ • getAtTime │ │ • stopRecord()    │    │    │
│  │  │ • setRate()  │ │ • sentences │ │ • getBlob()       │    │    │
│  │  │ • position$  │ │ • findNearest│ │ • getDuration()  │    │    │
│  │  └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘    │    │
│  │         │                │                   │              │    │
│  │         └────────────────┼───────────────────┘              │    │
│  │                          ▼                                  │    │
│  │            ┌─────────────────────────┐                      │    │
│  │            │   LoopService            │                     │    │
│  │            │ sentence / paragraph / AB │                    │    │
│  │            └─────────────────────────┘                      │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │                    UI Components                      │   │    │
│  │  │   ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐  │   │    │
│  │  │   │Transport │ │Subtitle │ │ Loop   │ │ Shadow │  │   │    │
│  │  │   │Controls  │ │ Panel   │ │ Select │ │ Panel  │  │   │    │
│  │  │   └──────────┘ └──────────┘ └────────┘ └────────┘  │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User loads audio file
   ──▶ IPC: main process opens file dialog
   ──▶ AudioService.load(filePath) → creates HTMLAudioElement
   ──▶ Auto-lookup: same-name .srt in same directory → SubParser.parse()
   ──▶ PlayerContext updates: audioFile, subtitles, duration

2. User plays audio
   ──▶ AudioService.play() → HTMLAudioElement.play()
   ──▶ requestAnimationFrame loop updates currentTime
   ──▶ PlayerContext.currentTime changes → SubParser.getAtTime() → highlight update
   ──▶ ProgressBar re-renders with new position

3. User clicks "Loop Sentence"
   ──▶ LoopService.setMode('sentence')
   ──▶ LoopService binds to current sentence {start, end} from SubParser
   ──▶ On each timeupdate: if currentTime >= end → AudioService.seekTo(start)

4. User starts shadow recording
   ──▶ RecorderService.start(delayMs, originalVolume)
   ──▶ After delayMs: AudioService.play() + MediaRecorder.start() simultaneously
   ──▶ On stop: Blob created → ExportService available
   ──▶ Export options: voice-only WAV, or mixed stereo via OfflineAudioContext
```

### Subtitle Data Model

```typescript
interface SubtitleSentence {
  index: number;
  start: number;      // seconds
  end: number;        // seconds
  parts: SubtitlePart[][];  // [line][segment]
  text: string;       // raw text
}

interface SubtitlePart {
  type: 'text' | 'ruby';
  text: string;       // e.g., "今日" or "はいい"
  ruby?: string;      // e.g., "きょう" (only for type='ruby')
  romaji?: string;    // e.g., "kyou" (optional, from lookup)
  translation?: string; // e.g., "今天" (Chinese translation, from SRT alternate line)
}

type DisplayMode = 'japanese' | 'japanese-romaji' | 'japanese-chinese' | 'all';
```

### React Component Hierarchy

```
<App>
  <PlayerProvider>          ← Context provider for global state
    <TitleBar />            ← Custom frameless window controls + file name
    <div className="flex flex-col h-screen">

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {subtitles.length > 0 && subtitlesVisible &&
          <SubtitlePanel>          ← Scrollable subtitle display
            {sentences.map(s =>
              <SubtitleLine>       ← Single sentence + highlight
                <RubyText />       ← Furigana rendering
              </SubtitleLine>
            )}
            <DisplayModeSelector /> ← 日本語 / +romaji / +中文 / all
          </SubtitlePanel>
        }
        {subtitles.length === 0 &&
          <DropZone />             ← Drag & drop area when no file loaded
        }
      </div>

      {/* Transport controls (always visible) */}
      <div className="border-t">
        <SpeedSelector />          ← 7 speed buttons
        <ProgressBar />            ← Seekable progress + A-B markers
        <div className="flex items-center gap-2">
          <button>⏮️</button>      ← Prev sentence
          <button>⏪</button>      ← Rewind 5s
          <button>▶️/⏸️</button>   ← Play/Pause
          <button>⏩</button>      ← Forward 5s
          <button>⏭️</button>      ← Next sentence
          <LoopModeSelector />     ← Off / Sentence / Paragraph / A-B
          <TimeDisplay />          ← 00:17 / 03:45
        </div>

        {/* Shadow recording panel */}
        <ShadowPanel>
          <button>🎤 Start Shadow</button>
          <DelaySlider />
          <OriginalVolumeSlider />
          <ExportButtons />
        </ShadowPanel>
      </div>
    </div>
  </PlayerProvider>
</App>
```

### Shortcut Map

```typescript
const SHORTCUTS = {
  'Space':     'playPause',
  'ArrowLeft': 'rewind5s',
  'ArrowRight':'forward5s',
  'ArrowUp':   'prevSentence',
  'ArrowDown': 'nextSentence',
  'l':         'cycleLoopMode',
  'r':         'toggleRecording',
  's':         'toggleSubtitles',
  'm':         'cycleDisplayMode',
  '1':         'speed0.50',
  '2':         'speed0.75',
  '3':         'speed1.00',
  '4':         'speed1.25',
  '5':         'speed1.50',
  '6':         'speed1.75',
  '7':         'speed2.00',
};
```

## Risks / Trade-offs

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| HTMLAudioElement `playbackRate` causes pitch distortion on some Chromium builds | Low | Fall back to Web Audio API AudioBufferSourceNode with detune; or apply `preservesPitch` CSS property |
| MediaRecorder API not supported in older Electron versions | Low | Bundle Chromium 110+ which supports it; document minimum version requirement |
| Large SRT files with complex furigana markup cause rendering performance issues | Low | Virtualize subtitle list (only render visible sentences); memoize RubyText component |
| Microphone permission denied on first launch | Medium | Graceful fallback with clear instructions; Electron `systemPreferences` API to check permission |
| A-B loop with very short region (< 1 second) causes rapid seeking loop | Medium | Enforce minimum loop duration of 0.5s; add debounce to loop detection |
| Electron bundle size (~150MB) may be large for simple audio player | Medium | Acceptable for desktop; consider ASAR compression; optional: strip Chromium unused features via electron-builder |
| File path with non-ASCII characters (Japanese filenames) | Low | Use `Buffer.from(path)` for IPC; ensure file encoding handling |

## Open Questions

- Should the mixed export (original + voice) use stereo channels or alternate playback (sequential)?
  → Decision: Stereo channels (L=original, R=voice) enables simultaneous comparison on any media player.
- What WAV encoding format for recording export? PCM 16-bit 44.1kHz mono is standard, but stereo mixed export requires 2 channels.
  → Decision: Voice-only = PCM 16-bit 44.1kHz mono; Mixed = same but stereo.
- Should subtitle auto-loading be strict (exact same filename) or fuzzy (contains filename)?
  → Decision: Exact match first (audio.srt → audio.mp3); if not found, offer manual selection.
