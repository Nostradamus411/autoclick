import { emitMotion, waitForStillness, stopWatcher } from '@main/mouse-controller/stationary-watcher';

describe('stationary watcher', () => {
  afterEach(() => {
    stopWatcher();
  });

  it('resolves after configured stillness', async () => {
    await expect(waitForStillness(0.1)).resolves.toBeUndefined();
  });

  it('rejects if motion is emitted', async () => {
    const promise = waitForStillness(1);
    emitMotion(10);
    await expect(promise).rejects.toThrow();
  });
});
