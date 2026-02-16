import { useEffect, useMemo, useState, useCallback } from 'react';
import { ClickSessionConfiguration, ClickStatus } from '@shared/types';

export function useClickSession(config: ClickSessionConfiguration) {
  const [status, setStatus] = useState<ClickStatus>({ state: 'idle' });
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const unsubscribe = window.autoclick.onStatus((_event, payload: ClickStatus) => {
      setStatus(payload);
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    window.autoclick.setConfig(config).catch(() => undefined);
  }, [config]);

  const start = useCallback(async () => {
    setIsStarting(true);
    try {
      const response = (await window.autoclick.start()) as { accepted: boolean; message: string };
      if (!response?.accepted) {
        setStatus({ state: 'error', message: response?.message ?? 'Failed to start' });
      }
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stop = useCallback(async () => {
    await window.autoclick.stop();
  }, []);

  const active = useMemo(() => status.state === 'active' || status.state === 'preparing', [status.state]);

  return { status, start, stop, active, isStarting } as const;
}
