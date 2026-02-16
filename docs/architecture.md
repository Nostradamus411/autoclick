# Architecture

## High level
- **Electron main** hosts the BrowserWindow, registers IPC handlers, and coordinates mouse automation.
- **Renderer** is a single React screen built with Vite; it holds configuration state (Zustand) and uses IPC to start/stop clicking.
- **Preload** bridges renderer to main with a constrained `click-session:*` surface.
- **Shared** types/constants align payloads across processes.

## Main process components
- `main.ts`: boots the app, creates the window, wires preload, and registers IPC handlers.
- `ipc/handlers.ts`: responds to `click-session:set-config`, `click-session:start`, `click-session:stop`, and emits status/motion events to the renderer.
- `mouse-controller/click-loop.ts`: manages the click timer, run-duration cutoff, motion-triggered stop, and emits status telemetry.
- `mouse-controller/stationary-watcher.ts`: polls cursor position via Electron `screen`, emits motion events, and waits for stillness before starting a session.
- `mouse-controller/hotkeys.ts`: binds Alt+C/Escape via Electron `globalShortcut` to start/stop sessions.

## Renderer components
- `app/stores/configuration.ts`: Zustand store for button, CPS, run duration, and stationary delay.
- `app/hooks/useClickSession.ts`: IPC wrapper for configuration, start/stop actions, and status stream.
- UI components (`components/*.tsx`): ButtonSelector, RateSlider, DurationField, StationaryDelayInput, Indicator.
- `App.tsx`: assembles controls and indicator.

## IPC channels
- Renderer → Main: `click-session:set-config`, `click-session:start`, `click-session:stop`.
- Main → Renderer: `click-session:status`, `click-session:motion-detected`.

## Build & release
- Vite builds the renderer; Electron Builder packages the app using `release.config.json` to emit deterministic artifacts in `release/`.
- GitHub Actions workflow `release.yml` runs on tags, builds artifacts, and uploads `checksums.txt` for verification.

## Testing layers
- **Vitest**: renderer components and main logic in isolation (jsdom + node environment).
- **Jest**: main-process logic duplicate coverage.
- **Playwright**: end-to-end hotkey/indicator flow (requires Playwright browsers and system deps).
