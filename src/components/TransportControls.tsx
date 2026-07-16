
import { usePlayer } from '../context/PlayerContext';

export function TransportControls() {
  const {
    isPlaying,
    togglePlay,
    seekRelative,
    restartCurrentSentence,
    goToNextSentenceAndPlay,
    sentences,
  } = usePlayer();

  const hasSentences = sentences.length > 0;

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Backward: restart current sentence, or rewind 5s */}
      <button
        onClick={() => hasSentences ? restartCurrentSentence() : seekRelative(-5)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        title={hasSentences ? '回到句首' : '后退 5 秒'}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-200 hover:scale-105 transition-all shadow-lg"
        title={isPlaying ? '暂停 (Space)' : '播放 (Space)'}
      >
        {isPlaying ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Forward: next sentence and play, or forward 5s */}
      <button
        onClick={() => hasSentences ? goToNextSentenceAndPlay() : seekRelative(5)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        title={hasSentences ? '下一句并播放' : '前进 5 秒'}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z" />
        </svg>
      </button>
    </div>
  );
}
