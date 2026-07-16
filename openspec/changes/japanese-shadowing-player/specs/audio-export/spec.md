## IMPLEMENTED Requirements

### Requirement: Export recording in multiple formats
The system SHALL export the recorded shadow audio in the user's chosen format: WebM, WAV, MP3, or M4A.

#### Scenario: Select export format
- **WHEN** recording is complete (state=done)
- **THEN** system shows a format selector with WebM, WAV, MP3, M4A options
- **THEN** the selected format is highlighted

#### Scenario: Export WebM (raw)
- **WHEN** user selects WebM format and clicks "Export"
- **THEN** system opens a "Save As" file dialog with .webm filter
- **THEN** system saves the raw MediaRecorder blob (Opus codec in WebM container)
- **THEN** the file extension is forced to .webm regardless of dialog selection

#### Scenario: Export WAV
- **WHEN** user selects WAV format and clicks "Export"
- **THEN** system opens a "Save As" file dialog with .wav filter
- **THEN** system decodes the WebM blob via OfflineAudioContext
- **THEN** system encodes the PCM data as a 16-bit mono WAV file
- **THEN** the file extension is forced to .wav

#### Scenario: Export MP3
- **WHEN** user selects MP3 format and clicks "Export"
- **THEN** system opens a "Save As" file dialog with .mp3 filter
- **THEN** system decodes the WebM blob to PCM via OfflineAudioContext
- **THEN** system sends the PCM WAV data to the Electron main process
- **THEN** main process uses ffmpeg (libmp3lame codec, 128kbps) to encode MP3
- **THEN** the file extension is forced to .mp3

#### Scenario: Export M4A
- **WHEN** user selects M4A format and clicks "Export"
- **THEN** system opens a "Save As" file dialog with .m4a filter
- **THEN** system decodes the WebM blob to PCM via OfflineAudioContext
- **THEN** system sends the PCM WAV data to the Electron main process
- **THEN** main process uses ffmpeg (AAC codec, 128kbps) to encode M4A
- **THEN** the file extension is forced to .m4a

#### Scenario: ffmpeg conversion failure fallback
- **WHEN** MP3 or M4A conversion via ffmpeg fails
- **THEN** system falls back to saving as WAV
- **THEN** system logs the error to console

### Requirement: Force correct file extension
The system SHALL always use the format selected in the UI, not the save dialog's filter selection.

#### Scenario: Extension forced from UI format
- **WHEN** user selects MP3 format in the UI and clicks Export
- **THEN** system constructs the final file path using the UI-selected format extension
- **THEN** regardless of which filter is active in the save dialog, the saved file has the correct extension
