// ------------------------
// Electron API
// ------------------------
export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
  openAudio: () => Promise<FileResult | null>;
  openSubtitle: () => Promise<SubtitleFileResult | null>;
  saveAudio: (defaultName: string) => Promise<string | null>;
  openFolder: () => Promise<string | null>;
  scanAudioFolder: (folderPath: string) => Promise<FileResult[]>;
  readFile: (filePath: string) => Promise<string | null>;
  readAudioFile: (filePath: string) => Promise<{ base64: string; mime: string; fileName: string } | null>;
  writeFile: (filePath: string, data: Buffer) => Promise<boolean>;
  convertAudio: (data: number[], savePath: string, format: string) => Promise<boolean>;
  getAutoSubtitle: (audioPath: string) => Promise<SubtitleFileResult | null>;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
}

export interface FileResult {
  path: string;
  name: string;
}

export interface SubtitleFileResult extends FileResult {
  content: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// ------------------------
// Subtitle Data Model
// ------------------------
export interface SubtitlePart {
  type: 'text' | 'ruby';
  text: string;
  ruby?: string;
  romaji?: string;
  translation?: string;
}

export interface SubtitleSentence {
  index: number;
  start: number;
  end: number;
  parts: SubtitlePart[][]; // [line][segment]
  text: string;
}

export type DisplayMode = 'japanese' | 'japanese-romaji' | 'japanese-chinese' | 'all';

// ------------------------
// Audio / Loop
// ------------------------
export type LoopMode = 'off' | 'sentence' | 'paragraph' | 'ab';

export interface LoopState {
  mode: LoopMode;
  sentenceStart: number;
  sentenceEnd: number;
  paragraphSentences: number[];
  aStart: number;
  aEnd: number;
}

export type SpeedLevel = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0;

export const SPEED_PRESETS: SpeedLevel[] = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

// ------------------------
// Recording
// ------------------------
export type RecordingState = 'idle' | 'recording' | 'done';

export interface RecordingResult {
  blob: Blob;
  duration: number;
}

// ------------------------
// Playlist
// ------------------------
export interface PlaylistItem {
  path: string;
  name: string;
  index: number;
}
