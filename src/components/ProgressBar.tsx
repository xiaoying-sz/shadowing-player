import React, { useCallback, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProgressBar() {
  const { currentTime, duration, seek } = usePlayer();
  const barRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      seek(ratio * duration);
    },
    [duration, seek]
  );

  return (
    <div className="flex items-center gap-3 px-4">
      <span className="text-xs text-gray-500 font-mono w-10 text-right">
        {formatTime(currentTime)}
      </span>
      <div
        ref={barRef}
        onClick={handleClick}
        className="relative flex-1 h-2 bg-gray-700 rounded-full cursor-pointer group"
      >
        <div
          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <span className="text-xs text-gray-500 font-mono w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
}
