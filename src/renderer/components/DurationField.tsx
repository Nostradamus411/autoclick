import React from 'react';

interface Props {
  value?: number;
  onChange: (value?: number) => void;
}

export const DurationField: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    onChange(!Number.isFinite(next) || next <= 0 ? undefined : next);
  };

  return (
    <div className="control">
      <label className="label">Run duration (seconds)</label>
      <input
        className="text"
        type="number"
        min={1}
        value={value ?? ''}
        placeholder="Until stopped"
        onChange={handleChange}
      />
    </div>
  );
};
