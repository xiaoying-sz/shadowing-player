## ADDED Requirements

### Requirement: Navigate to previous sentence
The system SHALL move playback to the start of the previous subtitle sentence when triggered.

#### Scenario: Previous sentence with current sentence active
- **WHEN** user presses ArrowUp or clicks the "Previous Sentence" button
- **THEN** system seeks audio to the start time of the sentence immediately preceding the current one
- **THEN** system highlights the previous sentence in the subtitle panel

#### Scenario: Previous sentence at the first sentence
- **WHEN** user is at the first sentence and triggers previous sentence
- **THEN** system seeks to the start of the first sentence (no wrap-around)

### Requirement: Navigate to next sentence
The system SHALL move playback to the start of the next subtitle sentence when triggered.

#### Scenario: Next sentence with current sentence active
- **WHEN** user presses ArrowDown or clicks the "Next Sentence" button
- **THEN** system seeks audio to the start time of the sentence immediately following the current one
- **THEN** system highlights the next sentence in the subtitle panel

#### Scenario: Next sentence at the last sentence
- **WHEN** user is at the last sentence and triggers next sentence
- **THEN** system seeks to the start of the last sentence (no wrap-around)

### Requirement: Click subtitle to seek
The system SHALL allow the user to click on any displayed subtitle sentence to seek to its start time.

#### Scenario: Click on visible sentence
- **WHEN** user clicks on a subtitle sentence in the panel
- **THEN** system seeks audio to that sentence's start time
- **THEN** system highlights the clicked sentence as current

### Requirement: Highlight current sentence
The system SHALL visually distinguish the currently playing sentence from other sentences in the subtitle panel.

#### Scenario: Current sentence highlight updates during playback
- **WHEN** audio position enters a new sentence's time range
- **THEN** system applies a visual highlight (e.g., different background color) to that sentence
- **THEN** previous sentence returns to normal appearance
