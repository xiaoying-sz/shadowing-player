## ADDED Requirements

### Requirement: Render furigana ruby text
The system SHALL render Japanese kanji with furigana readings using HTML ruby annotation when subtitle data contains the `{kanji|reading}` format.

#### Scenario: Display ruby text
- **WHEN** a subtitle sentence contains ruby segments (e.g., `{今日|きょう}`)
- **THEN** system renders the kanji with furigana printed above it in smaller type
- **THEN** rendering uses HTML `<ruby><rb>今日</rb><rt>きょう</rt></ruby>` structure

#### Scenario: Mixed ruby and plain text
- **WHEN** a subtitle sentence contains both ruby-marked and plain segments
- **THEN** system renders ruby segments with furigana and plain segments as normal text
- **THEN** the overall text flows naturally as a single line

### Requirement: Toggle furigana visibility
The system SHALL allow the user to show or hide furigana ruby text.

#### Scenario: Hide furigana
- **WHEN** user toggles furigana off
- **THEN** system hides the ruby text readings
- **THEN** kanji characters remain visible without readings above them

#### Scenario: Show furigana
- **WHEN** user toggles furigana on
- **THEN** system displays ruby text readings above kanji characters

### Requirement: Subtitle display mode switching
The system SHALL support multiple display modes for subtitle text.

#### Scenario: Cycle through display modes
- **WHEN** user presses M key or clicks the display mode button
- **THEN** system cycles through available modes

#### Scenario: Mode 1 — 日本語 only
- **WHEN** display mode is set to "日本語"
- **THEN** system shows only the Japanese text line (with optional furigana)

#### Scenario: Mode 2 — 日本語 + ローマ字
- **WHEN** display mode is set to "日本語 + ローマ字"
- **THEN** system shows the Japanese text line followed by its romaji (Latin alphabet) representation on a second line

#### Scenario: Mode 3 — 日本語 + 中文訳
- **WHEN** display mode is set to "日本語 + 中文訳"
- **THEN** system shows the Japanese text line followed by its Chinese translation on a second line

#### Scenario: Mode 4 — 全部表示 (all)
- **WHEN** display mode is set to "全部表示"
- **THEN** system shows all three lines stacked: Japanese text, romaji, and Chinese translation

### Requirement: Subtitle source format for multi-mode display
The SRT text SHALL use pipe character `|` to separate Japanese text, romaji, and Chinese translation for multi-mode display.

#### Scenario: Parse multi-line SRT entry
- **WHEN** an SRT subtitle entry contains: `{今日|きょう}はいい天気ですね。|Kyou wa ii tenki desu ne.|今天天气真好呢。`
- **THEN** system splits by `|` and assigns:
  - Part 1: Japanese text with furigana markers
  - Part 2: Romaji transliteration
  - Part 3: Chinese translation

### Requirement: Toggle subtitle visibility
The system SHALL allow the user to completely show or hide the subtitle panel.

#### Scenario: Hide subtitles
- **WHEN** user presses S key or clicks the hide button
- **THEN** system hides the entire subtitle panel
- **THEN** audio playback continues unaffected

#### Scenario: Show subtitles
- **WHEN** user presses S key or clicks the show button while subtitles are hidden
- **THEN** system shows the subtitle panel again
- **THEN** subtitles sync to the current playback position

### Requirement: Subtitle loading state indicator
The system SHALL indicate whether subtitles are currently loaded.

#### Scenario: Subtitles loaded
- **WHEN** subtitles are loaded
- **THEN** system shows a "Subtitles: Loaded" indicator or similar visual cue

#### Scenario: No subtitles
- **WHEN** no subtitles are loaded
- **THEN** system shows a "No subtitles" or "Load subtitle" prompt
- **THEN** all other subtitle controls are hidden or disabled
