import { usePlayer } from '../context/PlayerContext';
import type { PlaylistItem } from '../types';

export function Playlist() {
  const {
    playlist,
    currentPlaylistIndex,
    showPlaylist,
    setShowPlaylist,
    playFromPlaylist,
    loadFolder,
    loadAudio,
  } = usePlayer();

  if (!showPlaylist) return null;

  return (
    <div className="flex h-full flex-col border-r border-gray-800 bg-gray-900/50 w-64 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        <h3 className="text-xs font-medium text-gray-400">播放列表</h3>
        <button
          onClick={() => setShowPlaylist(false)}
          className="text-gray-500 hover:text-white transition-colors"
          title="关闭播放列表"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-1 border-b border-gray-800 px-2 py-1.5">
        {typeof window.electronAPI?.openFolder === 'function' && (
          <button
            onClick={loadFolder}
            className="flex-1 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
          >
            加载文件夹
          </button>
        )}
        <button
          onClick={loadAudio}
          className="flex-1 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
        >
          选择文件
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {playlist.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-500">暂无文件，请加载文件夹</p>
          </div>
        ) : (
          <div className="py-1">
            {playlist.map((item: PlaylistItem) => (
              <PlaylistRow
                key={item.index}
                item={item}
                isActive={item.index === currentPlaylistIndex}
                onSelect={() => playFromPlaylist(item.index)}
                onDoubleClick={() => playFromPlaylist(item.index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {playlist.length > 0 && (
        <div className="border-t border-gray-800 px-3 py-1.5">
          <span className="text-[10px] text-gray-500">
            共 {playlist.length} 个文件
          </span>
        </div>
      )}
    </div>
  );
}

function PlaylistRow({
  item,
  isActive,
  onSelect,
  onDoubleClick,
}: {
  item: PlaylistItem;
  isActive: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
}) {
  const icon = getAudioIcon(item.name);

  return (
    <button
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
        isActive
          ? 'bg-blue-600/20 border-l-2 border-blue-400'
          : 'hover:bg-gray-800/50 border-l-2 border-transparent'
      }`}
    >
      <span className="text-xs flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
          {item.name}
        </p>
      </div>
      {isActive && (
        <span className="text-[10px] text-blue-400 flex-shrink-0">▶</span>
      )}
    </button>
  );
}

function getAudioIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp3': return '🎵';
    case 'm4a': return '🎶';
    case 'wav': return '🎤';
    case 'ogg': return '🔊';
    case 'flac': return '💿';
    default: return '📄';
  }
}
