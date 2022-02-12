import { ETextureKey, IRenderActor } from '../../../shared/types';
import { normalizeDirection } from '../../../shared/utils/physics';
import { IPlayerState } from '../types';
import { pick } from 'ramda';
import { serverState } from '../state';
import {
  applyAtmosphereToVelocity,
  applyThrusters,
  updatePosition,
} from './actor';

const craftTurningSpeed = 0.08;

export const updatePlayer = (p: IPlayerState): IPlayerState => {
  const player = { ...p };
  const userInput = serverState.userInput[p.clientId];
  const { delta, deltaMs } = serverState;
  if (!userInput) {
    return player;
  }

  // rotating the player
  player.frameTextureKey = ETextureKey.CRAFT_DEFAULT;

  if (userInput.turnThruster !== 0) {
    // todo: use pixi one logic
    player.rotation = normalizeDirection(
      player.rotation + userInput.turnThruster * delta * craftTurningSpeed
    );

    player.frameTextureKey =
      userInput.turnThruster < 0
        ? ETextureKey.CRAFT_LEFT
        : ETextureKey.CRAFT_RIGHT;
  }

  player.velocity = applyAtmosphereToVelocity({
    velocity: player.velocity,
    atmosphere: 0.05,
    gravity: 0,
    factor: player.isBullet ? 0.3 : 1,
    delta,
  });

  // moving the player - TODO
  player.velocity = applyThrusters({
    rotation: player.rotation,
    velocity: player.velocity,
    forwardThrust: userInput.forwardThruster,
    sideThrust: userInput.strafeThruster,
    delta,
  });

  player.position = updatePosition({
    position: player.position,
    velocity: player.velocity,
    delta,
  });

  return player;
};

export const updateAllPlayers = () => {
  serverState.gameState.players =
    serverState.gameState.players.map(updatePlayer);
};

export const playerToRender = (player: IPlayerState): IRenderActor => {
  const renderActorKeys = [
    'position',
    'assetKey',
    'frameTextureKey',
    'health',
    'rotation',
    'scale',
  ];
  return pick(renderActorKeys, player);
};
