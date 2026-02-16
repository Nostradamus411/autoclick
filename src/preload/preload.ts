import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../main/ipc/channels';
import { ClickSessionConfiguration, ReleaseMetadata } from '@shared/types';

contextBridge.exposeInMainWorld('autoclick', {
  setConfig: (config: ClickSessionConfiguration) => ipcRenderer.invoke(IPC_CHANNELS.setConfig, config),
  start: () => ipcRenderer.invoke(IPC_CHANNELS.start),
  stop: () => ipcRenderer.invoke(IPC_CHANNELS.stop),
  onStatus: (listener: (event: unknown, payload: unknown) => void) => {
    ipcRenderer.on(IPC_CHANNELS.status, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.status, listener);
  },
  onMotion: (listener: (event: unknown, payload: unknown) => void) => {
    ipcRenderer.on(IPC_CHANNELS.motion, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.motion, listener);
  },
  onReleaseChecksums: (listener: (event: unknown, payload: ReleaseMetadata) => void) => {
    ipcRenderer.on(IPC_CHANNELS.releaseChecksums, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.releaseChecksums, listener);
  },
});

declare global {
  interface Window {
    autoclick?: {
      setConfig: (config: ClickSessionConfiguration) => Promise<unknown>;
      start: () => Promise<unknown>;
      stop: () => Promise<unknown>;
      onStatus: (listener: (event: unknown, payload: unknown) => void) => () => void;
      onMotion: (listener: (event: unknown, payload: unknown) => void) => () => void;
      onReleaseChecksums: (listener: (event: unknown, payload: ReleaseMetadata) => void) => () => void;
    };
  }
}
