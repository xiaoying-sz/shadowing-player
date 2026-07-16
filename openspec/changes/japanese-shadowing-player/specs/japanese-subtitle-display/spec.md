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

### ~~Requirement: Toggle furigana visibility~~ **REMOVED**
Furigana ruby text is **always visible**. The toggle button and F key shortcut have been removed.

### ~~Requirement: Subtitle display mode switching~~ **REMOVED**
Display mode selector (日本語 / +ローマ字 / +中文訳 / 全部表示) has been removed. Subtitles always display in pure Japanese mode. The DisplayModeSelector component and related CSS classes have been deleted.

### Requirement: Subtitle source format
SRT files may still use pipe character `|` to delimit Japanese text, romaji, and Chinese translation. The parser stores all segments, but the display always renders the Japanese portion.

#### Scenario: Parse multi-line SRT entry
- **WHEN** an SRT subtitle entry contains: `{今日|きょう}はいい天気ですね。|Kyou wa ii tenki desu ne.|今天天气真好呢。`
- **THEN** system splits by `|` and stores all parts in SubtitlePart
- **THEN** only the first segment (Japanese text with furigana) is displayed

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
