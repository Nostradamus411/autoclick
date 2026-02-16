import { create } from 'zustand';
import { ClickSessionConfiguration, ClickSessionState } from '@shared/types';

interface ConfigurationState {
  config: ClickSessionConfiguration;
  status: ClickSessionState;
  setButton: (button: ClickSessionConfiguration['button']) => void;
  setCps: (cps: number) => void;
  setRunDuration: (seconds?: number) => void;
  setStationaryDelay: (seconds?: number) => void;
  setStatus: (state: ClickSessionState) => void;
}

const clampCps = (value: number) => Math.min(1000, Math.max(1, Math.floor(value)));

export const useConfigurationStore = create<ConfigurationState>((set) => ({
  config: {
    button: 'left',
    clicksPerSecond: 5,
    runDurationSeconds: undefined,
    stationaryDelaySeconds: 0,
  },
  status: 'idle',
  setButton: (button) => set((state) => ({ config: { ...state.config, button } })),
  setCps: (cps) => set((state) => ({ config: { ...state.config, clicksPerSecond: clampCps(cps) } })),
  setRunDuration: (seconds) =>
    set((state) => ({
      config: {
        ...state.config,
        runDurationSeconds: seconds && seconds > 0 ? Math.floor(seconds) : undefined,
      },
    })),
  setStationaryDelay: (seconds) =>
    set((state) => ({
      config: {
        ...state.config,
        stationaryDelaySeconds: seconds && seconds > 0 ? Math.floor(seconds) : 0,
      },
    })),
  setStatus: (status) => set(() => ({ status })),
}));
