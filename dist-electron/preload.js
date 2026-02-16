"use strict";
const electron = require("electron");
const IPC_CHANNELS = {
  setConfig: "click-session:set-config",
  start: "click-session:start",
  stop: "click-session:stop",
  status: "click-session:status",
  motion: "click-session:motion-detected",
  releaseChecksums: "release:checksums"
};
electron.contextBridge.exposeInMainWorld("autoclick", {
  setConfig: (config) => electron.ipcRenderer.invoke(IPC_CHANNELS.setConfig, config),
  start: () => electron.ipcRenderer.invoke(IPC_CHANNELS.start),
  stop: () => electron.ipcRenderer.invoke(IPC_CHANNELS.stop),
  onStatus: (listener) => {
    electron.ipcRenderer.on(IPC_CHANNELS.status, listener);
    return () => electron.ipcRenderer.removeListener(IPC_CHANNELS.status, listener);
  },
  onMotion: (listener) => {
    electron.ipcRenderer.on(IPC_CHANNELS.motion, listener);
    return () => electron.ipcRenderer.removeListener(IPC_CHANNELS.motion, listener);
  },
  onReleaseChecksums: (listener) => {
    electron.ipcRenderer.on(IPC_CHANNELS.releaseChecksums, listener);
    return () => electron.ipcRenderer.removeListener(IPC_CHANNELS.releaseChecksums, listener);
  }
});
