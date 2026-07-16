

interface TitleBarProps {
  title?: string;
  fileName?: string;
  onOpenFile?: () => void;
}

export function TitleBar({ title = 'Japanese Shadowing Player', fileName, onOpenFile }: TitleBarProps) {
  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();
  const handleClose = () => window.electronAPI.close();

  return (
    <div className="drag-region flex h-10 items-center justify-between bg-gray-900 px-4 select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">{title}</span>
        {fileName && (
          <>
            <span className="text-gray-600">|</span>
            <span className="text-xs text-gray-500 truncate max-w-[300px]">{fileName}</span>
          </>
        )}
        {fileName && (
          <button
            onClick={onOpenFile}
            className="ml-2 no-drag px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
            title="打开新文件 (Ctrl+O)"
          >
            打开文件
          </button>
        )}
      </div>
      <div className="flex items-center no-drag">
        <button
          onClick={handleMinimize}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect y="5" width="12" height="1.5" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Maximize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
