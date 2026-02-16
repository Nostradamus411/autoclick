---
description: "Task list for implementing the Minimalist Auto Clicker UI feature"
---

# Tasks: Minimalist Auto Clicker UI

**Input**: plan.md + spec.md + research.md + data-model.md + contracts/
**Prerequisites**: TypeScript / Electron / React stack described in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the Electron + React + Vite tooling, dependency graph, and linting so every story compiles cleanly before functional work begins.

- [X] T001 [P] Populate package.json with Electron/Vite/React/devDependencies plus scripts for `dev`, `build`, `test:*`, and `release:hash` to match the Implementation Plan (package.json)
- [X] T002 [P] Author vite.config.ts that builds the renderer entrypoint with React, targets Electron renderer, and proxies the preload/main entrypoints for the dev server (vite.config.ts)
- [X] T003 [P] Create tsconfig.json that shares compiler options between the renderer (ESNext/DOM) and main process (Node/Electron), enables isolatedModules, and references root paths (tsconfig.json)
- [X] T004 [P] Add lint/formatter configs so TypeScript 5.6, React 19, and Electron rules are enforced (`.eslintrc.cjs`, `.prettierrc`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide the Electron main stack, preload surface, shared types, and skeleton mouse controller so user stories can focus on UI/logic rather than wiring.

- [X] T005 Implement src/main/main.ts that bootstraps the BrowserWindow, wires preload.ts, wires IPC registration points, and opens devtools in development (src/main/main.ts)
- [X] T006 [P] Create src/preload/preload.ts to expose safe IPC helpers for `click-session:*` and `release:checksums` channels via contextBridge (src/preload/preload.ts)
- [X] T007 [P] Define ClickSessionConfiguration, ClickStatus, and ReleaseMetadata interfaces in src/shared/types.ts so both sides agree on payloads and statuses (src/shared/types.ts)
- [X] T008 [P] Surface shared constants such as MouseButton options, indicator colors, and hotkey names in src/shared/constants.ts for consistent UI labels and IPC enums (src/shared/constants.ts)
- [X] T009 [P] Stub the mouse controller loop in src/main/mouse-controller/click-loop.ts with exported `startClickLoop`, `stopClickLoop`, and event hooks so later stories can flesh out rates/run duration (src/main/mouse-controller/click-loop.ts)
- [X] T010 [P] Stub global hotkey registration in src/main/mouse-controller/hotkeys.ts that listens for Alt+C/Escape via iohook and proxies events to the click loop (src/main/mouse-controller/hotkeys.ts)
- [X] T011 [P] Scaffold src/main/mouse-controller/stationary-watcher.ts with exported helpers to observe pointer movement and emit motion events for later placeholder integration (src/main/mouse-controller/stationary-watcher.ts)
- [X] T012 Create src/renderer/entrypoints/index.tsx that hydrates React, loads App.tsx, and injects global styles so the renderer can mount immediately (src/renderer/entrypoints/index.tsx)

**Checkpoint**: Electron boots, renderer skeleton compiles, and IPC contracts exist so story work can assume the wiring is in place.

---

## Phase 3: User Story 1 - Configure and start a clicking session (Priority: P1) 🎯 MVP

**Goal**: Deliver the single-screen UI that lets the user pick a mouse button, dial in 1–1000 CPS, set a run duration, and start the automation with Alt+C while the indicator shows whether it is idle or active.

**Independent Test**: Adjust button/rate/duration, press Alt+C, and verify clicking starts plus the indicator reflects the active state before stopping with Escape (indicator returns to idle within one cycle).

### Implementation for User Story 1

- [X] T013 [US1] Implement the configuration store in src/renderer/app/stores/configuration.ts using Zustand to manage button, clicksPerSecond, runDurationSeconds, and validation hooks (src/renderer/app/stores/configuration.ts)
- [X] T014 [US1] Build the ButtonSelector component that renders left/middle/right options, keeps the store in sync, and handles keyboard focus styling (src/renderer/components/ButtonSelector.tsx)
- [X] T015 [US1] Build the RateSlider component that accepts integer values 1–1000, clamps out-of-range input, and exposes a readable label for the UI (src/renderer/components/RateSlider.tsx)
- [X] T016 [US1] Build the DurationField component that captures run duration in seconds, prevents negative values, and mirrors the store while showing inline feedback (src/renderer/components/DurationField.tsx)
- [X] T017 [US1] Create the Indicator component that reacts to status updates (idle, preparing, active, error), animates via Framer Motion, and accepts message/timer props from the renderer (src/renderer/components/Indicator.tsx)
- [X] T018 [US1] Implement src/renderer/app/App.tsx to lay out the controls, surface the indicator, and expose a start/stop action that triggers the `useClickSession` hook (src/renderer/app/App.tsx)
- [X] T019 [US1] Implement src/renderer/app/hooks/useClickSession.ts to send `click-session:set-config`, listen for `click-session:status`, and expose `start`, `stop`, and `status` to the UI (src/renderer/app/hooks/useClickSession.ts)

**Checkpoint**: The UI can configure and start a clicking session, plus the tests/external hotkey scenario succeed independently.

### Tests for User Story 1

- [X] T020 [P] [US1] Add Vitest + React Testing Library coverage that renders src/renderer/app/App.tsx, exercises ButtonSelector/RateSlider/DurationField, and asserts the Indicator component receives the correct state transitions (tests/renderer/App.test.tsx)
- [X] T021 [P] [US1] Write a Playwright scenario that opens the dev build, toggles the controls, sends Alt+C, and confirms the indicator goes active then returns to idle after Escape (tests/e2e/hotkeys.spec.ts)

---

## Phase 4: User Story 2 - Stationary-triggered start and movement stop (Priority: P2)

**Goal**: Let users enable a stationary-start delay and automatically halt clicking as soon as the pointer moves again while keeping the indicator synchronized with `preparing` and `stopping` states.

**Independent Test**: Turn on the stationary delay, press Alt+C while the cursor is still, confirm clicking waits for the delay, then move the mouse to ensure clicking halts and the indicator returns to idle immediately.

- [X] T022 [US2] Add StationaryDelayInput component plus store integration so users can enable/disable the delay and adjust the seconds before clicking (src/renderer/components/StationaryDelayInput.tsx)
- [X] T023 [US2] Implement the detection logic inside src/main/mouse-controller/stationary-watcher.ts that polls pointer position, tracks motion, and resolves once the configured seconds of stillness elapse (src/main/mouse-controller/stationary-watcher.ts)
- [X] T024 [US2] Update src/main/mouse-controller/click-loop.ts to respect the stationary delay, stop on movement, honor runDurationSeconds, and emit `click-session:motion-detected` events plus runtime telemetry (src/main/mouse-controller/click-loop.ts)
- [X] T025 [US2] Implement src/main/ipc/handlers.ts to react to `click-session:start`/`click-session:stop`, coordinate between the click loop and stationary watcher, and broadcast `click-session:status` updates (src/main/ipc/handlers.ts)
- [X] T026 [P] [US2] Add Jest coverage for the stationary watcher that triggers motion events and asserts the promise rejects when movement occurs within the delay window (tests/main/stationary-watcher.test.ts)
- [X] T027 [P] [US2] Add Jest coverage for the click loop that verifies run-duration enforcement, stationary cancellation, and emitted status updates (tests/main/click-loop.test.ts)

**Checkpoint**: Stationary-start controls behave independently, motion cancels automation, and the indicator reflects the transition states.

---

## Phase 5: User Story 3 - Deterministic release verification (Priority: P3)

**Goal**: Build a GitHub Actions workflow that produces deterministic Electron artifacts, publishes checksum metadata, and documents how auditors can reproduce the hashes.

**Independent Test**: Run the release workflow against a tagged commit (locally via `act` or similar) or simulate its steps; verify `checksums.txt` lists SHA256 hashes that match locally computed values described in the reproduction guide.

- [X] T028 [US3] Add .github/workflows/release.yml implementing the deterministic release pipeline that pins Node/Electron, runs `npm ci`, builds (`npm run build`), packages via electron-builder, and uploads a `checksums.txt` artifact (github/workflows/release.yml)
- [X] T029 [US3] Create release.config.json for electron-builder that sets deterministic `artifactName`, `appId`, and reproducible metadata (release.config.json)
- [X] T030 [US3] Create scripts/verify-release.sh (invoked by `npm run release:hash`) that hashes each built artifact, compares them against the generated `checksums.txt`, and echoes instructions for auditors (scripts/verify-release.sh)
- [X] T031 [US3] Write docs/REPRO.md that explains how to reproduce the build locally, references the workflow’s pinned versions, and describes how to compare SHA256 checksums per the release contract (docs/REPRO.md)

**Checkpoint**: Release pipeline outputs reproducible artifacts plus documentation so auditors can verify the published builds.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Document the feature, verify instructions, and align all supporting materials with the implemented behavior.

- [X] T032 [P] Update README.md to summarize the UI controls, hotkeys, stationary delay behavior, and release verification steps from docs/REPRO.md (README.md)
- [X] T033 [P] Capture the architecture in docs/architecture.md showing how renderer components, IPC contracts, and the mouse controller interconnect so future contributors understand the single-screen flow (docs/architecture.md)

**Checkpoint**: Documentation and reference material match implementation; no loose ends remain.

---

## Dependencies & Execution Order

- Phase 1 must finish before Phase 2; foundational files (T005–T012) block all stories.
- Each User Story phase (Phase 3–5) depends on the foundational phase but can proceed in priority order or in parallel once the foundation is ready.
- Phase 6 runs after all user stories are implemented to polish documentation.
- Within each user story, tests (T020–T021, T026–T027) should be created before or alongside implementation tasks to validate behavior independently.

## Parallel Opportunities

- Setup tasks T001–T004 only touch tooling/config files and can happen in parallel.
- Foundational tasks T005–T012 touch distinct files (main/preload/shared/mouse controller/renderer entry) and can be split across engineers.
- User stories can execute in parallel after Phase 2: US1 (T013–T021), US2 (T022–T027), and US3 (T028–T031) cover different layers.
- Tests marked [P] (T020, T021, T026, T027) can run concurrently with their respective implementation tasks.

## Parallel Example: User Story 1

- Run frontend component implementations (T014–T017) at the same time so the ButtonSelector, RateSlider, DurationField, and Indicator appear together.
- While those components are built, `useClickSession` (T019) and App layout (T018) can be developed in parallel because they rely on the shared store, not the component internals.
- Launch Vitest (T020) and Playwright (T021) in separate terminals/suites to verify UI behavior concurrently.

## Implementation Strategy

### MVP Focus (Deliver User Story 1 First)

1. Complete Phase 1 (T001–T004) and Phase 2 (T005–T012) to make the Electron/React stack runnable.
2. Implement US1 tasks (T013–T021) so users can configure/run a clicking session and receive immediate feedback.
3. Validate with renderer unit tests and the Playwright scenario; stop if MVP is polished enough for a release demo.

### Incremental Delivery (Add Stories in Priority Order)

1. With the MVP working, implement US2 tasks (T022–T027) to add stationary delay controls and motion-aware automation.
2. Once stationary behavior is solid, add US3 tasks (T028–T031) to guarantee deterministic releases.
3. After each user story, run the relevant tests (T020–T021 for US1, T026–T027 for US2) before moving on.

### Parallel Team Strategy (If Multiple Contributors)

1. Split Setup + Foundational tasks among tooling and main-process engineers.
2. After Phase 2: one engineer tackles US1 UI/store (T013–T021), another implements US2 backend automation (T022–T027), a third handles release tooling/docs (T028–T031).
3. Final polish (T032–T033) can be done by anyone once implementation is stable.
