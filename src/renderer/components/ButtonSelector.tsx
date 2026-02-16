import React from 'react';
import { MOUSE_BUTTONS } from '@shared/constants';
import { MouseButton } from '@shared/types';

interface Props {
  value: MouseButton;
  onChange: (value: MouseButton) => void;
}

export const ButtonSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="control">
      <label className="label">Mouse button</label>
      <div className="chip-group">
        {MOUSE_BUTTONS.map((button) => (
          <button
            key={button}
            type="button"
            className={`chip ${value === button ? 'chip--active' : ''}`}
            onClick={() => onChange(button)}
          >
            {button.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
