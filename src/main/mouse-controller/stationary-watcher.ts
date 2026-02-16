import { EventEmitter } from 'events';
import { screen } from 'electron';

const motionEmitter = new EventEmitter();
let watcherStarted = false;
let pollTimer: NodeJS.Timeout | null = null;
let lastPosition: { x: number; y: number } | null = null;
let lastMoveTs = Date.now();

function startWatcher(): void {
  if (watcherStarted) return;
  watcherStarted = true;
  const intervalMs = 60;
  pollTimer = setInterval(() => {
    if (!screen?.getCursorScreenPoint) {
      // Running in a non-Electron test environment; rely on manual emits only.
      return;
    }
    const { x, y } = screen.getCursorScreenPoint();
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
      motionEmitter.emit('motion', { deltaPx: delta, direction: { dx, dy } });
    }
  }, intervalMs);
}

export function subscribeMotion(
  listener: (payload: { deltaPx: number; direction: { dx: number; dy: number } }) => void
): () => void {
  startWatcher();
  motionEmitter.on('motion', listener);
  return () => motionEmitter.off('motion', listener);
}

export async function waitForStillness(seconds: number): Promise<void> {
  startWatcher();
  if (seconds <= 0) return;
  const durationMs = seconds * 1000;
  const intervalMs = 120;

  await new Promise<void>((resolve, reject) => {
    const onMotion = () => {
      clearInterval(interval);
      unsubscribe();
      reject(new Error('Motion detected during delay'));
    };

    const interval = setInterval(() => {
      if (Date.now() - lastMoveTs >= durationMs) {
        clearInterval(interval);
        unsubscribe();
        resolve();
      }
    }, intervalMs);

    const unsubscribe = subscribeMotion(onMotion as never);
  });
}

export function emitMotion(deltaPx: number, direction: { dx: number; dy: number } = { dx: 0, dy: 0 }): void {
  lastMoveTs = Date.now();
  motionEmitter.emit('motion', { deltaPx, direction });
}

export function stopWatcher(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  watcherStarted = false;
  lastPosition = null;
}
