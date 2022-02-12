// BASIC TYPES and SHAPES
export interface IVector {
  x: number;
  y: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

export enum ETextureKey {
  CRAFT_DEFAULT,
  CRAFT_LEFT,
  CRAFT_RIGHT,
}
export interface IUser {
  username: string;
}

export interface IRenderActor {
  position: IVector;
  assetKey: string;
  frameTextureKey: ETextureKey;
  health: number; // percentage
  rotation: number; // radian value
  scale?: number; // percentage - default to 1
}

export interface IDebugInfo {
  value: number;
  desired?: number;
  max?: number;
}

export interface IGameRenderUpdate {
  cameraOffset: IVector;
  actors: IRenderActor[];
  fwdThrst?: number;
  trnThrst?: number;
  fire1?: number;
  debug?: Record<string, any>;
}

// API contract

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
