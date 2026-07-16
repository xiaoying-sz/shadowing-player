## ADDED Requirements

### Requirement: Load audio file
The system SHALL allow the user to load audio files via file dialog or drag-and-drop.

#### Scenario: Load via file dialog
- **WHEN** user clicks "Open File" or presses Ctrl+O
- **THEN** system opens a native file dialog filtered to audio files (.mp3, .m4a, .wav)
- **THEN** system loads the selected file and prepares for playback

#### Scenario: Load via drag-and-drop
- **WHEN** user drags an audio file onto the application window
- **THEN** system loads the dropped file and prepares for playback

#### Scenario: Reject unsupported format
- **WHEN** user attempts to load a non-audio file
- **THEN** system shows an error message indicating unsupported format

### Requirement: Play and pause
The system SHALL provide play/pause controls for the loaded audio.

#### Scenario: Toggle play/pause
- **WHEN** user clicks the play button or presses Space while audio is paused
- **THEN** system starts playback from the current position

#### Scenario: Pause during playback
- **WHEN** user clicks the pause button or presses Space during playback
- **THEN** system pauses playback at the current position

### Requirement: Load audio folder (playlist)
The system SHALL allow the user to load an entire folder of audio files as a playlist.

#### Scenario: Load via folder dialog
- **WHEN** user clicks "加载文件夹" button
- **THEN** in Electron mode, system opens a native folder selection dialog
- **THEN** system scans the selected folder for audio files (.mp3, .m4a, .wav, .ogg, .flac)
- **THEN** system creates a playlist sorted alphabetically
- **THEN** system auto-plays the first file and shows the playlist sidebar

#### Scenario: Navigate playlist
- **WHEN** user double-clicks a file in the playlist sidebar
- **THEN** system loads and plays that file
- **WHEN** user presses Ctrl+N
- **THEN** system plays the next file in the playlist
- **WHEN** user presses Ctrl+P
- **THEN** system plays the previous file in the playlist

### Requirement: Seek to position
The system SHALL allow the user to seek to any position in the audio via a progress bar.

#### Scenario: Click on progress bar
- **WHEN** user clicks on the progress bar at a specific position
- **THEN** system seeks the audio to that corresponding time position
- **THEN** system starts playback automatically

#### Scenario: Drag progress bar thumb
- **WHEN** user drags the progress bar thumb to a new position
- **THEN** system seeks the audio to the corresponding time position while dragging
- **THEN** system updates the time display accordingly

### Requirement: Display current time and duration
The system SHALL display the current playback position and total audio duration.

#### Scenario: Time display updates during playback
- **WHEN** audio is playing
- **THEN** system updates the current time display at least once per second
- **THEN** system shows total duration in the same format (MM:SS)

### Requirement: Control playback speed
The system SHALL allow the user to change playback speed in 0.25x increments from 0.50x to 2.00x.

#### Scenario: Select speed from preset buttons
- **WHEN** user clicks a speed button (e.g., "0.75x")
- **THEN** system changes playback speed to the selected rate
- **THEN** system highlights the currently active speed button

#### Scenario: Speed change via keyboard shortcut
- **WHEN** user presses keys 1 through 7
- **THEN** system selects the corresponding speed (1=0.50x, 2=0.75x, ..., 7=2.00x)

#### Scenario: Pitch preservation during speed change
- **WHEN** audio plays at any speed between 0.50x and 2.00x
- **THEN** system SHALL preserve the original pitch (no "chipmunk" or "slow-motion" effect)
