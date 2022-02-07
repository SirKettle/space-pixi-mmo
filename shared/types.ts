
export enum EInputAction {
  FORWARD = 'FORWARD',
  REVERSE = 'REVERSE',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  STRAFE_LEFT = 'STRAFE_LEFT',
  STRAFE_RIGHT = 'STRAFE_RIGHT',
  FIRE_1 = 'FIRE_1',
  FIRE_2 = 'FIRE_2',
}

export interface IUser {
  username: string;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IActor {
  isHuman: boolean;
  user?: IUser;
  position: IPoint;
}

export interface IGameUpdate {
  deltaMs: number;
  timeElapsedMs: number;
  actors: IActor[];
}

export interface IRenderActor {
  position: IPoint;
  type: string;
  health: string;
  direction: number;
  scale?: number;
}

export interface IDebugInfo {
  value: number;
  desired?: number;
  max?: number;
}

export interface IGameRenderUpdate {
  cameraOffset: IPoint;
  actors: IRenderActor[];
  fwdThrst?: number;
  trnThrst?: number;
  fire1?: number;
  debug?: Record<string, any>;
}


export interface IClientToServerEvents {
  login: () => void;

  // latency / testing
  pingTest: (startTimestamp: number) => void;

  // input controls
  keyDown: (action: EInputAction) => void;
  keyUp: (action: EInputAction) => void;
  toggleDebug: () => void;
  joinGame: () => void;
  leaveGame: () => void;
  pauseGame: () => void;
}

export interface IInterServerEvents {
  ping: () => void;
  // playerJoined: (session: ISession) => void;
  // playerLeft: (session: ISession) => void;
}

export interface IServerToClientEvents {
  // latency / testing
  pingTestResponse: (startTimestamp: number) => void;
  
  // game state update
  update: (data: IGameRenderUpdate) => void;

  // user connection updates
  activeUsersUpdate: (users: IUser[]) => void;
  playerJoined: (user: IUser) => void;
  playerLeft: (user: IUser) => void;

  // examples
  // withAck: (d: string, callback: (e: number) => void) => void;
}

export interface IUser {
  username: string;
}

// Memory storage for (temporary) data persistence
export interface IGameSnapshot {
}