
import type { SubtitlePart, DisplayMode } from '../types';

interface RubyTextProps {
  parts: SubtitlePart[];
  displayMode: DisplayMode;
}

export function RubyText({ parts, displayMode }: RubyTextProps) {
  return (
    <span className="ruby-text">
      {parts.map((part, i) => {
        if (part.type === 'ruby') {
          const showRuby = part.ruby != null;
          return (
            <ruby key={i} className="ruby">
              {part.text}
              {showRuby && <rp>(</rp>}
              {showRuby && <rt className="text-blue-300 text-xs">{part.ruby}</rt>}
              {showRuby && <rp>)</rp>}
              {renderExtra(part, displayMode)}
            </ruby>
          );
        }
        return (
          <span key={i}>
            {part.text}
          </span>
        );
      })}
    </span>
  );
}

function renderExtra(part: SubtitlePart, mode: DisplayMode) {
  switch (mode) {
    case 'japanese':
      return null;
    case 'japanese-romaji':
      return part.romaji ? <span className="text-gray-400 text-xs ml-1">({part.romaji})</span> : null;
    case 'japanese-chinese':
      return part.translation ? <span className="text-gray-400 text-xs ml-1">({part.translation})</span> : null;
    case 'all':
      return (
        <span className="text-gray-400 text-xs ml-1">
          {part.romaji && <span>{part.romaji} </span>}
          {part.translation && <span>({part.translation})</span>}
        </span>
      );
    default:
      return null;
  }
}
