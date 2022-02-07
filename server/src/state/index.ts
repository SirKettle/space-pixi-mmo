import { IServerState } from "../types";

// =======================================================================================
// Memory storage for (temporary) data persistence
// =======================================================================================

export const serverState: IServerState = {
  gameRunning: false,
  gamePaused: false,
  clients: [],
  userInput: {},
  deltaMs: 0,
  prevUpdateTime: Date.now(),
}
