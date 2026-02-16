# IPC Contracts: Minimalist Auto Clicker UI

## click-session:set-config (renderer → main)
- **Purpose**: Send the latest `ClickSessionConfiguration` every time the user updates a field so the main process can keep its automation parameters in sync.
- **Payload**:
  ```ts
  {
    button: "left" | "middle" | "right";
    clicksPerSecond: number; // clamped to [1, 1000]
    runDurationSeconds: number; // >= 0
    stationaryDelaySeconds: number; // >= 0
  }
  ```
- **Response**: `{ acknowledged: true; summary: string }` (optional, used to confirm the controller saw the update). A mismatch in ranges should trigger a rejection message from the main process and fall back to the previous valid configuration.

## click-session:start (renderer → main)
- **Purpose**: Trigger the automated clicking loop with the last known configuration (stationary delay, run duration, etc.).
- **Payload**: `void` (the main process already holds the configuration).  
- **Response**:
  ```ts
  {
    accepted: boolean;
    message: string; // e.g., "Waiting for 2 s of stillness"
  }
  ```
  `accepted` becomes `false` if the configuration is invalid or the automation layer is unavailable.

## click-session:stop (renderer → main)
- **Purpose**: Cancel any ongoing clicking immediately (Escape hotkey or stop button).  
- **Payload**: `void`.  
- **Response**: `{ stopped: true; reason?: string }` indicating the controller acknowledged the cancellation.

## click-session:status (main → renderer)
- **Purpose**: Stream state updates used by the indicator (idle, preparing, active, stopping, error).  
- **Payload**:
  ```ts
  {
    state: "idle" | "preparing" | "active" | "stopping" | "error";
    message?: string;
    runTimeSeconds?: number; // optional timer while active
  }
  ```
- **Frequency**: Emit on every meaningful change and at least once a second while active.

## click-session:motion-detected (main → renderer)
- **Purpose**: Inform the renderer that mouse movement interrupted a prepared or active session to update UI affordances.  
- **Payload**: `{ deltaPx: number; direction: { dx: number; dy: number } }` (used for logging rather than visuals).

## release:checksums (CI → renderer/docs)
- **Purpose**: Supply checksums for deterministic artifacts so the quickstart/REPRO.md can display them.  
- **Payload**:
  ```ts
  {
    artifacts: Array<{ name: string; sha256: string }>; 
    generatedAt: string;
    nodeVersion: string;
    electronVersion: string;
  }
  ```
```}{