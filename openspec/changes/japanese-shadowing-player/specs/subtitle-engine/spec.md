## ADDED Requirements

### Requirement: Parse SRT subtitle file
The system SHALL parse standard SRT (SubRip) subtitle files and extract timing and text data.

#### Scenario: Parse valid SRT file
- **WHEN** user loads a valid SRT file
- **THEN** system extracts all subtitle entries with correct sequence numbers, timestamps, and text content

#### Scenario: Handle malformed SRT
- **WHEN** user loads a malformed SRT file (missing sequence numbers, invalid timestamps)
- **THEN** system shows an error message and does not apply the subtitle file

### Requirement: Auto-match subtitle file
The system SHALL automatically load an SRT file with the same name as the audio file from the same directory.

#### Scenario: Auto-load matching subtitle
- **WHEN** user loads an audio file named "lesson1.mp3"
- **THEN** system checks for "lesson1.srt" in the same directory
- **THEN** if found, system loads and parses the subtitle file automatically

#### Scenario: No subtitle file found
- **WHEN** user loads an audio file with no matching SRT file
- **THEN** system proceeds without subtitle data
- **THEN** subtitle panel shows an empty state or "Load Subtitle" prompt

### Requirement: Manual subtitle loading
The system SHALL allow the user to manually load a subtitle file at any time.

#### Scenario: Load subtitle via menu
- **WHEN** user clicks "Load Subtitle" or presses a designated shortcut
- **THEN** system opens a file dialog filtered to subtitle files (.srt, .vtt)
- **THEN** system parses and applies the selected subtitle file

### Requirement: Synchronize subtitles with audio position
The system SHALL return the current subtitle entry based on the audio playback position.

#### Scenario: Subtitle follows playback
- **WHEN** audio playback position is within a subtitle entry's time range
- **THEN** system returns that entry as the current subtitle

#### Scenario: Between subtitles
- **WHEN** audio playback position is between two subtitle entries (gap)
- **THEN** system returns no current subtitle (null)
- **THEN** the previous subtitle remains dimly visible for context

### Requirement: Provide sentence data for navigation
The subtitle engine SHALL provide structured sentence data (index, start time, end time, text parts) for navigation and loop features.

#### Scenario: Get all sentences
- **WHEN** subtitle data is loaded
- **THEN** system provides an ordered list of all sentences with their timing and text data

#### Scenario: Find sentence by time
- **WHEN** given a time position
- **THEN** system returns the sentence containing that time, or the nearest sentence

### Requirement: Parse furigana syntax
The subtitle parser SHALL support an extended SRT syntax for furigana ruby text using the format `{kanji|reading}`.

#### Scenario: Parse text with furigana markup
- **WHEN** subtitle text contains `{今日|きょう}`
- **THEN** system parses this as a ruby segment with kanji="今日" and reading="きょう"

#### Scenario: Parse mixed text (plain + furigana)
- **WHEN** subtitle text contains mixed content like `{今日|きょう}はいい{天気|てき}ですね。`
- **THEN** system correctly splits into alternating text and ruby segments
