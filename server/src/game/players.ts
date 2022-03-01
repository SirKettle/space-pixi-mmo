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
import { crafts } from '../../../shared/specs/craft';

export const updatePlayer = (p: IPlayerState): IPlayerState => {
  const player = { ...p };
  const userInput = serverState.userInput[p.clientId];
  const { delta, deltaMs } = serverState;
  if (!userInput) {
    return player;
  }

  const craftSpec = crafts[player.assetKey];

  if (!craftSpec) {
    return p;
  }

  const availableTextureKeys = craftSpec.frames.map((f) => f.key);

  // rotating the player
  player.frameTextureKey = ETextureKey.CRAFT_DEFAULT;

  player.velocity = applyAtmosphereToVelocity({
    velocity: player.velocity,
    atmosphere: 0.05,
    gravity: 0,
    factor: player.isBullet ? 0.3 : 1,
    delta,
  });

  if (player.life > 0) {
    player.velocity = applyThrusters({
      rotation: player.rotation,
      velocity: player.velocity,
      // TODO: use spec to apply config thrusters
      forwardThrust: userInput.forwardThruster,
      forwardThrustEngineOutput:
        userInput.forwardThruster > 0
          ? craftSpec.thrust.forward
          : craftSpec.thrust.reverse,
      sideThrust: userInput.strafeThruster,
      sideThrustEngineOutput: craftSpec.thrust.side,
      delta,
    });

    if (userInput.turnThruster !== 0) {
      // todo: use pixi one logic
      player.rotation = normalizeDirection(
        player.rotation + userInput.turnThruster * delta * craftSpec.thrust.turn
      );

      player.frameTextureKey =
        userInput.turnThruster < 0
          ? ETextureKey.CRAFT_LEFT
          : ETextureKey.CRAFT_RIGHT;
    }
  }

  player.position = updatePosition({
    position: player.position,
    velocity: player.velocity,
    delta,
  });

  // this defaults textureKey if not available for craft
  if (!availableTextureKeys.includes(player.frameTextureKey)) {
    player.frameTextureKey = availableTextureKeys[0];
  }

  return player;
};

export const updateAllPlayers = () => {
  serverState.gameState.players =
    serverState.gameState.players.map(updatePlayer);
};

export const playerToRender = (player: IPlayerState): IRenderActor => {
  const renderActorKeys = [
    'uid',
    'position',
    'assetKey',
    'frameTextureKey',
    'life',
    'rotation',
    'scale',
    'isYou',
    // 'shots',
    // 'hits',
    // 'kills',
    // 'deaths',
    // 'points',
  ];
  return pick(renderActorKeys, player);
};
