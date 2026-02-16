import React from 'react';
import { useConfigurationStore } from './stores/configuration';
import { useClickSession } from './hooks/useClickSession';
import { ButtonSelector } from '@renderer/components/ButtonSelector';
import { RateSlider } from '@renderer/components/RateSlider';
import { DurationField } from '@renderer/components/DurationField';
import { Indicator } from '@renderer/components/Indicator';
import { StationaryDelayInput } from '@renderer/components/StationaryDelayInput';
import { HOTKEY_START, HOTKEY_STOP } from '@shared/constants';

export const App: React.FC = () => {
  const config = useConfigurationStore((state) => state.config);
  const setButton = useConfigurationStore((state) => state.setButton);
  const setCps = useConfigurationStore((state) => state.setCps);
  const setRunDuration = useConfigurationStore((state) => state.setRunDuration);
  const setStationaryDelay = useConfigurationStore((state) => state.setStationaryDelay);

  const { status, start, stop, active, isStarting } = useClickSession(config);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Autoclick</h1>
          <p className="subtitle">Minimalist control panel for rapid clicking</p>
        </div>
        <div className="hotkeys">
          <span>Start: {HOTKEY_START}</span>
          <span>Stop: {HOTKEY_STOP}</span>
        </div>
      </header>

      <section className="grid">
        <div className="panel">
          <ButtonSelector value={config.button} onChange={setButton} />
          <RateSlider value={config.clicksPerSecond} onChange={setCps} />
          <DurationField value={config.runDurationSeconds} onChange={setRunDuration} />
          <StationaryDelayInput
            value={config.stationaryDelaySeconds}
            onChange={setStationaryDelay}
          />
          <div className="actions">
            <button className="primary" onClick={start} disabled={active || isStarting}>
              {isStarting ? 'Starting…' : 'Start (Alt+C)'}
            </button>
            <button className="ghost" onClick={stop} disabled={!active}>
              Stop (Escape)
            </button>
          </div>
        </div>
        <div className="panel indicator-panel">
          <Indicator status={status} />
        </div>
      </section>
    </div>
  );
};
