import { IClientState, ISettings } from '~types';

export const clientState: IClientState = {
  connected: false,
  activeUsers: [],
  pixiState: {
    delta: 0,
    deltaMs: 0,
    fps: 0,
    timeElapsedMs: 0,
    ticks: 0,
    bigTicks: 0,
    sinVariant: 0,
  },
};

export const settings: ISettings = {
  chunkSize: 256,
  chunkRatio: [4, 3],
};

export const updatePixiState = (delta: number, deltaMS: number) => {
  const { pixiState } = clientState;
  pixiState.delta = delta;
  pixiState.deltaMs = deltaMS;
  pixiState.fps = Math.round(1000 / pixiState.deltaMs);
  pixiState.timeElapsedMs += pixiState.deltaMs;
  pixiState.ticks += 1;
  pixiState.sinVariant = (1 + Math.sin(pixiState.timeElapsedMs / 100)) * 0.5;

  if (pixiState.ticks > 9999) {
    pixiState.bigTicks += 1;
    pixiState.ticks = 0;
  }
};
