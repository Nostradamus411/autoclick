export type MouseButton = 'left' | 'middle' | 'right';

export interface ClickSessionConfiguration {
  button: MouseButton;
  clicksPerSecond: number;
  runDurationSeconds?: number;
  stationaryDelaySeconds?: number;
}

export type ClickSessionState = 'idle' | 'preparing' | 'active' | 'stopping' | 'error';

export interface ClickStatus {
  state: ClickSessionState;
  message?: string;
  runTimeSeconds?: number;
}

export interface MotionDetected {
  deltaPx: number;
  direction: { dx: number; dy: number };
}

export interface ReleaseArtifactHash {
  name: string;
  sha256: string;
}

export interface ReleaseMetadata {
  artifacts: ReleaseArtifactHash[];
  generatedAt: string;
  nodeVersion: string;
  electronVersion: string;
}
