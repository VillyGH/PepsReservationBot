import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    startScript: async () => ipcRenderer.invoke('startScript'),
    stopScript: async () => ipcRenderer.invoke('stopScript'),
})
