# Implementation Plan: Minimalist Auto Clicker UI

**Branch**: `001-design-autoclick-ui` | **Date**: February 15, 2026 | **Spec**: [specs/001-design-autoclick-ui/spec.md](specs/001-design-autoclick-ui/spec.md)
**Input**: Feature specification from `/specs/001-design-autoclick-ui/spec.md`

## Summary

Implement a single-screen React-powered Electron app that lets people pick a mouse button, set 1–1000 clicks per second, define an optional stationary-start delay, constrain run duration, and toggle sessions via Alt+C/Escape while providing a clear indicator plus deterministic GitHub Actions releases.

## Technical Context

**Language/Version**: TypeScript 5.6 (React 19 in the renderer, Node 20 in the main process, Electron 28 host).  
**Primary Dependencies**: Vite 5 build tooling, React 19, Zustand (state for configuration panel), Framer Motion for subtle indicator transitions, `@nut-tree/nut-js` for cross-platform mouse automation, `iohook` for global hotkeys, and `electron-builder` for packaging/deterministic artifacts.  
**Mouse Automation & Hotkeys**: Implemented inside the Electron main process; renderer communicates over IPC to request clicks, stationary-listening, and run-duration enforcement. The background task uses `@nut-tree/nut-js` to fire clicks on the selected button and `iohook` for Alt+C/Escape so shortcuts work even when the UI is in the background.  
**Storage**: N/A—config lives in React state plus transient context handed to the mouse controller; no persistence beyond the current session.  
**Testing**: Vitest + React Testing Library for renderer isolation, Jest for main-process logic, and Playwright (headed) for verifying Alt+C/Escape + indicator flows.  
**Target Platform**: Desktop (Windows 10/11, macOS 13+, and popular Linux distributions) delivered through Electron.  
**Project Type**: Desktop GUI (Electron main + React renderer) that feels like a modern single-page app.  
**Performance Goals**: Sustain 1 000 clicks per second without exceeding ~2 ms jitter, stop clicking within 300 ms of mouse movement when station-start is active, and keep UI updates under 50 ms so the indicator reacts instantly.  
**Constraints**: Hotkeys must work globally for Alt+C and Escape, stationary detection should not fire pending clicks while movement exists, and determinism requires GitHub Actions to reproduce identical zipped artifacts/checksums from the same source tree.  
**Scale/Scope**: One control screen plus a background clicking loop; no multi-page navigation or data stores.  

## Constitution Check

No gates are defined inside `.specify/memory/constitution.md` (the file is currently a placeholder), so no extra constraints apply. Re-evaluate if the constitution is populated later in the workflow.

## Project Structure

### Documentation (this feature)

```text
specs/001-design-autoclick-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/                # Electron main process + mouse controller
│   ├── main.ts          # app bootstrap + window creation
│   ├── mouse-controller/
│   │   ├── click-loop.ts
│   │   ├── stationary-watcher.ts
│   │   └── hotkeys.ts
│   └── ipc/
│       ├── channels.ts
│       └── handlers.ts
├── preload/
│   └── preload.ts        # exposes safe IPC surface to renderer
├── renderer/
│   ├── app/
│   │   ├── App.tsx       # single-screen UI
│   │   ├── stores/configuration.ts
│   │   ├── hooks/useClickSession.ts
│   │   └── indicators/
│   ├── components/
│   │   ├── ButtonSelector.tsx
│   │   ├── RateSlider.tsx
│   │   ├── DurationField.tsx
│   │   ├── StationaryDelayInput.tsx
│   │   └── Indicator.tsx
│   ├── styles/
│   │   ├── theme.css
│   │   └── globals.css
│   └── entrypoints/
│       └── index.tsx
├── shared/
│   ├── types.ts         # IPC payload shapes
│   └── constants.ts
tests/
├── renderer/
│   ├── App.test.tsx
│   └── indicator.spec.ts
├── main/
│   ├── click-loop.test.ts
│   └── stationary-watcher.test.ts
└── e2e/
    └── hotkeys.spec.ts
```

**Structure Decision**: Use an Electron-hosted React/Vite renderer so the UI stays modern and minimal while the main process controls mouse automation and global hotkeys. Shared types keep IPC contracts explicit.

## Complexity Tracking

Not applicable—no constitution gates were triggered in this plan.
