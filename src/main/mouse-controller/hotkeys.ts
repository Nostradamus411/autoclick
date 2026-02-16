import { app, globalShortcut } from 'electron';
import { HOTKEY_START, HOTKEY_STOP } from '@shared/constants';

let startCb: (() => void) | null = null;
let stopCb: (() => void) | null = null;

export function registerHotkeys(onStart: () => void, onStop: () => void): void {
  startCb = onStart;
  stopCb = onStop;

  app.whenReady().then(() => {
    globalShortcut.register(HOTKEY_START.toLowerCase(), () => startCb?.());
    globalShortcut.register(HOTKEY_STOP.toLowerCase(), () => stopCb?.());
  });
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll();
  startCb = null;
  stopCb = null;
}
