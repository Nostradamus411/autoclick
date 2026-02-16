export const IPC_CHANNELS = {
  setConfig: 'click-session:set-config',
  start: 'click-session:start',
  stop: 'click-session:stop',
  status: 'click-session:status',
  motion: 'click-session:motion-detected',
  releaseChecksums: 'release:checksums',
} as const;
