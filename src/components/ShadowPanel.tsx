import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { recorderService } from '../services/RecorderService';

type ExportFormat = 'webm' | 'wav' | 'mp3' | 'm4a';

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

  const [exportFormat, setExportFormat] = useState<ExportFormat>('webm');

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
                ? 'bg-[#007d55] text-white hover:bg-[#006b48]'
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">导出格式:</span>
              <button onClick={() => setExportFormat('webm')}
                className={`px-2 py-0.5 text-xs rounded transition-all ${exportFormat === 'webm' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>WebM</button>
              <button onClick={() => setExportFormat('wav')}
                className={`px-2 py-0.5 text-xs rounded transition-all ${exportFormat === 'wav' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>WAV</button>
              <button onClick={() => setExportFormat('mp3')}
                className={`px-2 py-0.5 text-xs rounded transition-all ${exportFormat === 'mp3' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>MP3</button>
              <button onClick={() => setExportFormat('m4a')}
                className={`px-2 py-0.5 text-xs rounded transition-all ${exportFormat === 'm4a' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>M4A</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportRecording(exportFormat)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                导出 ({exportFormat.toUpperCase()})
              </button>
              <button
                onClick={cancelRecording}
                className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 w-20">录音质量</label>
          <button
            onClick={() => recorderService.setHighQuality(false)}
            className={`px-2 py-0.5 text-xs rounded transition-all ${!recorderService.highQuality ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          >
            标准
          </button>
          <button
            onClick={() => recorderService.setHighQuality(true)}
            className={`px-2 py-0.5 text-xs rounded transition-all ${recorderService.highQuality ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          >
            高质量
          </button>
        </div>
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
