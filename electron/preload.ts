import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // File dialogs
  openAudio: () => ipcRenderer.invoke('dialog:openAudio'),
  openSubtitle: () => ipcRenderer.invoke('dialog:openSubtitle'),
  saveAudio: (defaultName: string) => ipcRenderer.invoke('dialog:saveAudio', defaultName),

  // File system helpers
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  readAudioFile: (filePath: string) => ipcRenderer.invoke('fs:readAudioFile', filePath),
  writeFile: (filePath: string, data: Buffer) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  getAutoSubtitle: (audioPath: string) => ipcRenderer.invoke('fs:getAutoSubtitle', audioPath),

  // Window state listeners
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window:maximized-change', (_event, isMaximized) => callback(isMaximized));
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
