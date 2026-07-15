import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { RubyText } from './RubyText';

export function SubtitlePanel() {
  const {
    sentences,
    currentSentence,
    displayMode,
    showFurigana,
    showSubtitles,
    isSubtitleLoaded,
    loadSubtitle,
    seek,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current sentence
  useEffect(() => {
    if (!currentSentence || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-sentence-idx="${currentSentence.index}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSentence]);

  if (!showSubtitles) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">字幕已隐藏 (按 S 切换)</p>
      </div>
    );
  }

  if (!isSubtitleLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 text-sm">未加载字幕</p>
        <button
          onClick={loadSubtitle}
          className="rounded-lg bg-gray-700 px-4 py-2 text-xs text-gray-300 hover:bg-gray-600 transition-colors"
        >
          加载 SRT 字幕
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin"
    >
      {sentences.map((sentence) => {
        const isActive = currentSentence?.index === sentence.index;

        return (
          <div
            key={sentence.index}
            data-sentence-idx={sentence.index}
            onClick={() => seek(sentence.start)}
            className={`cursor-pointer rounded-lg px-3 py-2 transition-all ${
              isActive
                ? 'bg-blue-600/20 border-l-2 border-blue-400'
                : 'hover:bg-gray-800/50 border-l-2 border-transparent'
            }`}
          >
            {sentence.parts.map((line, li) => (
              <div key={li} className={`${isActive ? 'text-white' : 'text-gray-300'} leading-relaxed`}>
                <RubyText parts={line} displayMode={displayMode} showFurigana={showFurigana} />
              </div>
            ))}
            {isActive && (
              <div className="mt-1 text-[10px] text-gray-500">
                {sentence.start.toFixed(1)}s - {sentence.end.toFixed(1)}s
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
