# Data Model: Minimalist Auto Clicker UI

## ClickSessionConfiguration
- **Purpose**: Captures the user-configured inputs that govern how the automation behaves before and during a session.
- **Fields**:
  - `button`: `left | middle | right` (enum). Default is `left`; derived from the button selector component.
  - `clicksPerSecond`: integer constrained to the 1–1000 inclusive range. Rendered as a slider/input combination to avoid invalid entries.
  - `runDurationSeconds`: positive integer (>= 1); if omitted or zero, the UI keeps clicking until cancellation.
  - `stationaryDelaySeconds`: integer >= 0 representing how long the pointer must stay still before clicking begins; zero disables the behavior.
  - `startCondition`: derived flag (boolean) that becomes `true` when the stationary delay has finished and the mouse is still; tracked in the main process.
- **Validations**: Clamp `clicksPerSecond` to [1, 1000], disallow `runDurationSeconds` < 0, keep `stationaryDelaySeconds` within a human-useful range (e.g., <= 10). The renderer should prevent committing a session with invalid data and show inline errors otherwise.
- **Relationships**: Serialized configuration is sent via IPC to the mouse controller, which ties it to a `SessionState` object.

## ClickStateIndicator
- **Purpose**: Represents the visual state the UI shows (idle, preparing, active, error) so the user never wonders if automation is running.
- **Fields**:
  - `state`: enum `idle | preparing | active | stopping | error`.
  - `message`: optional string describing what the controller is doing (e.g., "Waiting for motion to stop").
  - `color`: derived from `state` (e.g., gray for idle, orange for preparing, green for active).
  - `pulse`: boolean toggled every 300 ms while active to animate the indicator.
- **State Transitions**:
  1. `idle` → `preparing` when Alt+C pressed and stationary delay is enabled; `preparing` handles the countdown.
  2. `preparing` → `active` once the stationary delay finishes and the mouse remains still, or immediately from `idle` if stationary delay is zero.
  3. `active` → `stopping` when Escape is pressed, mouse movement detected, or run duration expires. Once the clicking loop stops, transition to `idle`.
  4. Any state → `error` if the mouse automation layer fails or hotkeys cannot be registered.
- **Validation**: The renderer ensures indicator state transitions mirror controller responses; erroneous transitions log to the console for debugging.

## ReleaseCandidate
- **Purpose**: Tracks the metadata emitted by the deterministic GitHub Actions workflow.
- **Fields**:
  - `tag`: git tag that triggered the release.
  - `artifacts`: list of generated files (e.g., `autoclick-app-setup.exe`, `autoclick-app.dmg`, `autoclick-app.AppImage`).
  - `hashes`: mapping from artifact name to SHA256 string.
  - `status`: `pending | verified | published`.
  - `notes`: textual description for reproducing the artifact (e.g., Node/Electron versions, commands, checksum for manual verification).
- **Relationships**: Each release candidate references the GitHub Actions run that built it and gets published with matching documentation.
- **Validation**: Checksums in `hashes` must match both the CI output and what auditors compute locally (scripts compute `sha256sum` on artifacts).
- **State Transitions**: `pending` → `verified` once CI checksums are confirmed → `published` after release notes/checksum file creation.
