import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStaticPath from 'ffmpeg-static';

// In production (packaged app), ffmpeg-static binary may be in extraResources
let ffmpegBinaryPath = ffmpegStaticPath || '';
if (!ffmpegBinaryPath || !fs.existsSync(ffmpegBinaryPath)) {
  const resPath = path.join(process.resourcesPath, 'ffmpeg-static', 'ffmpeg.exe');
  if (fs.existsSync(resPath)) {
    ffmpegBinaryPath = resPath;
  }
}
if (ffmpegBinaryPath) {
  ffmpeg.setFfmpegPath(ffmpegBinaryPath);
}

let mainWindow: BrowserWindow | null = null;
let lastAudioDir: string | null = null;

const isDev = !app.isPackaged;

const AUDIO_EXTENSIONS = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.flac']);

function isAudioFile(filePath: string): boolean {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Window controls
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

// IPC: File dialogs
ipcMain.handle('dialog:openAudio', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Audio File',
    defaultPath: lastAudioDir || undefined,
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'm4a', 'wav', 'ogg', 'flac'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  lastAudioDir = path.dirname(filePath);
  return {
    path: filePath,
    name: path.basename(filePath),
  };
});

ipcMain.handle('dialog:openSubtitle', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Subtitle File',
    defaultPath: lastAudioDir || undefined,
    filters: [
      { name: 'Subtitle Files', extensions: ['srt', 'vtt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    path: filePath,
    name: path.basename(filePath),
    content,
  };
});

ipcMain.handle('dialog:saveAudio', async (_event, defaultName: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Export Audio',
    defaultPath: defaultName,
    filters: [
      { name: 'WebM Audio (原始)', extensions: ['webm'] },
      { name: 'WAV Audio', extensions: ['wav'] },
      { name: 'MP3 Audio', extensions: ['mp3'] },
      { name: 'M4A Audio', extensions: ['m4a'] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
});

// IPC: Folder browser
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Audio Folder',
    defaultPath: lastAudioDir || undefined,
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const folderPath = result.filePaths[0];
  lastAudioDir = folderPath;
  return folderPath;
});

ipcMain.handle('fs:scanAudioFolder', async (_event, folderPath: string) => {
  try {
    const files: Array<{ path: string; name: string }> = [];
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = path.join(folderPath, entry.name);
        if (isAudioFile(fullPath)) {
          files.push({ path: fullPath, name: entry.name });
        }
      }
    }
    // Sort by name
    files.sort((a, b) => a.name.localeCompare(b.name));
    return files;
  } catch {
    return [];
  }
});

// IPC: File system helpers
ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
});

ipcMain.handle('fs:readAudioFile', async (_event, filePath: string) => {
  try {
    const buffer = fs.readFileSync(filePath);
    // Return as base64 string with MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
    };
    const mime = mimeMap[ext] || 'audio/mpeg';
    const base64 = buffer.toString('base64');
    return { base64, mime, fileName: path.basename(filePath) };
  } catch {
    return null;
  }
});

ipcMain.handle('fs:writeFile', async (_event, filePath: string, data: Buffer) => {
  try {
    fs.writeFileSync(filePath, data);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('fs:convertAudio', async (_event, { data, savePath, format }: { data: number[]; savePath: string; format: string }) => {
  try {
    const tmpWav = path.join(app.getPath('temp'), `shadow-temp-${Date.now()}.wav`);
    fs.writeFileSync(tmpWav, Buffer.from(data));

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg(tmpWav);
      if (format === 'mp3') {
        cmd.audioCodec('libmp3lame').audioBitrate(128);
      } else if (format === 'm4a') {
        cmd.audioCodec('aac').audioBitrate(128);
      } else {
        cmd.audioCodec('copy');
      }
      cmd
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(savePath);
    });

    try { fs.unlinkSync(tmpWav); } catch { /* ignore */ }
    return true;
  } catch (err) {
    console.error('Audio conversion failed:', err);
    return false;
  }
});

ipcMain.handle('fs:getAutoSubtitle', async (_event, audioPath: string) => {
  const dir = path.dirname(audioPath);
  const baseName = path.basename(audioPath, path.extname(audioPath));
  const srtPath = path.join(dir, `${baseName}.srt`);
  const vttPath = path.join(dir, `${baseName}.vtt`);

  for (const subPath of [srtPath, vttPath]) {
    if (fs.existsSync(subPath)) {
      const content = fs.readFileSync(subPath, 'utf-8');
      return {
        path: subPath,
        name: path.basename(subPath),
        content,
      };
    }
  }
  return null;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
