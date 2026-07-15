## ADDED Requirements

### Requirement: Export voice-only recording
The system SHALL export the recorded shadow audio as a standalone WAV file.

#### Scenario: Export voice-only
- **WHEN** user clicks "Export Voice Only" after recording
- **THEN** system opens a "Save As" file dialog
- **THEN** system saves the recorded microphone audio as a PCM 16-bit 44.1kHz mono WAV file
- **THEN** the file contains only the user's voice, with no original audio mixed in

### Requirement: Export mixed stereo comparison
The system SHALL export a stereo file with original audio on the left channel and recorded voice on the right channel.

#### Scenario: Export mixed audio
- **WHEN** user clicks "Export Mixed Comparison" after recording
- **THEN** system opens a "Save As" file dialog
- **THEN** system creates a stereo WAV file where:
  - Left channel: original audio (synchronized to match recording timing)
  - Right channel: recorded microphone audio
- **THEN** system saves the file as PCM 16-bit 44.1kHz stereo WAV

#### Scenario: Play back mixed file for comparison
- **WHEN** user plays the exported mixed stereo file in any media player
- **THEN** left channel plays the original audio
- **THEN** right channel plays the user's shadow recording
- **THEN** user can pan to either channel for isolated listening, or hear both simultaneously

### Requirement: File save dialog
The system SHALL use native OS file save dialogs for export operations.

#### Scenario: Save dialog behavior
- **WHEN** user triggers any export action
- **THEN** system opens the native file save dialog
- **THEN** dialog suggests a default filename based on the original audio file name with appropriate suffix (e.g., "lesson1_shadow.wav", "lesson1_mixed.wav")
- **THEN** file filter defaults to WAV files
