# Quickstart: Minimalist Auto Clicker UI

1. **Install dependencies** (Node 20, npm 10+). Run `npm ci` from the repo root to install renderer and Electron dependencies.
2. **Start the development shell**: Run `npm run dev` to launch Vite’s renderer + Electron main process via `electron-vite`. The UI opens automatically; you can adjust the button, CPS, duration, and stationary delay while seeing the indicator respond.
3. **Trigger the clicking loop**: Press `Alt+C` to start clicking according to the current config, and `Escape` to cancel. Verify the indicator turns green while active and returns to idle when stopping or moving the mouse.
4. **Run unit tests**:
   - `npm run test:renderer` uses Vitest/React Testing Library for UI components.
   - `npm run test:main` runs Jest for the click controller and stationary detection.
   - `npm run test:e2e` executes Playwright to cover hotkeys + indicator feedback.
5. **Produce a production build**: `npm run build` runs Vite’s renderer build and packages the Electron app via `electron-builder` (without publishing).
6. **Verify deterministic release locally**: After building, run `npm run release:hash` (invokes `sha256sum` on each artifact). Compare the output with the checksum published in `checksums.txt` (the CI job adds it to releases). If the values match, the release is reproducible.
7. **Conceptual release workflow**: Tag a commit with `vMAJOR.MINOR.PATCH`, push to GitHub, let the release workflow produce installers, and copy the `checksums.txt` results into the release notes along with the existing documentation in `contracts/release.md`.
