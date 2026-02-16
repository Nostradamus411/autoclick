"use strict";
const electron = require("electron");
const path = require("path");
const events = require("events");
const IPC_CHANNELS = {
  setConfig: "click-session:set-config",
  start: "click-session:start",
  stop: "click-session:stop",
  status: "click-session:status",
  motion: "click-session:motion-detected"
};
const motionEmitter = new events.EventEmitter();
let watcherStarted = false;
let pollTimer = null;
let lastPosition = null;
let lastMoveTs = Date.now();
function startWatcher() {
  if (watcherStarted) return;
  watcherStarted = true;
  const intervalMs = 60;
  pollTimer = setInterval(() => {
    var _a;
    if (!((_a = electron.screen) == null ? void 0 : _a.getCursorScreenPoint)) {
      return;
    }
    const { x, y } = electron.screen.getCursorScreenPoint();
    const prev = lastPosition;
    lastPosition = { x, y };
    if (!prev) {
      lastMoveTs = Date.now();
      return;
    }
    const dx = x - prev.x;
    const dy = y - prev.y;
    const delta = Math.hypot(dx, dy);
    if (delta > 0) {
      lastMoveTs = Date.now();
      motionEmitter.emit("motion", { deltaPx: delta, direction: { dx, dy } });
    }
  }, intervalMs);
}
function subscribeMotion(listener) {
  startWatcher();
  motionEmitter.on("motion", listener);
  return () => motionEmitter.off("motion", listener);
}
async function waitForStillness(seconds) {
  startWatcher();
  if (seconds <= 0) return;
  const durationMs = seconds * 1e3;
  const intervalMs = 120;
  await new Promise((resolve, reject) => {
    const onMotion2 = () => {
      clearInterval(interval);
      unsubscribe();
      reject(new Error("Motion detected during delay"));
    };
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTs >= durationMs) {
        clearInterval(interval);
        unsubscribe();
        resolve();
      }
    }, intervalMs);
    const unsubscribe = subscribeMotion(onMotion2);
  });
}
function stopWatcher() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  watcherStarted = false;
  lastPosition = null;
}
const statusEmitter = new events.EventEmitter();
let currentConfig = {
  button: "left",
  clicksPerSecond: 5,
  runDurationSeconds: void 0,
  stationaryDelaySeconds: 0
};
let activeTimer = null;
let runtimeTimer = null;
let runtimeSeconds = 0;
let motionUnsubscribe = null;
function setConfiguration(config) {
  const clampedCps = Math.min(1e3, Math.max(1, Math.floor(config.clicksPerSecond)));
  currentConfig = {
    ...currentConfig,
    ...config,
    clicksPerSecond: clampedCps,
    runDurationSeconds: config.runDurationSeconds && config.runDurationSeconds > 0 ? config.runDurationSeconds : void 0,
    stationaryDelaySeconds: config.stationaryDelaySeconds && config.stationaryDelaySeconds > 0 ? config.stationaryDelaySeconds : 0
  };
}
function onStatus(listener) {
  statusEmitter.on("status", listener);
}
function onMotion(listener) {
  return subscribeMotion(listener);
}
function emitStatus(status) {
  statusEmitter.emit("status", status);
}
async function startClickLoop() {
  if (activeTimer) {
    return { accepted: false, message: "Click loop already running" };
  }
  emitStatus({ state: "preparing", message: "Starting click loop" });
  const stationaryDelay = currentConfig.stationaryDelaySeconds ?? 0;
  if (stationaryDelay > 0) {
    try {
      await waitForStillness(stationaryDelay);
    } catch (err) {
      emitStatus({ state: "error", message: "Motion detected while waiting" });
      return { accepted: false, message: "Motion detected while waiting" };
    }
  }
  runtimeSeconds = 0;
  runtimeTimer = setInterval(() => {
    runtimeSeconds += 1;
    emitStatus({ state: "active", runTimeSeconds: runtimeSeconds });
    if (currentConfig.runDurationSeconds && runtimeSeconds >= currentConfig.runDurationSeconds) {
      void stopClickLoop("run-duration-elapsed");
    }
  }, 1e3);
  const intervalMs = 1e3 / currentConfig.clicksPerSecond;
  activeTimer = setInterval(() => {
  }, intervalMs);
  emitStatus({ state: "active", message: "Clicking started" });
  motionUnsubscribe = subscribeMotion(() => {
    emitStatus({ state: "stopping", message: "Movement detected" });
    stopClickLoop("motion-detected");
  });
  return { accepted: true, message: "Click loop active" };
}
async function stopClickLoop(reason) {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
  if (runtimeTimer) {
    clearInterval(runtimeTimer);
    runtimeTimer = null;
  }
  if (motionUnsubscribe) {
    motionUnsubscribe();
    motionUnsubscribe = null;
  }
  stopWatcher();
  emitStatus({ state: "stopping", message: `Stopping: ${reason}` });
  emitStatus({ state: "idle", message: "Idle" });
}
let statusSubscribers = [];
function registerIpcHandlers(window) {
  electron.ipcMain.handle(IPC_CHANNELS.setConfig, (_event, config) => {
    setConfiguration(config);
    return { acknowledged: true, summary: "Configuration updated" };
  });
  electron.ipcMain.handle(IPC_CHANNELS.start, async () => {
    const accepted = await startClickLoop();
    return accepted;
  });
  electron.ipcMain.handle(IPC_CHANNELS.stop, async () => {
    await stopClickLoop("stop-request");
    return { stopped: true };
  });
  const forwardStatus = (status) => {
    window.webContents.send(IPC_CHANNELS.status, status);
  };
  const forwardMotion = (payload) => {
    window.webContents.send(IPC_CHANNELS.motion, payload);
  };
  statusSubscribers.push(forwardStatus);
  onStatus(forwardStatus);
  onMotion(forwardMotion);
}
function cleanupIpcHandlers() {
  statusSubscribers = [];
  electron.ipcMain.removeHandler(IPC_CHANNELS.setConfig);
  electron.ipcMain.removeHandler(IPC_CHANNELS.start);
  electron.ipcMain.removeHandler(IPC_CHANNELS.stop);
}
const createWindow = async () => {
  const win = new electron.BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await win.loadURL(devServerUrl);
    win.webContents.openDevTools();
  } else {
    await win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  registerIpcHandlers(win);
};
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  cleanupIpcHandlers();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
