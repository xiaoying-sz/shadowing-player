
import { usePlayer } from '../context/PlayerContext';
import { SPEED_PRESETS } from '../types';

export function SpeedSelector() {
  const { speed: currentSpeed, setSpeed } = usePlayer();

  return (
    <div className="flex items-center gap-1">
      {SPEED_PRESETS.map((speed) => (
        <button
          key={speed}
          onClick={() => setSpeed(speed)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentSpeed === speed
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
}
