import { crafts } from './specs/craft';

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

export interface ICircle {
  x: number;
  y: number;
  radius: number;
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
  assetKey: keyof typeof crafts;
  frameTextureKey: ETextureKey;
  life: number; // percentage
  rotation: number; // radian value
  points: number;
  scale?: number; // percentage - default to 1
  isYou?: boolean;
  kills?: number;
  hits?: number;
  shots?: number;
  deaths?: number;
}

export interface IPositionScale {
  position: IVector;
  scale: number;
}

export interface IRenderSfx {
  key: string;
  vol: number;
}

export interface ISfx extends IRenderSfx {
  position?: IVector;
}

export interface IRenderBullet {
  position: IVector;
  radius: number;
  life: number; // percentage
}

export interface IBullet extends IRenderBullet {
  isBullet: true;
  velocity: IVector;
  firedBy: string; // client id
  // assetKey: keyof typeof bullets;
  // frameTextureKey: ETextureKey;
  rotation: number; // radian value
  power: number;
  mass: number;
}

export interface IDebugInfo {
  value: number;
  desired?: number;
  max?: number;
}

export interface IGameRenderUpdate {
  cameraOffset: IVector;
  actors: IRenderActor[];
  nearestTarget?: {
    direction: number;
    distance: number;
    position: IVector;
  };
  bullets: IRenderBullet[];
  explosions: IPositionScale[];
  sfx: IRenderSfx[];
  fwdThrst?: number;
  trnThrst?: number;
  fire1?: number;
  debug?: Record<string, any>;
}

export interface ILeaderboardPosition {
  player: string;
  points: number;
  kills: number;
  hits: number;
  accuracy: number;
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
  joinGame: (craftKey: keyof typeof crafts) => void;
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
  leaderboard: (data: ILeaderboardPosition[]) => void;

  // user connection updates
  activeUsersUpdate: (users: IUser[]) => void;
  playerJoined: (user: IUser) => void;
  playerLeft: (user: IUser) => void;

  // examples
  // withAck: (d: string, callback: (e: number) => void) => void;
}
