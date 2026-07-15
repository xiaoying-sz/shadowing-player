import React from 'react';
import { usePlayer } from '../context/PlayerContext';

const LOOP_LABELS: Record<string, string> = {
  off: '循环: 关',
  sentence: '循环: 单句',
  paragraph: '循环: 段落',
  ab: '循环: A-B',
};

const LOOP_SHORTCUTS: Record<string, string> = {
  off: '',
  sentence: '',
  paragraph: '',
  ab: ' (L)',
};

export function LoopModeSelector() {
  const { loopMode, cycleLoopMode, setAMarker, setBMarker, clearABMarkers } = usePlayer();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycleLoopMode}
        className={`px-3 py-1 text-xs rounded transition-all ${
          loopMode !== 'off'
            ? 'bg-amber-600 text-white font-medium'
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
        title="切换循环模式 (L)"
      >
        {LOOP_LABELS[loopMode]}{LOOP_SHORTCUTS[loopMode]}
      </button>

      {loopMode === 'ab' && (
        <>
          <button
            onClick={setAMarker}
            className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="设置 A 点"
          >
            Set A
          </button>
          <button
            onClick={setBMarker}
            className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="设置 B 点"
          >
            Set B
          </button>
          <button
            onClick={clearABMarkers}
            className="px-2 py-1 text-xs rounded text-gray-500 hover:text-white transition-colors"
            title="清除标记"
          >
            清除
          </button>
        </>
      )}
    </div>
  );
}
