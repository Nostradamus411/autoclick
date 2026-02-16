export const MOUSE_BUTTONS = ['left', 'middle', 'right'] as const;
export const HOTKEY_START = 'Alt+C';
export const HOTKEY_STOP = 'Escape';

export const INDICATOR_STATES = {
  idle: { color: '#7a7a7a', label: 'Idle' },
  preparing: { color: '#f1a208', label: 'Preparing' },
  active: { color: '#2ecc71', label: 'Active' },
  stopping: { color: '#f39c12', label: 'Stopping' },
  error: { color: '#e74c3c', label: 'Error' },
};
