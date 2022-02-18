import { IServerState } from '../types';

// =======================================================================================
// Memory storage for (temporary) data persistence
// =======================================================================================

export const serverState: IServerState = {
  gameRunning: false,
  gamePaused: false,
  clients: [],
  userInput: {},
  delta: 0,
  deltaMs: 0,
  prevUpdateTime: Date.now(),
  gameState: {
    players: [],
    actors: [],
    bullets: [],
  },
};
