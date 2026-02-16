import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export const RateSlider: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    onChange(Number.isFinite(next) ? next : 1);
  };

  return (
    <div className="control">
      <label className="label">Clicks per second</label>
      <div className="slider-row">
        <input
          type="range"
          min={1}
          max={1000}
          value={value}
          onChange={handleChange}
        />
        <input
          className="number"
          type="number"
          min={1}
          max={1000}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
