import { EventEmitter } from 'events';
import { ClickSessionConfiguration, ClickStatus, MotionDetected } from '@shared/types';
import { subscribeMotion, waitForStillness, emitMotion as emitMotionFromWatcher, stopWatcher } from './stationary-watcher';

const statusEmitter = new EventEmitter();

let currentConfig: ClickSessionConfiguration = {
  button: 'left',
  clicksPerSecond: 5,
  runDurationSeconds: undefined,
  stationaryDelaySeconds: 0,
};

let activeTimer: NodeJS.Timeout | null = null;
let runtimeTimer: NodeJS.Timeout | null = null;
let runtimeSeconds = 0;
let motionUnsubscribe: (() => void) | null = null;

export function setConfiguration(config: ClickSessionConfiguration): void {
  const clampedCps = Math.min(1000, Math.max(1, Math.floor(config.clicksPerSecond)));
  currentConfig = {
    ...currentConfig,
    ...config,
    clicksPerSecond: clampedCps,
    runDurationSeconds: config.runDurationSeconds && config.runDurationSeconds > 0 ? config.runDurationSeconds : undefined,
    stationaryDelaySeconds: config.stationaryDelaySeconds && config.stationaryDelaySeconds > 0 ? config.stationaryDelaySeconds : 0,
  };
}

export function onStatus(listener: (status: ClickStatus) => void): void {
  statusEmitter.on('status', listener);
}

export function onMotion(listener: (payload: MotionDetected) => void): () => void {
  return subscribeMotion(listener as never);
}

function emitStatus(status: ClickStatus): void {
  statusEmitter.emit('status', status);
}

export async function startClickLoop(): Promise<{ accepted: boolean; message: string }> {
  if (activeTimer) {
    return { accepted: false, message: 'Click loop already running' };
  }

  emitStatus({ state: 'preparing', message: 'Starting click loop' });

  const stationaryDelay = currentConfig.stationaryDelaySeconds ?? 0;
  if (stationaryDelay > 0) {
    try {
      await waitForStillness(stationaryDelay);
    } catch (err) {
      emitStatus({ state: 'error', message: 'Motion detected while waiting' });
      return { accepted: false, message: 'Motion detected while waiting' };
    }
  }

  runtimeSeconds = 0;
  runtimeTimer = setInterval(() => {
    runtimeSeconds += 1;
    emitStatus({ state: 'active', runTimeSeconds: runtimeSeconds });
    if (currentConfig.runDurationSeconds && runtimeSeconds >= currentConfig.runDurationSeconds) {
      void stopClickLoop('run-duration-elapsed');
    }
  }, 1000);

  const intervalMs = 1000 / currentConfig.clicksPerSecond;
  activeTimer = setInterval(() => {
    // Placeholder for actual click implementation (nut-js invocation)
    // e.g., mouse.click(mapButton(currentConfig.button));
  }, intervalMs);

  emitStatus({ state: 'active', message: 'Clicking started' });
  motionUnsubscribe = subscribeMotion(() => {
    emitStatus({ state: 'stopping', message: 'Movement detected' });
    stopClickLoop('motion-detected');
  });
  return { accepted: true, message: 'Click loop active' };
}

export async function stopClickLoop(reason: string): Promise<void> {
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
  emitStatus({ state: 'stopping', message: `Stopping: ${reason}` });
  emitStatus({ state: 'idle', message: 'Idle' });
}

export function simulateMotion(deltaPx: number, direction: { dx: number; dy: number }): void {
  emitMotionFromWatcher(deltaPx, direction);
}
