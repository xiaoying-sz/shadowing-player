import { useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { TitleBar } from './components/TitleBar';
import { DropZone } from './components/DropZone';
import { TransportControls } from './components/TransportControls';
import { ProgressBar } from './components/ProgressBar';
import { SpeedSelector } from './components/SpeedSelector';
import { SubtitlePanel } from './components/SubtitlePanel';
import { LoopModeSelector } from './components/LoopModeSelector';
import { ShadowPanel } from './components/ShadowPanel';
import { Playlist } from './components/Playlist';

function AppContent() {
  const {
    isLoaded,
    fileName,
    isDragOver,
    showSubtitles,
    toggleSubtitles,
    loadAudio,
    loadSubtitle,
    handleDropFile,
    setDragOver,
    navigatePrevSentence,
    navigateNextSentence,
    togglePlay,
    cycleSpeed,
    cycleLoopMode,
    showPlaylist,
    togglePlaylist,
    loadFolder,
    loadFolderBrowser,
    playNext,
    playPrev,
    startRecording,
    recordingState,
    stopRecording,
  } = usePlayer();

  const isElectron = typeof window !== 'undefined' &&
    typeof (window as any).electronAPI !== 'undefined';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          break;
        case 'ArrowRight':
          e.preventDefault();
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigatePrevSentence();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateNextSentence();
          break;
        case 'KeyO':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            loadAudio();
          }
          break;
        case 'KeyS':
          e.preventDefault();
          toggleSubtitles();
          break;

        case 'KeyL':
          e.preventDefault();
          cycleLoopMode();
          break;
        case 'KeyR':
          e.preventDefault();
          if (recordingState === 'idle') {
            startRecording();
          } else if (recordingState === 'recording') {
            stopRecording();
          }
          break;
        case 'KeyN':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case 'KeyP':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            playPrev();
          }
          break;
        case 'Digit1': case 'Digit2': case 'Digit3':
        case 'Digit4': case 'Digit5': case 'Digit6': case 'Digit7':
          {
            const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
            const idx = parseInt(e.key) - 1;
            if (idx >= 0 && idx < speeds.length) {
              cycleSpeed();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    toggleSubtitles,
    navigatePrevSentence,
    navigateNextSentence,
    cycleLoopMode,
    cycleSpeed,
    startRecording,
    stopRecording,
    recordingState,
    loadAudio,
    playNext,
    playPrev,
  ]);

  if (!isLoaded) {
    return (
      <div
        className="flex h-screen flex-col bg-gray-950"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) {
            const path = (file as any).path || file.name;
            handleDropFile(path, file.name, file);
          }
        }}
      >
        <TitleBar onOpenFile={loadAudio} />
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-900/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 rounded-full bg-blue-500/30 p-6">
                <svg className="h-10 w-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l-5 5m5-5l5 5" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white">释放以加载音频文件</h3>
            </div>
          </div>
        )}
        <div className="flex flex-1 flex-col items-center justify-center p-8 gap-4">
          <DropZone
            onDrop={handleDropFile}
            onOpenAudio={loadAudio}
          />
          <button
            onClick={isElectron ? loadFolder : loadFolderBrowser}
            className="rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
          >
            📁 加载文件夹
          </button>
        </div>
      </div>
    );
  }

  // Player view
  return (
    <div
      className="flex h-screen flex-col bg-gray-950"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          const path = (file as any).path || file.name;
          handleDropFile(path, file.name, file);
        }
      }}
    >
      <TitleBar fileName={fileName} onOpenFile={loadAudio} />
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-900/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-4 rounded-full bg-blue-500/30 p-6">
              <svg className="h-10 w-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l-5 5m5-5l5 5" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white">释放以加载音频文件</h3>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <button onClick={loadAudio}
              className="px-2 py-1 text-xs rounded bg-[#007d55] text-white hover:bg-[#006b48] transition-colors"
              title="打开新音频文件 (Ctrl+O)">打开文件</button>
            <button onClick={togglePlaylist}
              className={`px-2 py-1 text-xs rounded transition-all ${showPlaylist ? 'bg-[#007d55] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="切换播放列表">列表</button>
            <button onClick={toggleSubtitles}
              className={`px-2 py-1 text-xs rounded transition-all ${showSubtitles ? 'bg-[#007d55] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="切换字幕显示 (S)">字幕</button>
          </div>
          <button onClick={loadSubtitle}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors">加载字幕</button>
        </div>

        {/* Content area with playlist sidebar */}
        <div className="flex flex-1 min-h-0">
          <Playlist />
          <div className="flex flex-1 flex-col min-w-0">
            <SubtitlePanel />
            <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur">
              <div className="py-2"><ProgressBar /></div>
              <div className="px-4 pb-3 space-y-2">
                <TransportControls />
                <div className="flex items-center justify-between">
                  <SpeedSelector />
                  <LoopModeSelector />
                </div>
                <ShadowPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
