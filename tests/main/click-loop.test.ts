import { startClickLoop, stopClickLoop, setConfiguration, onStatus } from '@main/mouse-controller/click-loop';

describe('click loop', () => {
  it('starts and stops with status updates', async () => {
    const statuses: string[] = [];
    onStatus((status) => statuses.push(status.state));
    setConfiguration({ button: 'left', clicksPerSecond: 2, runDurationSeconds: 1, stationaryDelaySeconds: 0 });
    await startClickLoop();
    await stopClickLoop('test');
    expect(statuses).toContain('active');
    expect(statuses).toContain('idle');
  });
});
