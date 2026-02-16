import { BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from './channels';
import { ClickSessionConfiguration, ClickStatus } from '@shared/types';
import { startClickLoop, stopClickLoop, onStatus, onMotion, setConfiguration } from '@main/mouse-controller/click-loop';

let statusSubscribers: Array<(status: ClickStatus) => void> = [];

export function registerIpcHandlers(window: BrowserWindow): void {
  ipcMain.handle(IPC_CHANNELS.setConfig, (_event, config: ClickSessionConfiguration) => {
    setConfiguration(config);
    return { acknowledged: true, summary: 'Configuration updated' };
  });

  ipcMain.handle(IPC_CHANNELS.start, async () => {
    const accepted = await startClickLoop();
    return accepted;
  });

  ipcMain.handle(IPC_CHANNELS.stop, async () => {
    await stopClickLoop('stop-request');
    return { stopped: true };
  });

  const forwardStatus = (status: ClickStatus) => {
    window.webContents.send(IPC_CHANNELS.status, status);
  };
  const forwardMotion = (payload: unknown) => {
    window.webContents.send(IPC_CHANNELS.motion, payload);
  };

  statusSubscribers.push(forwardStatus);
  onStatus(forwardStatus);
  onMotion(forwardMotion);
}

export function cleanupIpcHandlers(): void {
  statusSubscribers = [];
  ipcMain.removeHandler(IPC_CHANNELS.setConfig);
  ipcMain.removeHandler(IPC_CHANNELS.start);
  ipcMain.removeHandler(IPC_CHANNELS.stop);
}
