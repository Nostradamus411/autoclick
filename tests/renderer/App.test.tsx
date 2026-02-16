import { render, screen } from '@testing-library/react';
import { App } from '@renderer/app/App';

vi.mock('@renderer/app/hooks/useClickSession', () => {
  return {
    useClickSession: () => ({
      status: { state: 'idle', message: 'Ready' },
      start: vi.fn(),
      stop: vi.fn(),
      active: false,
      isStarting: false,
    }),
  };
});

describe('App UI', () => {
  it('renders controls and indicator', () => {
    render(<App />);
    expect(screen.getByText(/Mouse button/i)).toBeInTheDocument();
    expect(screen.getByText(/Clicks per second/i)).toBeInTheDocument();
    expect(screen.getByText(/Run duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Start \(Alt\+C\)/i)).toBeInTheDocument();
  });
});
