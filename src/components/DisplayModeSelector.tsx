import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import type { DisplayMode } from '../types';

const MODES: { value: DisplayMode; label: string }[] = [
  { value: 'japanese', label: '日本語' },
  { value: 'japanese-romaji', label: '+ローマ字' },
  { value: 'japanese-chinese', label: '+中文訳' },
  { value: 'all', label: '全部表示' },
];

export function DisplayModeSelector() {
  const { displayMode, setDisplayMode } = usePlayer();

  return (
    <div className="flex items-center gap-1">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setDisplayMode(mode.value)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            displayMode === mode.value
              ? 'bg-emerald-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
