import type { SubtitleSentence, SubtitlePart } from '../types';

/**
 * Parse SRT format text into SubtitleSentence[].
 * Supports:
 *   - Standard SRT timing (00:00:00,000 --> 00:00:00,000)
 *   - Furigana syntax: {漢字|よみ}
 *   - Pipe-delimited display lines: 日本語|romaji|中文訳
 */
export function parseSRT(content: string): SubtitleSentence[] {
  const blocks = content.trim().replace(/\r\n/g, '\n').split(/\n\n+/);
  const sentences: SubtitleSentence[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;

    const index = parseInt(lines[0], 10);
    if (isNaN(index)) continue;

    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );
    if (!timeMatch) continue;

    const start = toSeconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
    const end = toSeconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);

    const textLines = lines.slice(2).filter((l) => l.trim());
    const rawText = textLines.join('\n');

    const parts = textLines.map((line) => parseLine(line));

    sentences.push({
      index,
      start,
      end,
      parts,
      text: rawText,
    });
  }

  return sentences;
}

function toSeconds(h: string, m: string, s: string, ms: string): number {
  return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10) + parseInt(ms, 10) / 1000;
}

/**
 * Parse a single subtitle line into SubtitlePart[].
 * Handles {漢字|よみ} ruby syntax and pipe-delimited display data.
 */
function parseLine(line: string): SubtitlePart[] {
  // Check if line has pipe-delimited display modes
  const pipeParts = line.split('|').map((s) => s.trim());
  const mainText = pipeParts[0];

  const parts: SubtitlePart[] = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(mainText)) !== null) {
    // Text before this ruby segment
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: mainText.slice(lastIndex, match.index),
      });
    }

    // Ruby segment: {kanji|reading}
    const inner = match[1];
    const pipeIdx = inner.indexOf('|');
    if (pipeIdx > 0) {
      parts.push({
        type: 'ruby',
        text: inner.slice(0, pipeIdx),
        ruby: inner.slice(pipeIdx + 1),
        romaji: pipeParts.length > 1 ? pipeParts[1] : undefined,
        translation: pipeParts.length > 2 ? pipeParts[2] : undefined,
      });
    } else {
      parts.push({ type: 'text', text: inner });
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < mainText.length) {
    parts.push({
      type: 'text',
      text: mainText.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Find the current sentence by timestamp.
 */
export function getSentenceAtTime(
  sentences: SubtitleSentence[],
  time: number
): SubtitleSentence | null {
  // Binary search for the sentence containing `time`
  let low = 0;
  let high = sentences.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const s = sentences[mid];

    if (time >= s.start && time < s.end) {
      return s;
    }
    if (time < s.start) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return null;
}

/**
 * Find the nearest sentence index to the given time.
 */
export function findNearestSentence(
  sentences: SubtitleSentence[],
  time: number
): number {
  if (sentences.length === 0) return -1;

  let closest = 0;
  let minDiff = Infinity;

  for (let i = 0; i < sentences.length; i++) {
    const diff = Math.abs(sentences[i].start - time);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}
