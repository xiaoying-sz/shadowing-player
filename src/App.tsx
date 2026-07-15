import React, { useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { TitleBar } from './components/TitleBar';
import { DropZone } from './components/DropZone';
import { TransportControls } from './components/TransportControls';
import { ProgressBar } from './components/ProgressBar';
import { SpeedSelector } from './components/SpeedSelector';
import { SubtitlePanel } from './components/SubtitlePanel';
import { DisplayModeSelector } from './components/DisplayModeSelector';
import { LoopModeSelector } from './components/LoopModeSelector';
import { ShadowPanel } from './components/ShadowPanel';

function AppContent() {
  const {
    isLoaded,
    fileName,
    isSubtitleLoaded,
    showSubtitles,
    showFurigana,
    toggleSubtitles,
    toggleFurigana,
    loadAudio,
    loadAudioFromFile,
    loadSubtitle,
    handleDropFile,
    navigatePrevSentence,
    navigateNextSentence,
    togglePlay,
    cycleSpeed,
    cycleLoopMode,
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
          // Seek backward 5s handled in TransportControls via context
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
        case 'KeyS':
          e.preventDefault();
          toggleSubtitles();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFurigana();
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
    toggleFurigana,
    navigatePrevSentence,
    navigateNextSentence,
    cycleLoopMode,
    cycleSpeed,
    startRecording,
    stopRecording,
    recordingState,
  ]);

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <TitleBar fileName={isLoaded ? fileName : undefined} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isLoaded ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <DropZone
              onDrop={handleDropFile}
              onOpenAudio={loadAudio}
              onFileSelected={!isElectron ? loadAudioFromFile : undefined}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            {/* Subtitle panel */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <DisplayModeSelector />
                  <button
                    onClick={toggleFurigana}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      showFurigana
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="切换振假名显示 (F)"
                  >
                    振假名
                  </button>
                  <button
                    onClick={toggleSubtitles}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      showSubtitles
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="切换字幕显示 (S)"
                  >
                    字幕
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {isSubtitleLoaded ? (
                    <button
                      onClick={loadSubtitle}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      重新加载字幕
                    </button>
                  ) : (
                    <button
                      onClick={loadSubtitle}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      加载字幕
                    </button>
                  )}
                </div>
              </div>

              {/* Subtitle panel */}
              <SubtitlePanel />
            </div>

            {/* Bottom controls */}
            <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur">
              <div className="py-2">
                <ProgressBar />
              </div>

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
        )}
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
