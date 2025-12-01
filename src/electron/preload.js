const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fattern', {
  version: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
});
