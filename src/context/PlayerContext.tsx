import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { audioService } from '../services/AudioService';
import { loopService } from '../services/LoopService';
import { recorderService } from '../services/RecorderService';
import { parseSRT, getSentenceAtTime, findNearestSentence } from '../services/SubParser';

import type {
  SubtitleSentence,
  DisplayMode,
  LoopMode,
  SpeedLevel,
  RecordingState,
  FileResult,
  SubtitleFileResult,
  PlaylistItem,
} from '../types';

interface PlayerState {
  // Audio
  isLoaded: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: SpeedLevel;
  fileName: string;

  // Subtitle
  sentences: SubtitleSentence[];
  currentSentence: SubtitleSentence | null;
  displayMode: DisplayMode;
  showSubtitles: boolean;
  subtitleFileName: string;
  isSubtitleLoaded: boolean;

  // Loop
  loopMode: LoopMode;

  // Recording
  recordingState: RecordingState;
  recordingDelay: number;
  originalVolume: number;

  // Drag & drop
  isDragOver: boolean;

  // Playlist
  playlist: PlaylistItem[];
  currentPlaylistIndex: number;
  showPlaylist: boolean;
}

interface PlayerActions {
  loadAudio: () => Promise<void>;
  loadAudioFromPath: (filePath: string, fileName: string) => Promise<void>;
  loadFolder: () => Promise<void>;
  loadFolderFromPath: (folderPath: string) => Promise<void>;
  loadFolderBrowser: () => Promise<void>;
  playFromPlaylist: (index: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;
  togglePlaylist: () => void;
  setShowPlaylist: (show: boolean) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  seekRelative: (delta: number) => void;
  setSpeed: (speed: SpeedLevel) => void;
  cycleSpeed: () => void;

  loadSubtitle: () => Promise<void>;
  loadSubtitleFromContent: (content: string, fileName: string) => void;
  toggleSubtitles: () => void;
  setDisplayMode: (mode: DisplayMode) => void;

  navigatePrevSentence: () => void;
  navigateNextSentence: () => void;
  restartCurrentSentence: () => void;
  goToNextSentenceAndPlay: () => void;

  setLoopMode: (mode: LoopMode) => void;
  cycleLoopMode: () => void;
  setAMarker: () => void;
  setBMarker: () => void;
  clearABMarkers: () => void;

  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  setRecordingDelay: (delay: number) => void;
  setOriginalVolume: (vol: number) => void;
  exportRecording: (format: 'webm' | 'wav' | 'mp3' | 'm4a') => Promise<void>;

  setDragOver: (over: boolean) => void;
  handleDropFile: (filePath: string, fileName: string, file?: File) => Promise<void>;
  loadAudioFromFile: (file: File) => Promise<void>;
}

type PlayerContextType = PlayerState & PlayerActions;

const defaultState: PlayerState = {
  isLoaded: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1.0,
  fileName: '',

  sentences: [],
  currentSentence: null,
  displayMode: 'japanese',
  showSubtitles: true,
  subtitleFileName: '',
  isSubtitleLoaded: false,

  loopMode: 'off',

  recordingState: 'idle',
  recordingDelay: 400,
  originalVolume: 0.5,

  isDragOver: false,

  // Playlist
  playlist: [],
  currentPlaylistIndex: -1,
  showPlaylist: false,
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>(defaultState);
  const recordedBlobRef = useRef<Blob | null>(null);

  // Subscribe to audio service events
  useEffect(() => {
    const unsubTime = audioService.onTimeUpdate(() => {
      const time = audioService.currentTime;

      // Check loop
      const looped = loopService.check(time);
      if (looped) {
        audioService.seek(loopService.getLoopStart());
        audioService.play();
      }

      // Update current sentence - use functional setState to get latest sentences
      setState((prev) => {
        const sentence = prev.sentences.length > 0
          ? getSentenceAtTime(prev.sentences, time)
          : null;
        return {
          ...prev,
          currentTime: time,
          isPlaying: audioService.isPlaying,
          currentSentence: sentence,
        };
      });
    });

    const unsubEnded = audioService.onEnded(() => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    });

    const unsubLoad = audioService.onLoad(() => {
      setState((prev) => ({
        ...prev,
        isLoaded: true,
        duration: audioService.duration,
        isPlaying: true,
        currentTime: 0,
      }));
      // Auto-play when audio is loaded
      audioService.play();
    });

    // Recorder events
    recorderService.onStateChange((recordingState) => {
      setState((prev) => ({ ...prev, recordingState }));
    });

    recorderService.onDataAvailable((blob) => {
      recordedBlobRef.current = blob;
    });

    return () => {
      unsubTime();
      unsubEnded();
      unsubLoad();
    };
  }, []); // Run once on mount

  const loadAudio = useCallback(async () => {
    if (typeof window.electronAPI?.openAudio === 'function') {
      // Electron path: use native file dialog via IPC
      const result = await window.electronAPI.openAudio();
      if (!result) return;
      await loadAudioFromPath(result.path, result.name);
    } else {
      // Browser path: trigger file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/flac,.mp3,.m4a,.wav,.ogg,.flac';
      input.style.display = 'none';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (file) {
          await loadAudioFromFile(file);
        }
        document.body.removeChild(input);
      }, { once: true });
      document.body.appendChild(input);
      input.click();
    }
  }, []);

  const loadAudioFromPath = useCallback(async (filePath: string, fileName: string) => {
    try {
      // Read audio file via IPC (main process reads file, returns base64)
      const audioData = await window.electronAPI.readAudioFile(filePath);
      if (!audioData) {
        console.error('Failed to read audio file');
        return;
      }

      await audioService.loadFromBase64(audioData.base64, audioData.mime, fileName);
      setState((prev) => ({ ...prev, fileName }));

      // Auto-lookup subtitle
      const subResult = await window.electronAPI.getAutoSubtitle(filePath);
      if (subResult) {
        const sentences = parseSRT(subResult.content);
        loopService.setSentences(sentences);
        setState((prev) => ({
          ...prev,
          sentences,
          isSubtitleLoaded: true,
          subtitleFileName: subResult.name,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          sentences: [],
          isSubtitleLoaded: false,
          subtitleFileName: '',
        }));
      }
    } catch (err) {
      console.error('Failed to load audio:', err);
    }
  }, []);

  const togglePlay = useCallback(() => {
    audioService.togglePlay();
    setState((prev) => ({ ...prev, isPlaying: audioService.isPlaying }));
  }, []);

  const seek = useCallback((time: number) => {
    audioService.seek(time);
    audioService.play();
  }, []);

  const seekRelative = useCallback((delta: number) => {
    audioService.seekRelative(delta);
  }, []);

  const setSpeed = useCallback((speed: SpeedLevel) => {
    audioService.setSpeed(speed);
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const cycleSpeed = useCallback(() => {
    audioService.cycleSpeed();
    setState((prev) => ({ ...prev, speed: audioService.speed }));
  }, []);

  const loadSubtitle = useCallback(async () => {
    const result = await window.electronAPI.openSubtitle();
    if (!result) return;
    loadSubtitleFromContent(result.content, result.name);
  }, []);

  const loadSubtitleFromContent = useCallback((content: string, fileName: string) => {
    const sentences = parseSRT(content);
    loopService.setSentences(sentences);
    setState((prev) => ({
      ...prev,
      sentences,
      isSubtitleLoaded: true,
      subtitleFileName: fileName,
      currentSentence: null,
    }));
  }, []);

  const toggleSubtitles = useCallback(() => {
    setState((prev) => ({ ...prev, showSubtitles: !prev.showSubtitles }));
  }, []);

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setState((prev) => ({ ...prev, displayMode: mode }));
  }, []);

  // Navigation
  const navigatePrevSentence = useCallback(() => {
    if (state.sentences.length === 0) return;
    const idx = findNearestSentence(state.sentences, audioService.currentTime);
    const target = Math.max(0, idx - 1);
    audioService.seek(state.sentences[target].start);
    loopService.setCurrentSentenceIndex(target);
    setState((prev) => ({
      ...prev,
      currentSentence: state.sentences[target],
    }));
  }, [state.sentences]);

  const navigateNextSentence = useCallback(() => {
    if (state.sentences.length === 0) return;
    const idx = findNearestSentence(state.sentences, audioService.currentTime);
    const target = Math.min(state.sentences.length - 1, idx + 1);
    audioService.seek(state.sentences[target].start);
    loopService.setCurrentSentenceIndex(target);
    setState((prev) => ({
      ...prev,
      currentSentence: state.sentences[target],
    }));
  }, [state.sentences]);

  /** 后退: 如果在句子的前0.5秒内则跳到上一句, 否则回到当前句首 */
  const restartCurrentSentence = useCallback(() => {
    if (state.sentences.length === 0) return;
    const current = state.currentSentence;
    const now = audioService.currentTime;

    if (current) {
      const isNearStart = (now - current.start) < 1.0;
      if (isNearStart) {
        // 跳到上一句
        const idx = findNearestSentence(state.sentences, now);
        const target = Math.max(0, idx - 1);
        audioService.seek(state.sentences[target].start);
        audioService.play();
        loopService.setCurrentSentenceIndex(target);
        setState((prev) => ({
          ...prev,
          isPlaying: true,
          currentSentence: state.sentences[target],
        }));
      } else {
        // 回到当前句首
        audioService.seek(current.start);
        audioService.play();
        setState((prev) => ({ ...prev, isPlaying: true }));
      }
    } else {
      const idx = findNearestSentence(state.sentences, audioService.currentTime);
      audioService.seek(state.sentences[idx].start);
      loopService.setCurrentSentenceIndex(idx);
      audioService.play();
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        currentSentence: state.sentences[idx],
      }));
    }
  }, [state.sentences, state.currentSentence]);

  /** 前进: 跳到下一句并自动播放 */
  const goToNextSentenceAndPlay = useCallback(() => {
    if (state.sentences.length === 0) return;
    const idx = findNearestSentence(state.sentences, audioService.currentTime);
    const target = Math.min(state.sentences.length - 1, idx + 1);
    audioService.seek(state.sentences[target].start);
    audioService.play();
    loopService.setCurrentSentenceIndex(target);
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      currentSentence: state.sentences[target],
    }));
  }, [state.sentences]);

  // Loop
  const setLoopMode = useCallback((mode: LoopMode) => {
    loopService.setMode(mode);
    setState((prev) => ({ ...prev, loopMode: mode }));
  }, []);

  const cycleLoopMode = useCallback(() => {
    const newMode = loopService.cycleMode();
    setState((prev) => ({ ...prev, loopMode: newMode }));
  }, []);

  const setAMarker = useCallback(() => {
    loopService.setAMarker(audioService.currentTime);
  }, []);

  const setBMarker = useCallback(() => {
    loopService.setBMarker(audioService.currentTime);
  }, []);

  const clearABMarkers = useCallback(() => {
    loopService.clearABMarkers();
  }, []);

  // Recording
  const startRecording = useCallback(async () => {
    const success = await recorderService.start();
    if (success && state.recordingDelay > 0) {
      // Delay then auto-play
      setTimeout(() => {
        audioService.play();
      }, state.recordingDelay);
    }
  }, [state.recordingDelay]);

  const stopRecording = useCallback(() => {
    audioService.pause();
    recorderService.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    recorderService.cancel();
  }, []);

  const setRecordingDelay = useCallback((delay: number) => {
    setState((prev) => ({ ...prev, recordingDelay: delay }));
  }, []);

  const setOriginalVolume = useCallback((vol: number) => {
    setState((prev) => ({ ...prev, originalVolume: vol }));
  }, []);

  /** Decode WebM blob to AudioBuffer */
  const decodeBlob = useCallback(async (blob: Blob): Promise<AudioBuffer | null> => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();
      return audioBuffer;
    } catch (err) {
      console.error('Decode failed:', err);
      return null;
    }
  }, []);

  /** Convert float32 sample to int16 */
  function floatToInt16(sample: number): number {
    return Math.max(-32768, Math.min(32767, Math.round(sample * 32768)));
  }

  /** Encode float32 PCM samples as WAV (mono mixdown for simplicity) */
  function buildWav(audioBuffer: AudioBuffer): Uint8Array {
    const sr = audioBuffer.sampleRate;
    const ch = audioBuffer.numberOfChannels;
    const len = audioBuffer.length;
    const dataLen = len * 2; // 16-bit mono
    const buf = new ArrayBuffer(44 + dataLen);
    const v = new DataView(buf);
    const w = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + dataLen, true); w(8, 'WAVE');
    w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 1, true); // mono
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, dataLen, true);
    // Mix down to mono
    let off = 44;
    for (let i = 0; i < len; i++) {
      let s = 0;
      for (let c = 0; c < ch; c++) s += audioBuffer.getChannelData(c)[i];
      s /= ch;
      v.setInt16(off, floatToInt16(s), true);
      off += 2;
    }
    return new Uint8Array(buf);
  }

  const exportRecording = useCallback(async (format: 'webm' | 'wav' | 'mp3' | 'm4a') => {
    const blob = recordedBlobRef.current;
    if (!blob) return;

    // Force correct extension based on selected format
    const defaultName = `shadow-${Date.now()}.${format}`;
    const savePath = await window.electronAPI.saveAudio(defaultName);
    if (!savePath) return;

    // Force the file extension to match the selected format
    const dir = savePath.substring(0, savePath.lastIndexOf('\\'));
    const finalPath = `${dir}\\shadow-${Date.now()}.${format}`;

    if (format === 'webm') {
      const arrayBuffer = await blob.arrayBuffer();
      await window.electronAPI.writeFile(finalPath, new Uint8Array(arrayBuffer) as any);
      return;
    }

    // Decode WebM -> PCM -> WAV
    const audioBuffer = await decodeBlob(blob);
    if (!audioBuffer) return;

    const wavData = buildWav(audioBuffer);

    if (format === 'wav') {
      await window.electronAPI.writeFile(finalPath, wavData as any);
    } else {
      // MP3 or M4A: use ffmpeg in main process
      const result = await window.electronAPI.convertAudio(
        Array.from(wavData),
        finalPath,
        format,
      );
      if (!result) {
        console.error(`${format} conversion failed, falling back to WAV`);
        const fallbackPath = finalPath.replace(/\.(mp3|m4a)$/i, '.wav');
        await window.electronAPI.writeFile(fallbackPath, wavData as any);
      }
    }
  }, []);

  // Drag & drop
  const setDragOver = useCallback((over: boolean) => {
    setState((prev) => ({ ...prev, isDragOver: over }));
  }, []);

  // --- Playlist ---
  const loadFolder = useCallback(async () => {
    if (typeof window.electronAPI?.openFolder !== 'function') return;
    const folderPath = await window.electronAPI.openFolder();
    if (!folderPath) return;
    await loadFolderFromPath(folderPath);
  }, []);

  const loadFolderFromPath = useCallback(async (folderPath: string) => {
    const files = typeof window.electronAPI?.scanAudioFolder === 'function'
      ? await window.electronAPI.scanAudioFolder(folderPath)
      : [];

    if (files.length === 0) return;

    const playlist: PlaylistItem[] = files.map((f, i) => ({
      path: f.path,
      name: f.name,
      index: i,
    }));

    setState((prev) => ({
      ...prev,
      playlist,
      currentPlaylistIndex: 0,
      showPlaylist: true,
    }));

    // Auto-play first file
    await loadAudioFromPath(playlist[0].path, playlist[0].name);
  }, [loadAudioFromPath]);

  /** Browser mode: load folder via directory picker */
  const loadFolderBrowser = useCallback(async () => {
    try {
      // Use modern showDirectoryPicker if available
      const handle = await (window as any).showDirectoryPicker();
      const files: PlaylistItem[] = [];
      const audioExts = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.flac']);
      let idx = 0;
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const name = entry.name;
          const ext = '.' + name.split('.').pop()?.toLowerCase();
          if (audioExts.has(ext)) {
            const file = await entry.getFile();
            files.push({ path: URL.createObjectURL(file), name, index: idx++ });
          }
        }
      }
      if (files.length === 0) return;
      files.sort((a, b) => a.name.localeCompare(b.name));
      // Reset indices after sort
      files.forEach((f, i) => { f.index = i; });

      setState((prev) => ({
        ...prev,
        playlist: files,
        currentPlaylistIndex: 0,
        showPlaylist: true,
      }));

      // Load first file
      const file = await (await fetch(files[0].path)).blob();
      const url = URL.createObjectURL(file);
      await audioService.loadFromUrl(url, files[0].name);
      setState((prev) => ({ ...prev, fileName: files[0].name }));
    } catch {
      // User cancelled or API not available
    }
  }, []);

  const playFromPlaylist = useCallback(async (index: number) => {
    const { playlist } = state;
    if (index < 0 || index >= playlist.length) return;

    setState((prev) => ({ ...prev, currentPlaylistIndex: index }));

    const item = playlist[index];
    if (item.path.startsWith('blob:')) {
      // Browser mode blob URL
      const resp = await fetch(item.path);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      await audioService.loadFromUrl(url, item.name);
    } else {
      await loadAudioFromPath(item.path, item.name);
    }
    setState((prev) => ({ ...prev, fileName: item.name }));
  }, [state.playlist, loadAudioFromPath]);

  const playNext = useCallback(async () => {
    const { playlist, currentPlaylistIndex } = state;
    if (currentPlaylistIndex < playlist.length - 1) {
      await playFromPlaylist(currentPlaylistIndex + 1);
    }
  }, [state, playFromPlaylist]);

  const playPrev = useCallback(async () => {
    const { playlist, currentPlaylistIndex } = state;
    if (currentPlaylistIndex > 0) {
      await playFromPlaylist(currentPlaylistIndex - 1);
    }
  }, [state, playFromPlaylist]);

  const togglePlaylist = useCallback(() => {
    setState((prev) => ({ ...prev, showPlaylist: !prev.showPlaylist }));
  }, []);

  const setShowPlaylist = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showPlaylist: show }));
  }, []);

  /** Load audio from a File object (used by browser drop zone and file input) */
  const loadAudioFromFile = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      await audioService.loadFromUrl(url, file.name);
      setState((prev) => ({ ...prev, fileName: file.name }));
    } catch (err) {
      console.error('Failed to load audio:', err);
    }
  }, []);

  const handleDropFile = useCallback(async (filePath: string, fileName: string, file?: File) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp3', 'm4a', 'wav', 'ogg', 'flac'].includes(ext || '')) {
      if (file) {
        // Browser drop: use File object directly
        await loadAudioFromFile(file);
      } else {
        // Electron drop: use IPC path
        await loadAudioFromPath(filePath, fileName);
      }
    } else if (['srt', 'vtt'].includes(ext || '')) {
      if (file) {
        const content = await file.text();
        loadSubtitleFromContent(content, fileName);
      } else {
        const content = await window.electronAPI.readFile(filePath);
        if (content) {
          loadSubtitleFromContent(content, fileName);
        }
      }
    }
  }, [loadAudioFromPath, loadSubtitleFromContent, loadAudioFromFile]);

  const value: PlayerContextType = {
    ...state,
    loadAudio,
    loadAudioFromPath,
    loadAudioFromFile,
    togglePlay,
    seek,
    seekRelative,
    setSpeed,
    cycleSpeed,
    loadSubtitle,
    loadSubtitleFromContent,
    toggleSubtitles,
    setDisplayMode,
    navigatePrevSentence,
    navigateNextSentence,
    restartCurrentSentence,
    goToNextSentenceAndPlay,
    setLoopMode,
    cycleLoopMode,
    setAMarker,
    setBMarker,
    clearABMarkers,
    startRecording,
    stopRecording,
    cancelRecording,
    setRecordingDelay,
    setOriginalVolume,
    exportRecording,
    setDragOver,
    handleDropFile,
    loadFolder,
    loadFolderFromPath,
    loadFolderBrowser,
    playFromPlaylist,
    playNext,
    playPrev,
    togglePlaylist,
    setShowPlaylist,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return ctx;
}
