import { Server, Socket } from 'socket.io';
import * as T from '../../shared/types';

export type TIOServer = Server<
  T.IClientToServerEvents,
  T.IServerToClientEvents,
  T.IInterServerEvents,
  T.IUser
>;
export type TClient = Socket<
  T.IClientToServerEvents,
  T.IServerToClientEvents,
  T.IInterServerEvents,
  T.IUser
>;

export interface IClient {
  socket: TClient;
  inGame: boolean;
  user: T.IUser;
  startedISO: string; // 2022-01-31T12:00:00.000Z
}

export interface IActor extends T.IRenderActor {
  uid: string;
  isBullet: boolean;
  velocity: T.IVector;
  shield: number;
  mass: number;
  power?: number; // collision power
  fuelCapacity: number;
  rotationSpeed?: number;
  radius: number;
}

// convenience - todo: optimize - should prob use playerToRenderActor func
export interface IPlayerState extends IActor {
  clientId: string;
}

export interface IServerGameState {
  players: IPlayerState[];
  actors: T.IRenderActor[];
  bullets: T.IBullet[];
  explosions: T.IPositionScale[];
}

// Memory storage for (temporary) data persistence
export interface IServerState {
  gameRunning: boolean;
  gamePaused: boolean;
  clients: IClient[];
  userInput: Record<string, IUserInputState>;
  deltaMs: number; // last delta ms between updates
  delta: number; // 1 = 60 updates per scond
  prevUpdateTime: number; // timestamp
  gameState: IServerGameState;
}

export enum EButtonStatus {
  DOWN,
  UP,
  INACTIVE,
}

export interface IButtonState {
  status: EButtonStatus;
  downMs: number;
}

export interface IUserInputState {
  fire1: IButtonState;
  activeActions: T.EInputAction[];
  forwardThruster: number; // between -1 and 1, negative is reverse
  turnThruster: number; // between -1 and 1, negative is turning left
  strafeThruster: number; // between -1 and 1, negative is strafing left
}
