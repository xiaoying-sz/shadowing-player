## ADDED Requirements

### Requirement: Start shadow recording
The system SHALL start simultaneous audio playback and microphone recording with a configurable delay.

#### Scenario: One-click shadow start
- **WHEN** user clicks "Start Shadow" button or presses R key
- **THEN** system requests microphone permission (if not already granted)
- **THEN** after the configured delay (default: 400ms), system starts audio playback AND microphone recording simultaneously
- **THEN** system shows a recording indicator (e.g., red dot + recording time)

#### Scenario: Microphone permission denied
- **WHEN** user clicks "Start Shadow" but microphone permission is denied
- **THEN** system shows an error message with instructions to enable microphone access

### Requirement: Stop shadow recording
The system SHALL stop both playback and recording when the user ends the shadow session.

#### Scenario: Stop recording
- **WHEN** user clicks "Stop" button or presses R key during recording
- **THEN** system stops playback
- **THEN** system stops microphone recording
- **THEN** system saves the recorded audio as a blob ready for export

### Requirement: Adjustable recording delay
The system SHALL allow the user to adjust the delay between playback start and recording start.

#### Scenario: Adjust delay slider
- **WHEN** user adjusts the delay slider
- **THEN** system updates the delay value in real time
- **THEN** system displays the current delay in milliseconds

#### Scenario: Valid delay range
- **WHEN** user adjusts delay
- **THEN** system constrains delay between minimum 200ms and maximum 1000ms
- **THEN** default value is 400ms

### Requirement: Recording quality toggle
The system SHALL allow the user to switch between standard and high-quality recording modes.

#### Scenario: Standard quality (default)
- **WHEN** recording quality is set to "标准"
- **THEN** system uses 44.1kHz sample rate with echo cancellation and noise suppression enabled
- **THEN** suitable for typical environments with background noise

#### Scenario: High quality
- **WHEN** recording quality is set to "高质量"
- **THEN** system uses 48kHz sample rate, mono channel, 128kbps Opus bitrate
- **THEN** echo cancellation, noise suppression, and auto gain control are disabled
- **THEN** requires a quiet recording environment
- **THEN** quality setting takes effect on the next recording start

### Requirement: Original audio volume control during recording
The system SHALL allow the user to adjust the volume of the original audio during shadow recording.

#### Scenario: Volume slider during recording
- **WHEN** recording is active and user adjusts the original audio volume slider
- **THEN** system changes the playback volume accordingly
- **THEN** the change takes effect immediately

### Requirement: Recording state indication
The system SHALL clearly indicate the current recording state.

#### Scenario: Visual state changes
- **WHEN** system is idle (not recording)
- **THEN** button shows "开始录音" with start icon

- **WHEN** recording is active
- **THEN** button shows "停止录音" with recording icon (red dot)
- **THEN** system shows a pulsing recording indicator "录音中..."

- **WHEN** recording has stopped with data
- **THEN** system shows format selector (WebM/WAV/MP3/M4A) and export button
- **THEN** the export format defaults to WebM
