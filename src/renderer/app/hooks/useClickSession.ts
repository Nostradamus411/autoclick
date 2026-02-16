import { useEffect, useMemo, useState, useCallback } from 'react';
import { ClickSessionConfiguration, ClickStatus } from '@shared/types';

type RendererBridge = {
  setConfig: (config: ClickSessionConfiguration) => Promise<unknown>;
  start: () => Promise<{ accepted?: boolean; message?: string } | unknown>;
  stop: () => Promise<unknown>;
  onStatus: (listener: (event: unknown, payload: ClickStatus) => void) => () => void;
};

const fallbackBridge: RendererBridge = {
  setConfig: async () => Promise.resolve(),
  start: async () => ({ accepted: false, message: 'Desktop bridge unavailable' }),
  stop: async () => Promise.resolve(),
  onStatus: () => () => undefined,
};

export function useClickSession(config: ClickSessionConfiguration) {
  const [status, setStatus] = useState<ClickStatus>({ state: 'idle' });
  const [isStarting, setIsStarting] = useState(false);

  const bridge = useMemo<RendererBridge>(() => {
    return (window.autoclick as RendererBridge | undefined) ?? fallbackBridge;
  }, []);

  useEffect(() => {
    const unsubscribe = bridge.onStatus((_event, payload: ClickStatus) => {
      setStatus(payload);
    });
    return () => {
      unsubscribe?.();
    };
  }, [bridge]);

  useEffect(() => {
    bridge.setConfig(config).catch(() => undefined);
  }, [bridge, config]);

  const start = useCallback(async () => {
    setIsStarting(true);
    try {
      const response = (await bridge.start()) as { accepted?: boolean; message?: string };
      if (!response?.accepted) {
        setStatus({ state: 'error', message: response?.message ?? 'Failed to start' });
      }
    } finally {
      setIsStarting(false);
    }
  }, [bridge]);

  const stop = useCallback(async () => {
    await bridge.stop();
  }, [bridge]);

  const active = useMemo(() => status.state === 'active' || status.state === 'preparing', [status.state]);

  return { status, start, stop, active, isStarting } as const;
}
