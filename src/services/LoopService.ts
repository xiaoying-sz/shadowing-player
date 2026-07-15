import type { LoopMode, SubtitleSentence } from '../types';

export class LoopService {
  private mode: LoopMode = 'off';
  private sentences: SubtitleSentence[] = [];
  private currentSentenceIndex = -1;
  private paragraphRange = 3; // sentences per paragraph
  private aStart = 0;
  private aEnd = 0;
  private aMarkerSet = false;

  // Callbacks
  private onLoopRestart: (() => void) | null = null;

  setMode(mode: LoopMode): void {
    this.mode = mode;
  }

  getMode(): LoopMode {
    return this.mode;
  }

  setSentences(sentences: SubtitleSentence[]): void {
    this.sentences = sentences;
  }

  setCurrentSentenceIndex(index: number): void {
    this.currentSentenceIndex = index;
  }

  onRestart(cb: () => void): void {
    this.onLoopRestart = cb;
  }

  /**
   * Called on each time update. Returns true if position was reset (looped).
   */
  check(currentTime: number): boolean {
    if (this.mode === 'off' || this.sentences.length === 0) return false;

    switch (this.mode) {
      case 'sentence':
        return this.checkSentenceLoop(currentTime);
      case 'paragraph':
        return this.checkParagraphLoop(currentTime);
      case 'ab':
        return this.checkABLoop(currentTime);
    }
    return false;
  }

  private checkSentenceLoop(currentTime: number): boolean {
    if (this.currentSentenceIndex < 0 || this.currentSentenceIndex >= this.sentences.length) {
      return false;
    }
    const sentence = this.sentences[this.currentSentenceIndex];
    if (currentTime >= sentence.end) {
      this.onLoopRestart?.();
      return true;
    }
    return false;
  }

  private checkParagraphLoop(currentTime: number): boolean {
    if (this.currentSentenceIndex < 0) return false;

    const endIdx = Math.min(
      this.currentSentenceIndex + this.paragraphRange - 1,
      this.sentences.length - 1
    );
    const endTime = this.sentences[endIdx].end;

    if (currentTime >= endTime) {
      this.onLoopRestart?.();
      return true;
    }
    return false;
  }

  private checkABLoop(currentTime: number): boolean {
    if (!this.aMarkerSet) return false;
    if (currentTime >= this.aEnd) {
      this.onLoopRestart?.();
      return true;
    }
    return false;
  }

  getLoopStart(): number {
    switch (this.mode) {
      case 'sentence':
        if (this.currentSentenceIndex >= 0 && this.currentSentenceIndex < this.sentences.length) {
          return this.sentences[this.currentSentenceIndex].start;
        }
        return 0;
      case 'paragraph':
        if (this.currentSentenceIndex >= 0) {
          return this.sentences[this.currentSentenceIndex].start;
        }
        return 0;
      case 'ab':
        return this.aStart;
      default:
        return 0;
    }
  }

  getLoopEnd(): number {
    switch (this.mode) {
      case 'sentence':
        if (this.currentSentenceIndex >= 0 && this.currentSentenceIndex < this.sentences.length) {
          return this.sentences[this.currentSentenceIndex].end;
        }
        return 0;
      case 'paragraph':
        if (this.currentSentenceIndex >= 0) {
          const endIdx = Math.min(
            this.currentSentenceIndex + this.paragraphRange - 1,
            this.sentences.length - 1
          );
          return this.sentences[endIdx].end;
        }
        return 0;
      case 'ab':
        return this.aEnd;
      default:
        return 0;
    }
  }

  // A-B marker management
  setAMarker(time: number): void {
    this.aStart = time;
    this.aMarkerSet = false;
  }

  setBMarker(time: number): void {
    this.aEnd = time;
    if (this.aEnd > this.aStart) {
      this.aMarkerSet = true;
    }
  }

  hasABMarkers(): boolean {
    return this.aMarkerSet;
  }

  clearABMarkers(): void {
    this.aMarkerSet = false;
    this.aStart = 0;
    this.aEnd = 0;
  }

  cycleMode(): LoopMode {
    const modes: LoopMode[] = ['off', 'sentence', 'paragraph', 'ab'];
    const idx = modes.indexOf(this.mode);
    this.mode = modes[(idx + 1) % modes.length];
    return this.mode;
  }
}

export const loopService = new LoopService();
