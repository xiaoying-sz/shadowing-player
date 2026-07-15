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
  showFurigana: boolean;
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
}

interface PlayerActions {
  loadAudio: () => Promise<void>;
  loadAudioFromPath: (filePath: string, fileName: string) => Promise<void>;
  togglePlay: () => void;
  seek: (time: number) => void;
  seekRelative: (delta: number) => void;
  setSpeed: (speed: SpeedLevel) => void;
  cycleSpeed: () => void;

  loadSubtitle: () => Promise<void>;
  loadSubtitleFromContent: (content: string, fileName: string) => void;
  toggleSubtitles: () => void;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleFurigana: () => void;

  navigatePrevSentence: () => void;
  navigateNextSentence: () => void;

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
  exportRecording: (type: 'voice' | 'mixed') => Promise<void>;

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
  showFurigana: true,
  showSubtitles: true,
  subtitleFileName: '',
  isSubtitleLoaded: false,

  loopMode: 'off',

  recordingState: 'idle',
  recordingDelay: 400,
  originalVolume: 0.5,

  isDragOver: false,
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
        isPlaying: false,
        currentTime: 0,
      }));
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
    // Electron path: use native file dialog via IPC
    const result = await window.electronAPI.openAudio();
    if (!result) return;
    await loadAudioFromPath(result.path, result.name);
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

  const toggleFurigana = useCallback(() => {
    setState((prev) => ({ ...prev, showFurigana: !prev.showFurigana }));
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

  const exportRecording = useCallback(async (_type: 'voice' | 'mixed') => {
    const blob = recordedBlobRef.current;
    if (!blob) return;

    const defaultName = `shadow-${Date.now()}.wav`;
    const savePath = await window.electronAPI.saveAudio(defaultName);
    if (!savePath) return;

    // For MVP: save the blob directly (WebM format)
    // Post-MVP: convert to WAV via OfflineAudioContext for mixed export
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await window.electronAPI.writeFile(savePath, buffer as unknown as Buffer);
  }, []);

  // Drag & drop
  const setDragOver = useCallback((over: boolean) => {
    setState((prev) => ({ ...prev, isDragOver: over }));
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
    toggleFurigana,
    navigatePrevSentence,
    navigateNextSentence,
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
