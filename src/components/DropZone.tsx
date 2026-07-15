import React, { useCallback, useState, useRef } from 'react';

interface DropZoneProps {
  onDrop: (filePath: string, fileName: string, file?: File) => void;
  onOpenAudio: () => void;
  /** For browser mode: directly handle file selection */
  onFileSelected?: (file: File) => void;
}

export function DropZone({ onDrop, onOpenAudio, onFileSelected }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const path = (file as any).path || file.name;
        onDrop(path, file.name, file);
      }
    },
    [onDrop]
  );

  const handleButtonClick = useCallback(() => {
    if (onFileSelected) {
      fileInputRef.current?.click();
    } else {
      onOpenAudio();
    }
  }, [onFileSelected, onOpenAudio]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file).catch((err: Error) => {
        console.error('[DropZone] File selection handler error:', err);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${
        isDragOver
          ? 'border-blue-400 bg-blue-500/10 scale-[1.02]'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
      }`}
    >
      <div className="mb-4 rounded-full bg-gray-700 p-4">
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l-5 5m5-5l5 5" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">拖放音频文件到这里</h3>
      <p className="text-sm text-gray-500 mb-4">支持 MP3, M4A, WAV, OGG, FLAC</p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleButtonClick}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          选择音频文件
        </button>
      </div>
      <p className="mt-4 text-xs text-gray-600">
        同名 SRT 字幕文件将自动加载
      </p>
      {/* Hidden file input for browser mode */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/flac,.mp3,.m4a,.wav,.ogg,.flac"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
