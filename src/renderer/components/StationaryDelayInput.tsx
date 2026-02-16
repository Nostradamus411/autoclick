import React from 'react';

interface Props {
  value?: number;
  onChange: (seconds?: number) => void;
}

export const StationaryDelayInput: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    onChange(!Number.isFinite(next) || next <= 0 ? 0 : next);
  };

  return (
    <div className="control">
      <label className="label">Stationary start delay (seconds)</label>
      <input
        className="text"
        type="number"
        min={0}
        max={10}
        value={value ?? 0}
        onChange={handleChange}
      />
    </div>
  );
};
