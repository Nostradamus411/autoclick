# Autoclick

Minimalist Electron app for configurable auto-clicking with a single-screen React UI.

## Features
- Choose mouse button and rate (1–1000 CPS).
- Optional stationary-start delay and run duration.
- Global hotkeys: Alt+C to start, Escape to stop.
- Indicator shows idle, preparing, active, and stopping states.

## Develop
1. Use Node 20 (`nvm use 20`).
2. Install deps: `npm ci` (or `npm install` on first setup).
3. Start dev: `npm run dev` (Electron + Vite renderer).

## Tests
- Renderer/Main: `npm run test:renderer` (Vitest).
- Main (Jest): `npm run test:main`.
- E2E: `npm run test:e2e` (requires Playwright browsers; run `npx playwright install` first and OS deps per Playwright guidance).

## Releases
- GitHub Actions workflow `.github/workflows/release.yml` builds on `v*.*.*` tags using Node 20 and `electron-builder` with `release.config.json`.
- Checksums written to `checksums.txt` and uploaded with artifacts.
- Local verification: `npm run build && npx electron-builder --config release.config.json --publish never && npm run release:hash`.
- Reproduction guide: [docs/REPRO.md](docs/REPRO.md).

## Architecture (overview)
- **Renderer**: React 19 + Vite, Zustand store, Framer Motion indicator, IPC hook for click sessions.
- **Main**: Electron window bootstrap, IPC handlers, click loop and stationary watcher, global hotkeys.
- **Preload**: Exposes safe IPC channels to renderer.
- **Shared**: Types/constants for IPC payloads and UI labels.

For more detail, see [docs/architecture.md](docs/architecture.md).
