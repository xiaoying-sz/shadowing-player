## ADDED Requirements

### Requirement: Single sentence loop
The system SHALL repeat the current sentence indefinitely when sentence loop mode is active.

#### Scenario: Start sentence loop
- **WHEN** user activates sentence loop mode while a subtitle sentence is active
- **THEN** system plays the current sentence from start to end
- **THEN** when playback reaches the sentence end time, system auto-seeks to the sentence start time
- **THEN** system continues playing the same sentence repeatedly

#### Scenario: Exit sentence loop
- **WHEN** user is in sentence loop mode and presses play/pause, seeks, or changes loop mode
- **THEN** system exits sentence loop and resumes normal playback behavior

### Requirement: Paragraph (multi-sentence) loop
The system SHALL repeat a group of consecutive subtitle sentences when paragraph loop mode is active.

#### Scenario: Start paragraph loop
- **WHEN** user activates paragraph loop mode
- **THEN** system defines the paragraph as the current sentence plus N-1 following sentences (default: 3 sentences total)
- **THEN** system plays from paragraph start to paragraph end
- **THEN** when playback reaches paragraph end, system auto-seeks to paragraph start

#### Scenario: Paragraph boundary adjustment
- **WHEN** user is in paragraph loop mode and navigates to a different sentence
- **THEN** system redefines the paragraph centered on the new current sentence

### Requirement: A-B custom region loop
The system SHALL repeat a user-defined region between marker A and marker B.

#### Scenario: Set A and B markers
- **WHEN** user clicks "Set A" at the current position
- **THEN** system marks position A
- **WHEN** user clicks "Set B" at another position
- **THEN** system marks position B
- **THEN** system begins looping from A to B

#### Scenario: A-B loop playback
- **WHEN** A-B loop is active and playback reaches position B
- **THEN** system auto-seeks back to position A and continues playback

#### Scenario: Update markers during loop
- **WHEN** user clicks "Set A" or "Set B" while A-B loop is active
- **THEN** system updates the corresponding marker to the current position
- **THEN** loop continues from the updated position

### Requirement: Visual loop indicator
The system SHALL display visual indicators for loop boundaries on the progress bar.

#### Scenario: Sentence loop indicator
- **WHEN** sentence loop is active
- **THEN** progress bar shows a highlighted region spanning the current sentence's time range

#### Scenario: A-B loop markers
- **WHEN** A-B markers are set
- **THEN** progress bar shows markers labeled "A" and "B" at the corresponding positions
- **THEN** the region between markers is visually highlighted

### Requirement: Loop mode UI
The system SHALL provide a control to cycle through available loop modes and display the current mode.

#### Scenario: Cycle loop mode
- **WHEN** user presses the loop mode button or presses L key
- **THEN** system cycles through: Off → Sentence → Paragraph → A-B → Off
- **THEN** system displays the current mode name visually

#### Scenario: Loop mode without subtitles
- **WHEN** no subtitle data is loaded and user attempts to enter sentence or paragraph loop
- **THEN** system shows that sentence/paragraph loop is unavailable
- **THEN** only A-B loop mode is offered
