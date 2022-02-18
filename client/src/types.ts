import { Socket } from 'socket.io-client';
import { crafts } from '../../shared/specs/craft';
import * as T from '../../shared/types';

export type TSocket = Socket<T.IServerToClientEvents, T.IClientToServerEvents>;

export interface ISettings {
  chunkSize: number;
  chunkRatio: [x: number, y: number];
}

export interface IPixiAppState {
  timeElapsedMs: number;
  delta: number; // pixi ticker delta
  deltaMs: number;
  fps: number;
  ticks: number;
  bigTicks: number;
  sinVariant: number;
}

export interface IClientState {
  socket?: TSocket;
  connected: boolean;
  activeUsers: T.IUser[];
  pingMs?: number;
  pingRoundtripMs?: number;
  gameState?: T.IGameRenderUpdate;
  pixiState: IPixiAppState;
  craftKey?: keyof typeof crafts;
}
