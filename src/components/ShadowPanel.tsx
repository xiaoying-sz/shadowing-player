import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export function ShadowPanel() {
  const {
    recordingState,
    recordingDelay,
    originalVolume,
    startRecording,
    stopRecording,
    cancelRecording,
    setRecordingDelay,
    setOriginalVolume,
    exportRecording,
    isLoaded,
  } = usePlayer();

  return (
    <div className="rounded-lg bg-gray-800/80 border border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
        影子跟读录音
      </h3>

      {/* Recording controls */}
      <div className="flex items-center gap-2 mb-3">
        {recordingState === 'idle' && (
          <button
            onClick={startRecording}
            disabled={!isLoaded}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              isLoaded
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
            开始录音 (R)
          </button>
        )}

        {recordingState === 'recording' && (
          <>
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-all animate-pulse"
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              停止录音
            </button>
            <button
              onClick={cancelRecording}
              className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          </>
        )}

        {recordingState === 'done' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportRecording('voice')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              导出纯人声
            </button>
            <button
              onClick={() => exportRecording('mixed')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              导出混合对比
            </button>
            <button
              onClick={cancelRecording}
              className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              清除
            </button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 w-20">延迟: {recordingDelay}ms</label>
          <input
            type="range"
            min={200}
            max={1000}
            step={50}
            value={recordingDelay}
            onChange={(e) => setRecordingDelay(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none bg-gray-600 cursor-pointer accent-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 w-20">原声: {Math.round(originalVolume * 100)}%</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={originalVolume}
            onChange={(e) => setOriginalVolume(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none bg-gray-600 cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {recordingState === 'recording' && (
        <div className="mt-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400">录音中...</span>
        </div>
      )}
    </div>
  );
}
