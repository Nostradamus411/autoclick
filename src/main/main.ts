import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIpcHandlers, cleanupIpcHandlers } from './ipc/handlers';

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await win.loadURL(devServerUrl);
    win.webContents.openDevTools();
  } else {
    await win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  registerIpcHandlers(win);
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  cleanupIpcHandlers();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
